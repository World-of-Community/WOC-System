const { EmbedBuilder } = require('discord.js');
const { Logger } = require('../utils');

/**
 * Season Event Buttons
 * Behandelt Season-Event Informationen (Ostern, Halloween, Weihnachten, Silvester)
 */
module.exports = {
    customId: ['easter_event', 'halloween_event', 'christmas_event', 'newyear_event', 'collect_event'],

    async execute(interaction) {
        const now = new Date();

        // Event-Zeitspannen
        const eventPeriods = {
            easter: { start: new Date('2025-03-01T00:00:00Z'), end: new Date('2025-04-30T23:59:59Z') },
            halloween: { start: new Date('2025-10-27T00:00:00Z'), end: new Date('2025-11-02T23:59:59Z') },
            christmas: { start: new Date('2025-12-20T00:00:00Z'), end: new Date('2025-12-26T23:59:59Z') },
            newyear: { start: new Date('2025-12-27T00:00:00Z'), end: new Date('2026-01-02T23:59:59Z') },
        };

        // Prüft ob Event aktiv ist
        const isEventActive = (event) => now >= event.start && now <= event.end;

        switch (interaction.customId) {
            case 'easter_event':
                const osterEmbed = new EmbedBuilder()
                    .setTitle('`🐇` Oster Event `🐇`')
                    .setDescription(
                        isEventActive(eventPeriods.easter)
                            ? '**Das Oster-Event ist aktuell aktiv! Viel Spaß beim Sammeln der Oster-Eier!**'
                            : '**Dieses Event startet erst zwischen den Monaten `März` und `April`!**'
                    )
                    .setColor('Green');

                await interaction.reply({ embeds: [osterEmbed], ephemeral: true });
                break;

            case 'halloween_event':
                const halloweenEmbed = new EmbedBuilder()
                    .setTitle('`🎃` Halloween Event `🎃`')
                    .setDescription(
                        isEventActive(eventPeriods.halloween)
                            ? '**Das Halloween-Event ist aktiv! Viel Spaß beim Gruseln!**'
                            : '**Dieses Event findet erst zwischen dem `27. Oktober` und dem `02. November` statt!**'
                    )
                    .setColor('Orange');

                await interaction.reply({ embeds: [halloweenEmbed], ephemeral: true });
                break;

            case 'christmas_event':
                const weihnachtsEmbed = new EmbedBuilder()
                    .setTitle('`🎄` Weihnachts-Event `🎄`')
                    .setDescription(
                        isEventActive(eventPeriods.christmas)
                            ? '**Das Weihnachts-Event ist aktiv! Genieße die festliche Stimmung!**'
                            : '**Dieses Event findet erst zwischen dem `20. Dezember` und dem `26. Dezember` statt!**'
                    )
                    .setColor('DarkBlue');

                await interaction.reply({ embeds: [weihnachtsEmbed], ephemeral: true });
                break;

            case 'newyear_event':
                const silvesterEmbed = new EmbedBuilder()
                    .setTitle('`🎆` Silvester Event `🎆`')
                    .setDescription(
                        isEventActive(eventPeriods.newyear)
                            ? '**Das Silvester-Event ist aktiv! Feiere das neue Jahr mit uns!**'
                            : '**Dieses Event findet erst zwischen dem `27. Dezember` und dem `02. Januar` statt!**'
                    )
                    .setColor('Grey');

                await interaction.reply({ embeds: [silvesterEmbed], ephemeral: true });
                break;

            case 'collect_event':
                const activeEvent = Object.keys(eventPeriods).find((key) =>
                    isEventActive(eventPeriods[key])
                );

                const eventItemEmbed = new EmbedBuilder()
                    .setDescription(
                        activeEvent
                            ? `**Du hast ein Item aus dem aktuellen Event (${activeEvent.toUpperCase()}-Event) eingesammelt!**`
                            : '**Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!**'
                    )
                    .setColor(activeEvent ? 'Green' : 'Red');

                await interaction.reply({ embeds: [eventItemEmbed], ephemeral: true });

                if (activeEvent) {
                    await interaction.followUp({
                        content: '> `✅` » Du hast erfolgreich ein Event-Item eingesammelt!',
                        ephemeral: true
                    });
                    Logger.debug(`User ${interaction.user.id} hat Event-Item gesammelt: ${activeEvent}`);
                }
                break;
        }
    }
};
