/*
const { EmbedBuilder } = require('discord.js');
const { isEventActive, eventPeriods } = require('../../functions/events');

module.exports = {
	id: 'newyear_event',
	run: async (client, interaction) => {
        const SilvesterEmbed = new EmbedBuilder()
          .setTitle('`🎆` Silvester Event `🎆`')
          .setDescription(isEventActive(eventPeriods.newyear) ? '**Das Silvester-Event ist aktiv! Feiere das neue Jahr mit uns!**' : '**Dieses Event findet erst zwischen dem `27. Dezember` und dem `02. Januar` statt!**')
          .setColor(isEventActive(eventPeriods.newyear) ? 'Grey' : 'Grey');

        await interaction.reply({ embeds: [SilvesterEmbed], ephemeral: true });
    }
};
*/
