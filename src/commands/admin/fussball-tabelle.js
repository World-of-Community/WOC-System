const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');
const EmbedDB = require('../../../Datenbank/embeddb');

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

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
    `**${i + 1}. ${t.name}** | Sp: ${t.played} | S: ${t.won} | U: ${t.draw} | N: ${t.lost} | T: ${t.goalsFor} | GT: ${t.goalsAgainst} | TD: ${t.goalDifference} | Pkte: ${t.points}`
  ).join('\n');

  return new EmbedBuilder()
    .setTitle('⚽ Pro League Tabelle')
    .setDescription(description)
    .setColor('Blue')
    .setFooter({ text: 'Zuletzt aktualisiert'})
    .setTimestamp();
}

async function updateLeagueTable(client) {
  const dbEntry = await EmbedDB.findOne({ name: 'proleague_tabelle' });
  if (!dbEntry) return;

  const channel = await client.channels.fetch(dbEntry.channelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) return;

  const message = await channel.messages.fetch(dbEntry.messageId).catch(() => null);
  if (!message) return;

  const embed = await createTabelleEmbed();
  await message.edit({ embeds: [embed] });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-tabelle')
    .setDescription('Sendet die Pro League Tabelle und speichert die Nachricht'),

  async execute(interaction) {
    const embed = await createTabelleEmbed();
    
    const message = await interaction.channel.send({ embeds: [embed] });

    await EmbedDB.findOneAndUpdate(
      { name: 'proleague_tabelle' },
      {
        name: 'proleague_tabelle',
        channelId: interaction.channel.id,
        messageId: message.id
      },
      { upsert: true }
    );

    await interaction.reply({ content: '✅ Tabelle gesendet und gespeichert!', ephemeral: true });
  },

  updateLeagueTable
};
