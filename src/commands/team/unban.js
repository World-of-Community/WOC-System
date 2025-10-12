const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const ms = require("ms");
const bandb = require("../../../Datenbank/bandb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("» Entbanne einen User. 🔓")
        .addUserOption(option =>
            option.setName("user")
                .setDescription("» Welcher User soll entbannt werden?")
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser("user");

        if (!user) {
            return interaction.reply({ content: "> `❌` » Der Benutzer wurde nicht gefunden.", ephemeral: true });
        }

        // IDs für Log-System
        const logChannelId = "1263436406655680513";
        const threadId = "1269998219266490538";

        // Log-Kanal prüfen
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (!logChannel) {
            return interaction.reply({ content: "> `❌` » Log-Kanal konnte nicht gefunden werden.", ephemeral: true });
        }

        // Thread laden
        let thread;
        try {
            thread = logChannel.threads.cache.get(threadId) || await interaction.client.channels.fetch(threadId);
        } catch (err) {
            console.error("Thread konnte nicht geladen werden:", err);
            return interaction.reply({ content: "> `❌` » Thread konnte nicht geladen werden.", ephemeral: true });
        }

        // Thread-Status prüfen
        if (!thread || thread.archived || thread.locked) {
            return interaction.reply({ content: "> `❌` » Der Thread ist nicht verfügbar (archiviert oder gesperrt).", ephemeral: true });
        }

        // Bot-Berechtigungen prüfen
        const botMember = interaction.guild.members.me;
        const perms = thread.permissionsFor(botMember);
        if (!perms || !perms.has("SendMessages")) {
            return interaction.reply({ content: "> `❌` » Ich habe keine Rechte, um im Thread zu schreiben.", ephemeral: true });
        }

        try {
            // ✅ Erst prüfen, ob User überhaupt gebannt ist
            let banInfo;
            try {
                banInfo = await interaction.guild.bans.fetch(user.id);
            } catch (err) {
                if (err.code === 10026) {
                    return interaction.reply({ content: `> \`❌\` » ${user} ist nicht gebannt oder wurde bereits entbannt.`, ephemeral: true });
                }
                throw err;
            }

            // Wenn gebannt, dann entbannen
            await interaction.guild.bans.remove(user.id, `Entbannt von ${interaction.user.tag}`);

            // Embed erstellen
            const unbanEmbed = new EmbedBuilder()
                .setTitle("`🔓` - Nutzer entbannt")
                .setDescription(`${user} wurde von ${interaction.user} entbannt.\n\n> **Benutzername:** ${user.tag} (\`${user.id}\`)\n> **Entbannt am:** <t:${Math.floor(Date.now() / 1000)}:F>`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor("Green")
                .setFooter({ text: `©️ ${interaction.guild.name} | Unban-System`, iconURL: interaction.client.user.displayAvatarURL() });

            // Embed im Thread posten
            await thread.send({ embeds: [unbanEmbed] });

            // Erfolgsmeldung an Command-Nutzer
            await interaction.reply({ content: `> \`✅\` » ${user} wurde erfolgreich entbannt.`, ephemeral: true });

        } catch (error) {
            console.error("Fehler beim Entbannen:", error);

            // Bekannte Fehler abfangen
            if (error.code === 10026) {
                return interaction.reply({ content: `> \`❌\` » ${user} ist nicht gebannt oder wurde bereits entbannt.`, ephemeral: true });
            } else if (error.code === 50013) {
                return interaction.reply({ content: "> `❌` » Ich habe nicht genügend Rechte, um diesen Benutzer zu entbannen.", ephemeral: true });
            } else {
                return interaction.reply({ content: "> `⚠️` » Unerwarteter Fehler beim Entbannen. Bitte überprüfe die Logs.", ephemeral: true });
            }
        }
    }
};
