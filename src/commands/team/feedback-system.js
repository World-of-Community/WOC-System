const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionFlagsBits
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('» Sendet das Feedback-System in den aktuellen Kanal.')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        try {
            // Hauptbild-Embed (Banner)
            const bannerEmbed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1280172685694996572/WOC_Banner_Information_Feedback.jpg');

            // Text-Embed (Beschreibung)
            const infoEmbed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setTitle('💬 » Feedback')
                .setDescription(
                    'Du hast eine **Idee**, einen **Verbesserungsvorschlag** oder möchtest ein **Feature** anregen?\n' +
                    'Dann eröffne jetzt ein **Feedback-Ticket** und teile deine Gedanken mit uns! 💡'
                )
                .setImage('https://imgur.com/kekDug7.png')
                .setFooter({ text: 'Wir freuen uns über jedes Feedback!' });

            // Button für Feedback-Erstellung
            const feedbackButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('create_feedback_ticket')
                    .setLabel('🗳️ Ticket öffnen')
                    .setStyle(ButtonStyle.Primary)
            );

            // Nachricht senden
            await interaction.channel.send({
                embeds: [bannerEmbed, infoEmbed],
                components: [feedbackButton]
            });

            // Bestätigung
            await interaction.reply({
                content: '> `✅` » Das **Feedback-System** wurde erfolgreich gesendet.',
                ephemeral: true
            });

        } catch (err) {
            console.error('Fehler beim Senden des Feedback-Embeds:', err);
            return interaction.reply({
                content: '> `❌` » Beim Senden des Feedback-Systems ist ein Fehler aufgetreten.',
                ephemeral: true
            });
        }
    },
};
