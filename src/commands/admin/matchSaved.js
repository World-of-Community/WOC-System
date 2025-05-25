const { matchEvents } = require('../src/commands/admin/matchEvents.js');
const { Team } = require('../../../Datenbank/fussballdb');
const { EmbedBuilder } = require('discord.js');
const { client } = require('../index'); // Pfad anpassen

const LEADERBOARD_CHANNEL_ID = '1373937313922682900';
const LEADERBOARD_MESSAGE_ID = '1376330791336022077';

matchEvents.on('matchSaved', async (doc) => {
  try {
    const teams = await Team.find({ league: 'Pro League' });

    teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if ((b.goalsFor - b.goalsAgainst) !== (a.goalsFor - a.goalsAgainst)) return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
      return b.goalsFor - a.goalsFor;
    });

    const table = teams.map((team, index) => {
      const gd = team.goalsFor - team.goalsAgainst;
      return `**${index + 1}** - \`${team.name}\` | ${team.played} Sp | ${team.won} S | ${team.draw} U | ${team.lost} N | ${team.goalsFor}:${team.goalsAgainst} (${gd}) | ${team.points} P`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('📊 Aktuelle Tabelle - Pro League')
      .setColor(0x00AE86)
      .setDescription(table)
      .setFooter({ text: 'Letztes Update' })
      .setTimestamp();

    const channel = await client.channels.fetch(LEADERBOARD_CHANNEL_ID);
    const message = await channel.messages.fetch(LEADERBOARD_MESSAGE_ID);
    await message.edit({ embeds: [embed] });

  } catch (error) {
    console.error('[Fehler beim Aktualisieren der Tabelle]', error);
  }
});
