const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionFlagsBits
} = require('discord.js');
const { Team, Match, ProLeagueEmbed } = require('../../../Datenbank/fussballdb');

// ------------------------------------------------------
// ⚙️ KONFIGURATION
// ------------------------------------------------------
const PRO_LEAGUE_TEAMS = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

// ------------------------------------------------------
// 🧮 FUNKTION: Tabelle berechnen
// ------------------------------------------------------
async function buildLeagueTable() {
  const dbTeams = await Team.find({ league: 'Pro League' });
  const teamMap = new Map(dbTeams.map(t => [t.name.trim().toLowerCase(), t.toObject()]));

  // Fehlende Teams hinzufügen
  for (const name of PRO_LEAGUE_TEAMS) {
    const key = name.trim().toLowerCase();
    if (!teamMap.has(key)) {
      teamMap.set(key, {
        name,
        played: 0,
        won: 0,
        draw: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      });
    }
  }

  // Live-Spiele finden
  const liveMatches = await Match.find({ status: 'live' });
  const liveTeams = new Set();
  for (const m of liveMatches) {
    liveTeams.add(m.team1.trim().toLowerCase());
    liveTeams.add(m.team2.trim().toLowerCase());
  }

  // Tabelle berechnen
  const sortedTeams = Array.from(teamMap.values())
    .map(t => ({
      ...t,
      goalDifference: t.goalsFor - t.goalsAgainst,
      points: (t.won * 3) + t.draw
    }))
    .sort((a, b) => (
      b.points - a.points ||
      b.goalDifference - a.goalDifference ||
      b.goalsFor - a.goalsFor ||
      a.name.localeCompare(b.name)
    ));

  return { sortedTeams, liveTeams };
}

// ------------------------------------------------------
// 🏗️ FUNKTION: Embed erstellen
// ------------------------------------------------------
async function createTableEmbed() {
  const { sortedTeams, liveTeams } = await buildLeagueTable();

  const rows = sortedTeams.map((t, i) => {
    const key = t.name.trim().toLowerCase();
    const liveMark = liveTeams.has(key) ? ' `🔴`' : '';
    return `**${i + 1}. ${t.name}${liveMark}**  —  ${t.points} Pkt | S: ${t.won} U: ${t.draw} N: ${t.lost} | ${t.goalsFor}:${t.goalsAgainst} (TD: ${t.goalDifference})`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle('`⚽` Pro League — Aktuelle Tabelle')
    .setDescription(rows || '*Keine Teams vorhanden.*')
    .setColor('Blurple')
    .setFooter({ text: 'Wird automatisch aktualisiert, wenn Spiele stattfinden' })
    .setTimestamp();
}

// ------------------------------------------------------
// 🔁 FUNKTION: Tabelle aktualisieren
// ------------------------------------------------------
async function updateLeagueTable(client) {
  const entry = await ProLeagueEmbed.findOne({ name: 'proleague_tabelle' });
  if (!entry) return;

  const channel = await client.channels.fetch(entry.channelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) return;

  const message = await channel.messages.fetch(entry.messageId).catch(() => null);
  if (!message) return;

  const embed = await createTableEmbed();
  await message.edit({ embeds: [embed] });
}

// ------------------------------------------------------
// 🟢 FUNKTION: Spiel gestartet
// ------------------------------------------------------
async function onMatchStart(client, matchId) {
  const match = await Match.findById(matchId);
  if (!match) return;

  if (match.status === 'live') return; // Verhindert doppelte Updates

  match.status = 'live';
  await match.save();

  await updateLeagueTable(client);
}

// ------------------------------------------------------
// 🔴 FUNKTION: Spiel beendet
// ------------------------------------------------------
async function onMatchEnd(client, matchId) {
  const match = await Match.findById(matchId);
  if (!match) return;

  if (match.status === 'finished') return; // Doppelte Vermeidung

  match.status = 'finished';
  await match.save();

  const team1 = await Team.findOne({ name: match.team1 });
  const team2 = await Team.findOne({ name: match.team2 });
  if (!team1 || !team2) return;

  // Statistiken aktualisieren
  team1.played += 1;
  team2.played += 1;

  team1.goalsFor += match.score1;
  team1.goalsAgainst += match.score2;
  team2.goalsFor += match.score2;
  team2.goalsAgainst += match.score1;

  if (match.score1 > match.score2) {
    team1.won++; team2.lost++;
  } else if (match.score1 < match.score2) {
    team2.won++; team1.lost++;
  } else {
    team1.draw++; team2.draw++;
  }

  await team1.save();
  await team2.save();

  await updateLeagueTable(client);
}

// ------------------------------------------------------
// 💬 SLASH COMMAND: /fussball-tabelle
// ------------------------------------------------------
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-tabelle')
    .setDescription('Sendet die aktuelle Pro League Tabelle und speichert sie für automatische Updates.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = await createTableEmbed();
    const message = await interaction.channel.send({ embeds: [embed] });

    await ProLeagueEmbed.findOneAndUpdate(
      { name: 'proleague_tabelle' },
      { name: 'proleague_tabelle', channelId: interaction.channel.id, messageId: message.id },
      { upsert: true }
    );

    await interaction.reply({ content: '> `✅` Tabelle wurde gesendet und gespeichert!', ephemeral: true });
  },

  updateLeagueTable,
  onMatchStart,
  onMatchEnd
};
