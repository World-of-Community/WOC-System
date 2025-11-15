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
        
        //if (!interaction.isButton()) return;

        if (interaction.isButton() && interaction.customId === 'gebannt-ticket') {
            const { ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

            const gebanntModal = new ModalBuilder()
                .setTitle('⛔ - ENTBANNUNGSTICKET')
                .setCustomId('gebannt-modal');

            const BanngrundInput = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('banngrund')
                    .setLabel('Gebe deinen Banngrund an')
                    .setPlaceholder('Wieso wurdest du gebannt?')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );

            const EntbannungsbeschreibungInput = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('entbannungsbeschreibung')
                    .setLabel('Wieso möchtest du wieder entbannt werden?')
                    .setPlaceholder('Gebe hier deine Entbannungsbeschreibung an.')
                    .setMinLength(5)
                    .setMaxLength(4000)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            );

            gebanntModal.addComponents(BanngrundInput, EntbannungsbeschreibungInput);
            return interaction.showModal(gebanntModal);
        }

        if (interaction.customId === 'ticket_erledigt') {
            const mention = interaction.message.content;
            const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription("Danke für deine Meldung, wir haben es erledigt oder in Bearbeitung genommen.");

            return interaction.reply({ content: mention, embeds: [embed] });
        }

        if (interaction.customId === 'ticket_close_deny') {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`${interaction.user} hat sich dazu entschieden nicht das Ticket zu schließen`);

            return interaction.update({ embeds: [embed], components: [] });
        }

        if (interaction.customId === 'ticket_close_accept') {
            const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Das Ticket wird in \`5 Sekunden\` geschlossen.`);

            await interaction.update({ embeds: [embed], components: [] });
            setTimeout(async () => {
                await interaction.channel.delete().catch(() => {});
            }, 5000);
            return;
        }

        if (interaction.customId === 'ticket_schliessen') {
            const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle("`❓` » Schließ Anfrage")
                .setDescription(`${interaction.user} hat das Schließen dieses Tickets angefordert.\n\nBitte akzeptiere oder verweigere mit den untenstehenden Schaltflächen.`);

            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_close_accept')
                    .setLabel('✅ » Akzeptieren & Schließen')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_close_deny')
                    .setLabel('❌ » Ablehnen & Offen lassen')
                    .setStyle(ButtonStyle.Secondary)
            );

            return interaction.reply({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [buttons] });
        }
    }
};
