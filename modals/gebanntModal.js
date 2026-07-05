import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";

export default {
    id: 'gebannt-modal',
    run: async (client, interaction) => {
        const bannInfo = interaction.fields.getTextInputValue('banngrund');
        const bannDescription = interaction.fields.getTextInputValue('entbannungsbeschreibung');

        interaction.guild.channels.create({
            name: `unban-${interaction.user.username}`,
            type: ChannelType.GuildText,
            parent: "886985648714682439", // Kategorie-ID anpassen
        }).then(async channel => {
            const buttons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_erledigt')
                    .setLabel('✅ » Erledigt')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_schliessen')
                    .setLabel('❌ » Schließen')
                    .setStyle(ButtonStyle.Secondary)
            );

            const bannsupport = interaction.guild.roles.cache.get('1209101841015504916');

            const bannEmbed = new EmbedBuilder()
                .setTitle("`⛔` 𑁉 Entbannungsantrag")
                .setDescription(
                    `Ein neuer Entbannungsantrag wurde erstellt.\n\n` +
                    `> \`📄\` » **Banngrund**\n${bannInfo}\n\n` +
                    `> \`📝\` » **Entbannungsbeschreibung**\n${bannDescription}\n\n` +
                    `> \`👤\` » **Antragsteller**\n<@${interaction.user.id}>\n\n` +
                    `> \`📅\` » **Erstellungsdatum**\n<t:${Math.floor(Date.now() / 1000)}:F>`
                )
                .setColor("Red")
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `» Antrag von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

            channel.send({
                content: `<@&${bannsupport.id}>`,
                embeds: [bannEmbed],
                components: [buttons]
            });

            const InfoBannEmbed = new EmbedBuilder()
                .setDescription(`\`✅\` » Du hast **erfolgreich** ein Ticket für deinen Entbannungsantrag erstellt, du kannst diesen hier erreichen: ${channel}`)
                .setColor('Green');

            interaction.reply({ embeds: [InfoBannEmbed], ephemeral: true });
        });
    }
};
