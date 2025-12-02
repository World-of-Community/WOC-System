/*
const { EmbedBuilder } = require('discord.js');
const { isEventActive, eventPeriods } = require('../../functions/events');

module.exports = {
	id: 'halloween_event',
	run: async (client, interaction) => {
        const HalloweenEmbed = new EmbedBuilder()
          .setTitle('`🎃` Halloween Event `🎃`')
          .setDescription(isEventActive(eventPeriods.halloween) ? '**Das Halloween-Event ist aktiv! Viel Spaß beim Gruseln!**' : '**Dieses Event findet erst zwischen dem `27. Oktober` und dem `02. November` statt!**')
          .setColor(isEventActive(eventPeriods.halloween) ? 'Orange' : 'Orange');

        await interaction.reply({ embeds: [HalloweenEmbed], ephemeral: true });
    }
};
*/
