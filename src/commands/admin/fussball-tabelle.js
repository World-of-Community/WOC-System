const { EmbedBuilder } = require('discord.js');
const { Team } = require('../Datenbank/fussballdb');
const EmbedDB = require('../Datenbank/embeddb'); // Sammlung zum Speichern von Message/Channel-ID

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

module.exports = async function updateTabelleEmbed(client) {
  try {
    const allTeams = await Team.find({ league: 'Pro League' });
    const teamMap = new Map(allTeams.map(t => [t.name.trim(), t.toObject()]));

    for (const name of proLeagueTeams) {
      if (!teamMap.has(name)) {
        teamMap.set(name, {
          name,
          played: 0,
          won: 0,
          draw: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          yellowCards: 0,
          redCards: 0
        });
      }
    }

    const proLeagueData = Array.from(teamMap.values())
      .map(t => {
        t.goalDifference = t.goalsFor - t.goalsAgainst;
        t.points = (t.won * 3) + t.draw;
        return t;
      })
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

    const description = proLeagueData.map((t, i) =>
      `**${i + 1}. ${t.name}** - ${t.points} Pkt | Spiele: ${t.played} | S: ${t.won} | U: ${t.draw} | N: ${t.lost} | Tore: ${t.goalsFor}:${t.goalsAgainst} (TV: ${t.goalDifference})`
    ).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('⚽ Pro League Tabelle')
      .setDescription(description)
      .setColor('Blue')
      .setTimestamp();

    // Nachricht-ID + Channel-ID aus DB holen
    const embedData = await EmbedDB.findOne({ name: 'proleague_tabelle' });
    if (!embedData) return console.warn('Tabelle-Embed nicht gespeichert.');

    const channel = await client.channels.fetch(embedData.channelId);
    if (!channel) return console.warn('Kanal nicht gefunden.');
    const message = await channel.messages.fetch(embedData.messageId);
    if (!message) return console.warn('Nachricht nicht gefunden.');

    // Embed aktualisieren
    await message.edit({ embeds: [embed] });

  } catch (err) {
    console.error('Fehler beim Aktualisieren der Tabelle:', err);
  }
};
