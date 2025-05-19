const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const bandb = require("../../../Datenbank/bandb");

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

        const logChannel = interaction.guild.channels.cache.get("1263436406655680513");
        const thread = logChannel?.threads.cache.get("1269998219266490538");

        if (!logChannel || !thread) {
            return interaction.reply({ content: '> `❌` » Log-Kanal oder Thread konnte nicht gefunden werden.', ephemeral: true });
        }

        try {
            // Entbannen des Benutzers
            await interaction.guild.members.unban(user.id);

            // Embed erstellen
            const unbanEmbed = new EmbedBuilder()
                .setTitle(`\`🔓\` - ${user.username} wurde entbannt.`)
                .setDescription(`${user} wurde von ${interaction.user} entbannt.\n\n> **Benutzername:** ${user.tag} (\`${user.id}\`)\n> **Entbannt am:** <t:${Math.floor(Date.now() / 1000)}>` )
                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                .setColor('Green')
                .setFooter({ text: `©️ ${interaction.guild.name} | Unban-System`, iconURL: interaction.client.user.displayAvatarURL() });

            // Loggen im Thread
            await thread.send({ embeds: [unbanEmbed] });

            // Antwort an Interaktionsaufrufer
            await interaction.reply({ content: `> \`✅\` » ${user} wurde erfolgreich entbannt.`, ephemeral: true });
        } catch (error) {
            console.error("Fehler beim Entbannen:", error);
            return interaction.reply({ content: '> `❌` » Fehler beim Entbannen des Benutzers.', ephemeral: true });
        }
    }
};
