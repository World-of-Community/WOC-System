//const { EmbedBuilder } = require('discord.js');
//const { isEventActive, eventPeriods } = require('../../functions/events');
//
//module.exports = {
//	id: 'collect_event',
//	run: async (client, interaction) => {
//		const activeEvent = Object.keys(eventPeriods).find((key) =>
//			isEventActive(eventPeriods[key])
//		);
//	
//		const eventItemEmbed = new EmbedBuilder()
//			.setDescription(activeEvent ? `**Du hast ein Item aus dem aktuellen Event (${activeEvent.toUpperCase()}-Event) eingesammelt!**` : '**Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!**')
//			.setColor(activeEvent ? 'Green' : 'Red');
//	
//		await interaction.reply({ embeds: [eventItemEmbed], ephemeral: true });
//	
//		if (activeEvent) {
//			await interaction.followUp({ content: '> `✅` » Du hast erfolgreich ein Event-Item eingesammelt!', ephemeral: true });
//		}
//    }
//};