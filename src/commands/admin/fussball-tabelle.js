const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');
const ProLeagueEmbed = require('../../../Datenbank/proleaguembeddb');

const proLeagueTeams = [
  'FC Adler','SV Löwen','TSV Eiche','SC Blau','VfB Stern',
  'FC Rot-Weiß','SV Grünwald','TSV Nord','SC Süd','VfB West',
  'FC Ostwind','SV Nordstern','TSV Berg','SC Tal','VfB See',
  'FC Sturm','SV Blitz','TSV Vulkan','SC Frost','VfB Flamme',
  'FC Donner','SV Schatten','TSV Nebel','SC Licht'
];

// -------------------- Tabelle erstellen --------------------
async function createTabelleEmbed() {
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
        points: 0
      });
    }
  }

  // Live-Spiele
  const liveMatches = await Match.find({ status: 'live' });
  const liveTeamsMap = new Map(); // Teamname => aktueller Spielstand
  for (const m of liveMatches) {
    liveTeamsMap.set(m.team1.trim(), `${m.score1}-${m.score2}`);
    liveTeamsMap.set(m.team2.trim(), `${m.score1}-${m.score2}`);
  }

  // Punkte, Differenz berechnen
  const proLeagueData = Array.from(teamMap.values())
    .map(t => {
      t.goalDifference = t.goalsFor - t.goalsAgainst;
      t.points = (t.won * 3) + t.draw;
      return t;
    })
    .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);

  // Beschreibung erstellen
  const description = proLeagueData.map((t, i) => {
    let liveMark = '';
    if (liveTeamsMap.has(t.name.trim())) {
      liveMark = `\`🔴\` ${liveTeamsMap.get(t.name.trim())}`;
    }
    return `**${i + 1}. ${t.name} ${liveMark}** | Sp: ${t.played} | S: ${t.won} | U: ${t.draw} | N: ${t.lost} | T: ${t.goalsFor} | GT: ${t.goalsAgainst} | TD: ${t.goalDifference} | Pkt: ${t.points}`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle('`⚽` Pro League Tabelle')
    .setDescription(description)
    .setColor('Blurple')
    .setFooter({ text: 'Zuletzt aktualisiert' })
    .setTimestamp();
}

// -------------------- Tabelle updaten --------------------
async function updateLeagueTable(client) {
  const dbEntry = await ProLeagueEmbed.findOne({ name: 'proleague_tabelle' });
  if (!dbEntry) return;

  const channel = await client.channels.fetch(dbEntry.channelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) return;

  const message = await channel.messages.fetch(dbEntry.messageId).catch(() => null);
  if (!message) return;

  const embed = await createTabelleEmbed();
  await message.edit({ embeds: [embed] });
}

// -------------------- Match-End Trigger --------------------
async function onMatchEnd(client, matchId) {
  const match = await Match.findById(matchId);
  if (!match) return;

  const team1 = await Team.findOne({ name: match.team1 });
  const team2 = await Team.findOne({ name: match.team2 });
  if (!team1 || !team2) return;

  team1.played += 1;
  team2.played += 1;

  team1.goalsFor += match.score1;
  team1.goalsAgainst += match.score2;
  team2.goalsFor += match.score2;
  team2.goalsAgainst += match.score1;

  if (match.score1 > match.score2) {
    team1.won += 1;
    team2.lost += 1;
  } else if (match.score1 < match.score2) {
    team2.won += 1;
    team1.lost += 1;
  } else {
    team1.draw += 1;
    team2.draw += 1;
  }

  await team1.save();
  await team2.save();

  await updateLeagueTable(client);
}

// -------------------- Slash Command --------------------
module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-tabelle')
    .setDescription('Sendet die Pro League Tabelle und speichert die Nachricht')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const embed = await createTabelleEmbed();
    const message = await interaction.channel.send({ embeds: [embed] });

    await ProLeagueEmbed.findOneAndUpdate(
      { name: 'proleague_tabelle' },
      { name: 'proleague_tabelle', channelId: interaction.channel.id, messageId: message.id },
      { upsert: true }
    );

    await interaction.reply({ content: '> `✅` Tabelle gesendet und gespeichert!', ephemeral: true });
  },

  updateLeagueTable,
  onMatchEnd
};
