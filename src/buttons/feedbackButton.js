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
        
        if (!interaction.guild) {
            return;
        }

        try {
            // --- Feedback-Ticket erstellen ---
            if (interaction.isButton() && interaction.customId === 'create_feedback_ticket') {
                
                if (interaction.replied || interaction.deferred) {
                    return;
                }
                
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
                return;
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

                await interaction.reply({
                    content: `<@${interaction.user.id}>`,
                    embeds: [decisionEmbed],
                    components: [decisionButtons],
                    ephemeral: false
                });
                return;
            }

            // --- Akzeptieren & schließen ---
            if (interaction.isButton() && interaction.customId === 'feedback_accept_close') {
                
                // Defer immediately to prevent timeout
                await interaction.deferUpdate();
                
                const acceptEmbed = new EmbedBuilder()
                    .setTitle('`🗑️` » Ticket wird geschlossen')
                    .setDescription('Dieses Ticket wird in **5 Sekunden** geschlossen.')
                    .setColor('Green');

                await interaction.editReply({
                    embeds: [acceptEmbed],
                    components: []
                });

                setTimeout(async () => {
                    if (interaction.channel?.isThread()) {
                        await interaction.channel.setArchived(true, 'Feedback-Ticket geschlossen').catch((err) => {
                        });
                    } else if (interaction.channel?.deletable) {
                        // Fallback no longer used
                        await interaction.channel.delete().catch((err) => {
                        });
                    } else {
                        console.log('[FEEDBACK-BUTTON] Channel/Thread not closeable');
                    }
                }, 5000);
                return;
            }

            // --- Ablehnen & offen lassen ---
            if (interaction.isButton() && interaction.customId === 'feedback_reject_open') {
                
                // Defer immediately to prevent timeout
                await interaction.deferUpdate();
                
                const rejectEmbed = new EmbedBuilder()
                    .setTitle('`🔓` » Ticket bleibt weiterhin offen')
                    .setDescription('Das Ticket bleibt weiterhin geöffnet.')
                    .setColor('Red');

                await interaction.editReply({
                    embeds: [rejectEmbed],
                    components: []
                });
                return;
            }

        } catch (err) {
            try {
                if (!interaction.replied && !interaction.deferred) {
                    await interaction.reply({
                        content: '> `❌` » Es ist ein Fehler beim Ausführen dieser Aktion aufgetreten.',
                        ephemeral: true
                    });
                }
            } catch (replyErr) {
                console.error('[FEEDBACK-BUTTON] Failed to send error message:', replyErr);
            }
        }
    }
};
