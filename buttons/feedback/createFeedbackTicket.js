import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

export default {
    id: 'create_feedback_ticket',
    run: async (client, interaction) => {
        if (!interaction.guild) return;
        if (interaction.replied || interaction.deferred) return;

        const feedbackModal = new ModalBuilder()
            .setTitle('Feedback einreichen')
            .setCustomId('feedback-modal');

        const titleInput = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('feedback-title')
                .setLabel('Kurztitel des Themas')
                .setPlaceholder('z.B. "Spielmodi", "Event-Idee", "Feature-Wunsch"')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
        );

        const descriptionInput = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('feedback-description')
                .setLabel('Detaillierte Beschreibung')
                .setPlaceholder('Beschreibe hier dein Feedback ausführlich...')
                .setMinLength(50)
                .setMaxLength(1024)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
        );

        feedbackModal.addComponents(titleInput, descriptionInput);
        await interaction.showModal(feedbackModal);
    }
};
