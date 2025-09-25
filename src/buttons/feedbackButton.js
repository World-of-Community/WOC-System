const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Feedback-Ticket erstellen (Button)
        if (interaction.isButton() && interaction.customId === 'create_feedback_ticket') {
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
                    .setMaxLength(4000)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            );

            feedbackModal.addComponents(titleInput, descriptionInput);
            return interaction.showModal(feedbackModal);
        }

        // Ticket schließen (Button)
        if (interaction.isButton() && interaction.customId === 'close_feedback_ticket') {
            const decisionEmbed = new EmbedBuilder()
                .setTitle('`❓` » Schließ-Anfrage')
                .setDescription(`${interaction.user} hat das Schließen dieses Tickets angefordert.\n\nBitte akzeptiere oder verweigere mit den untenstehenden Schaltflächen.`)
                .setColor('Blurple');

            const decisionButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('feedback_accept_close')
                    .setLabel('Akzeptieren & schließen')
                    .setEmoji("☑️")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('feedback_reject_open')
                    .setLabel('Ablehnen & offen lassen')
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary)
            );

            return interaction.reply({
                content: `<@${interaction.user.id}>`,
                embeds: [decisionEmbed],
                components: [decisionButtons],
                ephemeral: false
            });
        }

        // Akzeptieren & Ticket schließen
        if (interaction.isButton() && interaction.customId === 'feedback_accept_close') {
            const acceptEmbed = new EmbedBuilder()
                .setTitle('`🗑️` » Ticket wird geschlossen')
                .setDescription('Dieses Ticket wird in **5 Sekunden** geschlossen.')
                .setColor('Green');

            await interaction.update({
                embeds: [acceptEmbed],
                components: []
            });

            setTimeout(() => {
                interaction.channel.delete().catch(console.error);
            }, 5000);
        }

        // Ablehnen & Ticket bleibt offen
        if (interaction.isButton() && interaction.customId === 'feedback_reject_open') {
            const rejectEmbed = new EmbedBuilder()
                .setTitle('`🔓` » Ticket bleibt weiterhin offen')
                .setDescription('Das Ticket bleibt weiterhin geöffnet.')
                .setColor('Red');

            return interaction.update({
                embeds: [rejectEmbed],
                components: []
            });
        }
    }
};
