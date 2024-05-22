const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('message')
        .setDescription('» Sendet eine Nachricht an ein Nutzer per Direktnachricht. 💬')
        .addUserOption(option => option.setName('user').setDescription('» Der Benutzer, an den die Nachricht gesendet werden soll').setRequired(true))
        .addStringOption(option => option.setName('nachricht').setDescription('» Die Nachricht, die gesendet werden soll').setRequired(true))
        .setDefaultMemberPermissions(PermissionsBitField.ManageRoles),

    async execute(interaction) {
        // Benutzer und Nachrichteninhalt aus den Optionen erhalten
        const member = interaction.options.getMember('user');
        const message = interaction.options.getString('nachricht');

        // Embed für die DM-Nachricht erstellen
        const Nachrichtembed = new EmbedBuilder()
            .setTitle('Du hast eine neue Nachricht!')
            .setDescription(`» Hallo, ${member} du hast gerade eine neue Nachricht von \`${interaction.user.displayName}\` bekommen.\n\n> \`💬\` » Nachricht: \`${message}\`\n\n> \`🚑\` » Öffne ein Ticket im Support bei Fragen oder Problemen.`)
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        // Nachricht und Embed an den Benutzer per DM senden
        try {
            await member.send({ embeds: [Nachrichtembed] });
            await interaction.reply({ content: `> \`✅\` » Ich habe die Nachricht erfolgreich an ${member} gesendet!`, ephemeral: true });
        } catch (error) {
            console.error(`Fehler beim Senden der Nachricht an ${member}:`, error);
            await interaction.reply({ content: `> \`❌\` » Beim Senden der Nachricht an ${member} ist ein Fehler aufgetreten.\nBitte schau im Server-Log nach oder melde dich bei einem Admin.`, ephemeral: true });
        }
    },
};