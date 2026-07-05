import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export default {
    id: 'ticket_schliessen',
    run: async (client, interaction) => {
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
};
