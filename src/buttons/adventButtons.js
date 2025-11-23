const Advent = require('../../Datenbank/adventdb');
const { Logger } = require('../utils');

/**
 * Advent Calendar Buttons
 * Behandelt Adventskalender Türchen-Öffnung
 */
module.exports = {
    customId: 'advent_*', // Wildcard für advent_1, advent_2, etc.

    async execute(interaction) {
        try {
            const [, day] = interaction.customId.split('_');
            const dayNumber = parseInt(day);
            const currentDay = new Date().getDate();

            // Belohnungen definieren
            const rewards = {
                1: { type: 'coins', value: 100 },
                2: { type: 'coins', value: 200 },
                3: { type: 'coins', value: 300 },
                4: { type: 'coins', value: 400 },
                5: { type: 'coins', value: 500 },
                6: { type: 'role', value: '1312780135530889326' }, // Adventskalender 2024
                7: { type: 'coins', value: 700 },
                8: { type: 'coins', value: 800 },
                9: { type: 'coins', value: 900 },
                10: { type: 'coins', value: 1000 },
                11: { type: 'coins', value: 1100 },
                12: { type: 'coins', value: 1200 },
                13: { type: 'coins', value: 1300 },
                14: { type: 'coins', value: 1400 },
                15: { type: 'coins', value: 1500 },
                16: { type: 'coins', value: 1600 },
                17: { type: 'coins', value: 1700 },
                18: { type: 'coins', value: 1800 },
                19: { type: 'coins', value: 1900 },
                20: { type: 'coins', value: 2000 },
                21: { type: 'coins', value: 2100 },
                22: { type: 'coins', value: 2200 },
                23: { type: 'coins', value: 2300 },
                24: { type: 'coins', value: 2400 },
            };

            // Hole User-Daten
            let userData = await Advent.findOne({ userId: interaction.user.id });
            if (!userData) {
                userData = await Advent.create({ userId: interaction.user.id, openedDays: [] });
            }

            // Prüfe ob Tag bereits geöffnet
            if (userData.openedDays.includes(dayNumber)) {
                return interaction.reply({
                    content: `> \`❗\` » Du hast diesen Tag (${dayNumber}. Dezember) bereits geöffnet!`,
                    ephemeral: true
                });
            }

            // Prüfe ob Tag in der Zukunft liegt
            if (dayNumber > currentDay) {
                return interaction.reply({
                    content: '> `❌` » Du kannst zukünftige Tage nicht öffnen!',
                    ephemeral: true
                });
            }

            // Tag als geöffnet markieren
            userData.openedDays.push(dayNumber);
            await userData.save();

            // Belohnung verarbeiten
            const reward = rewards[dayNumber];
            let rewardMessage = '';

            switch (reward?.type) {
                case 'coins':
                    rewardMessage = `> \`🎉\` » Du hast **${reward.value} Coins** erhalten!\n> \`🎫\` » Öffne ein Ticket im Support, um deine Belohnung abzuholen.`;
                    break;

                case 'role':
                    try {
                        const role = await interaction.guild.roles.fetch(reward.value);
                        if (role) {
                            await interaction.member.roles.add(role);
                            rewardMessage = `> \`🎉\` » Du hast die Rolle **${role.name}** erhalten!`;
                        } else {
                            rewardMessage = '> `❌` » Die Rolle konnte nicht gefunden werden.';
                        }
                    } catch (err) {
                        Logger.error('Fehler beim Hinzufügen der Adventskalender-Rolle', err);
                        rewardMessage = '> `❌` » Es gab einen Fehler beim Hinzufügen der Rolle.';
                    }
                    break;

                default:
                    rewardMessage = '> `❓` » Keine Belohnung für diesen Tag definiert.';
            }

            await interaction.reply({
                content: `> \`🎄\` » **Tag ${dayNumber}** wurde geöffnet!\n${rewardMessage}`,
                ephemeral: true
            });

            Logger.info(`User ${interaction.user.id} hat Adventskalender Tag ${dayNumber} geöffnet`);
        } catch (error) {
            Logger.error('Fehler bei Advent Button', error);
            await interaction.reply({
                content: '> `❌` » Es gab einen Fehler beim Öffnen des Türchens.',
                ephemeral: true
            });
        }
    }
};
