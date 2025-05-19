const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('» Entbanne einen User. 🔓')
        .addUserOption(option =>
            option.setName('user').setDescription('» Welcher User soll entbannt werden?').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');

        if (!user) {
            return interaction.reply({ content: '> `❌` » Der Benutzer wurde nicht gefunden.', ephemeral: true });
        }

        // Log-Kanal und Thread IDs
        const logChannelId = "1263436406655680513";
        const threadId = "1269998219266490538";

        // Log-Kanal holen
        const logChannel = interaction.guild.channels.cache.get(logChannelId);
        if (!logChannel) {
            return interaction.reply({ content: '> `❌` » Log-Kanal konnte nicht gefunden werden.', ephemeral: true });
        }

        // Thread versuchen aus Cache zu holen
        let thread = logChannel.threads.cache.get(threadId);

        // Wenn nicht im Cache, versuche ihn zu laden
        if (!thread) {
            try {
                thread = await interaction.client.channels.fetch(threadId);
            } catch (error) {
                console.error('Thread konnte nicht geladen werden:', error);
                return interaction.reply({ content: '> `❌` » Thread konnte nicht geladen werden.', ephemeral: true });
            }
        }

        // Thread Status prüfen
        if (thread.archived) {
            return interaction.reply({ content: '> `❌` » Der Thread ist archiviert und kann keine Nachrichten empfangen.', ephemeral: true });
        }
        if (thread.locked) {
            return interaction.reply({ content: '> `❌` » Der Thread ist gesperrt und kann keine Nachrichten empfangen.', ephemeral: true });
        }

        // Rechte des Bots im Thread prüfen
        const botMember = interaction.guild.members.me;
        const perms = thread.permissionsFor(botMember);

        if (!perms || !perms.has("SendMessages")) {
            return interaction.reply({ content: '> `❌` » Ich habe keine Rechte, um im Thread zu schreiben.', ephemeral: true });
        }

        try {
            // User entbannen
            await interaction.guild.members.unban(user.id);

            // Embed erstellen
            const unbanEmbed = new EmbedBuilder()
                .setTitle(`\`🔓\` - ${user.username} wurde entbannt.`)
                .setDescription(`${user} wurde von ${interaction.user} entbannt.\n\n> **Benutzername:** ${user.tag} (\`${user.id}\`)\n> **Entbannt am:** <t:${Math.floor(Date.now() / 1000)}>` )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor('Green')
                .setFooter({ text: `©️ ${interaction.guild.name} | Unban-System`, iconURL: interaction.client.user.displayAvatarURL() });

            // Embed im Thread senden
            await thread.send({ embeds: [unbanEmbed] });

            // Erfolgsmeldung an den Interaktionsstarter
            await interaction.reply({ content: `> \`✅\` » ${user} wurde erfolgreich entbannt.`, ephemeral: true });

        } catch (error) {
            console.error("Fehler beim Entbannen:", error);
            return interaction.reply({ content: '> `❌` » Fehler beim Entbannen des Benutzers.', ephemeral: true });
        }
    }
};
