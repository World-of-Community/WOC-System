import { EmbedBuilder } from "discord.js";
import { eventPeriods, isEventActive } from "../../functions/seasonEvents.js";

export default {
    id: 'christmas_event',
    run: async (client, interaction) => {
        const WeihnachtsEmbed = new EmbedBuilder()
            .setTitle('`🎄` Weihnachts-Event `🎄`')
            .setDescription(isEventActive(eventPeriods.christmas) ? '**Das Weihnachts-Event ist aktiv! Genieße die festliche Stimmung!**' : '**Dieses Event findet erst zwischen dem `20. Dezember` und dem `26. Dezember` statt!**')
            .setColor('DarkBlue');

        await interaction.reply({ embeds: [WeihnachtsEmbed], ephemeral: true });
    }
};
