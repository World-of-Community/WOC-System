import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export default {
    name: "feedback",
    description: "» Sendet das Feedback-System in den aktuellen Kanal.",
    type: 1,
    default_member_permissions: "268435456",
    options: [],

    async run(client, interaction) {
        console.log(`[FEEDBACK-SYSTEM] Command executed by ${interaction.user.tag} in ${interaction.guild?.name}`);

        try {
            // Defer the reply immediately to prevent timeout
            await interaction.deferReply({ ephemeral: true });

            // Hauptbild-Embed (Banner)
            const bannerEmbed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1280172685694996572/WOC_Banner_Information_Feedback.jpg');

            // Text-Embed (Beschreibung)
            const infoEmbed = new EmbedBuilder()
                .setColor('#00FFFF')
                .setTitle('Feedback')
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
            await interaction.editReply({
                ephemeral: true,
                content: '> `✅` » Das **Feedback-System** wurde erfolgreich gesendet.'
            });

        } catch (err) {
            try {
                if (interaction.deferred) {
                    await interaction.editReply({
                        content: '> `❌` » Beim Senden des Feedback-Systems ist ein Fehler aufgetreten.'
                    });
                } else if (!interaction.replied) {
                    await interaction.reply({
                        content: '> `❌` » Beim Senden des Feedback-Systems ist ein Fehler aufgetreten.',
                        ephemeral: true
                    });
                }
            } catch (replyErr) {
                console.error('[FEEDBACK-SYSTEM] Failed to send error message:', replyErr);
            }
        }
    },
};
