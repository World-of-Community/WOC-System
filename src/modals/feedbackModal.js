const {
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    async execute(interaction) {
        if (interaction.isModalSubmit() && interaction.customId === 'feedback-modal') {
            const title = interaction.fields.getTextInputValue('feedback-title');
            const description = interaction.fields.getTextInputValue('feedback-description');

            const ticketName = `feedback-${interaction.user.username.toLowerCase()}`;
            const categoryId = '886985648714682439'; // Feedback-Kategorie
            const supportRoleId = '1011207481357238272'; // Team-Rolle

            const existingChannel = interaction.guild.channels.cache.find(c => c.name === ticketName);
            if (existingChannel) {
                return interaction.reply({ content: '> ⚠️ Du hast bereits ein offenes Feedback-Ticket.', ephemeral: true });
            }

            const ticketChannel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
                    },
                    {
                        id: supportRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                ],
            });

            const ticketEmbed = new EmbedBuilder()
                .setDescription(`**Hey ${interaction.user}!**\n\nDanke für dein Feedback!\nDein Ticket wird zeitnah von unserem Server-Team bearbeitet.`)
                .setColor('Aqua')
                .setImage('https://imgur.com/kekDug7.png');

            const ticketEmbed2 = new EmbedBuilder()
                .setDescription(`**Kurztitel des Themas**\n${title}\n\n**Detaillierte Beschreibung**\n${description}`)
                .setColor('Aqua')
                .setImage('https://imgur.com/kekDug7.png');

            const closeButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_feedback_ticket')
                    .setLabel('❌ Ticket schließen')
                    .setStyle(ButtonStyle.Secondary)
            );

            await ticketChannel.send({
                embeds: [ticketEmbed, ticketEmbed2],
                components: [closeButtonRow]
            });

            await interaction.reply({ content: `> \`✅\` » Dein **Feedback-Ticket** wurde erstellt: ${ticketChannel}`, ephemeral: true });
        }
    }
};
