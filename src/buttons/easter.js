/*
const { EmbedBuilder } = require('discord.js');
const { isEventActive, eventPeriods } = require('../../functions/events');

module.exports = {
	id: 'easter_event',
	run: async (client, interaction) => {
		const OsterEmbed = new EmbedBuilder()
			.setTitle('`🐇` Oster Event `🐇`')
			.setDescription(isEventActive(eventPeriods.easter) ? '**Das Oster-Event ist aktuell aktiv! Viel Spaß beim Sammeln der Oster-Eier!**' : '**Dieses Event startet erst zwischen den Monaten `März` und `April`!**')
			.setColor(isEventActive(eventPeriods.easter) ? 'Green' : 'Green');
	
		await interaction.reply({ embeds: [OsterEmbed], ephemeral: true });
    }
};
*/