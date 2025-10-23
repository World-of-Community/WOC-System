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
        if (!interaction.guild) return; // verhindert Nutzung in DMs

        try {
            // --- Feedback-Ticket erstellen ---
            if (interaction.isButton() && interaction.customId === 'create_feedback_ticket') {
                if (interaction.replied || interaction.deferred) return; // verhindert Doppelmodal
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

            // --- Ticket schließen ---
            if (interaction.isButton() && interaction.customId === 'close_feedback_ticket') {
                const decisionEmbed = new EmbedBuilder()
                    .setTitle('`❓` » Schließ-Anfrage')
                    .setDescription(`${interaction.user} hat das Schließen dieses Tickets angefordert.\n\nBitte akzeptiere oder verweigere mit den untenstehenden Schaltflächen.`)
                    .setColor('#5865F2');

                const decisionButtons = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('feedback_accept_close')
                        .setLabel('Akzeptieren & schließen')
                        .setEmoji('☑️')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('feedback_reject_open')
                        .setLabel('Ablehnen & offen lassen')
                        .setEmoji('❌')
                        .setStyle(ButtonStyle.Secondary)
                );

                return interaction.reply({
                    content: `<@${interaction.user.id}>`,
                    embeds: [decisionEmbed],
                    components: [decisionButtons],
                    ephemeral: false
                });
            }

            // --- Akzeptieren & schließen ---
            if (interaction.isButton() && interaction.customId === 'feedback_accept_close') {
                const acceptEmbed = new EmbedBuilder()
                    .setTitle('`🗑️` » Ticket wird geschlossen')
                    .setDescription('Dieses Ticket wird in **5 Sekunden** geschlossen.')
                    .setColor('Green');

                await interaction.update({
                    embeds: [acceptEmbed],
                    components: []
                });

                setTimeout(async () => {
                    if (interaction.channel?.deletable) {
                        await interaction.channel.delete().catch(() => {});
                    }
                }, 5000);
            }

            // --- Ablehnen & offen lassen ---
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

        } catch (err) {
            console.error('Feedback-Handler-Fehler:', err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '> `❌` » Es ist ein Fehler beim Ausführen dieser Aktion aufgetreten.',
                    ephemeral: true
                });
            }
        }
    }
};
