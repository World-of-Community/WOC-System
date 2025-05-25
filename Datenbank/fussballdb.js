const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  league: { type: String, enum: ['Pro League'], required: true },

  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },

  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },

  points: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },

  players: { type: [String], default: [] },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

teamSchema.virtual('goalDifference').get(function () {
  return this.goalsFor - this.goalsAgainst;
});

teamSchema.virtual('calculatedPoints').get(function () {
  return this.won * 3 + this.draw;
});

const matchSchema = new mongoose.Schema({
  team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },

  score1: { type: Number, required: true },
  score2: { type: Number, required: true },

  date: { type: Date, default: Date.now },

  events: [{
    time: Number,
    type: { type: String, enum: ['goal', 'yellow', 'red', 'substitution'] },
    player: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  }],

  yellowCards: {
    type: Map,
    of: Number,
    default: {},
  },
  redCards: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

// --- Hier die Middleware, die die Tabelle aktualisiert ---

matchSchema.post('save', async function (doc) {
  const { Team } = require('./league'); // passe ggf. den Pfad an

  const LEADERBOARD_CHANNEL_ID = '1373937313922682900';
  const LEADERBOARD_MESSAGE_ID = '1376330791336022077';

  const team1 = await Team.findById(doc.team1);
  const team2 = await Team.findById(doc.team2);

  if (!team1 || !team2) return;

  // Teams updaten
  team1.played++;
  team2.played++;

  team1.goalsFor += doc.score1;
  team1.goalsAgainst += doc.score2;

  team2.goalsFor += doc.score2;
  team2.goalsAgainst += doc.score1;

  if (doc.score1 > doc.score2) {
    team1.won++;
    team2.lost++;
    team1.points += 3;
  } else if (doc.score1 < doc.score2) {
    team2.won++;
    team1.lost++;
    team2.points += 3;
  } else {
    team1.draw++;
    team2.draw++;
    team1.points += 1;
    team2.points += 1;
  }

  await team1.save();
  await team2.save();

  // --- Tabelle (Leaderboard) aktualisieren ---
  const teams = await Team.find({ league: 'Pro League' });

  teams.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if ((b.goalsFor - b.goalsAgainst) !== (a.goalsFor - a.goalsAgainst)) return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
    return b.goalsFor - a.goalsFor;
  });

  // Embed erstellen und Nachricht aktualisieren
  const { EmbedBuilder } = require('discord.js');
  const { client } = require('../client'); // Pfad ggf. anpassen!

  const table = teams.map((team, index) => {
    const rank = `${index + 1}`;
    const played = team.played;
    const won = team.won;
    const draw = team.draw;
    const lost = team.lost;
    const gf = team.goalsFor;
    const ga = team.goalsAgainst;
    const gd = team.goalsFor - team.goalsAgainst;
    const pts = team.points;

    return `**${rank}** - \`${team.name}\` | ${played} Sp | ${won} S | ${draw} U | ${lost} N | ${gf}:${ga} (${gd}) | ${pts} P`;
  }).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('📊 Aktuelle Tabelle - Pro League')
    .setColor(0x00AE86)
    .setDescription(table)
    .setFooter({ text: 'Letztes Update' })
    .setTimestamp();

  try {
    const channel = await client.channels.fetch(LEADERBOARD_CHANNEL_ID);
    const message = await channel.messages.fetch(LEADERBOARD_MESSAGE_ID);
    await message.edit({ embeds: [embed] });
  } catch (error) {
    console.error('[Tabelle Aktualisierung Fehler]', error);
  }
});

const Team = mongoose.model('Team', teamSchema);
const Match = mongoose.model('Match', matchSchema);

module.exports = { Team, Match };



/*

const mongoose = require('mongoose');

// Team-Schema
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  league: { type: String, enum: ['Pro League'], required: true },

  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },

  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },

  points: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },

  players: { type: [String], default: [] },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtuelle Eigenschaften
teamSchema.virtual('goalDifference').get(function () {
  return this.goalsFor - this.goalsAgainst;
});

teamSchema.virtual('calculatedPoints').get(function () {
  return this.won * 3 + this.draw;
});

// Match-Schema
const matchSchema = new mongoose.Schema({
  team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },

  score1: { type: Number, required: true },
  score2: { type: Number, required: true },

  date: { type: Date, default: Date.now },

  events: [{
    time: Number,
    type: { type: String, enum: ['goal', 'yellow', 'red', 'substitution'] },
    player: String,
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  }],

  yellowCards: {
    type: Map,
    of: Number,
    default: {},
  },
  redCards: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

// Middleware zur automatischen Teamstatistik-Aktualisierung
matchSchema.post('save', async function (doc) {
  const { Team } = require('./league'); // Eigenen Export nutzen

  const team1 = await Team.findById(doc.team1);
  const team2 = await Team.findById(doc.team2);

  if (!team1 || !team2) return;

  team1.played++;
  team2.played++;

  team1.goalsFor += doc.score1;
  team1.goalsAgainst += doc.score2;

  team2.goalsFor += doc.score2;
  team2.goalsAgainst += doc.score1;

  if (doc.score1 > doc.score2) {
    team1.won++;
    team2.lost++;
    team1.points += 3;
  } else if (doc.score1 < doc.score2) {
    team2.won++;
    team1.lost++;
    team2.points += 3;
  } else {
    team1.draw++;
    team2.draw++;
    team1.points += 1;
    team2.points += 1;
  }

  await team1.save();
  await team2.save();
});

// Exportiere die Modelle
const Team = mongoose.model('Team', teamSchema);
const Match = mongoose.model('Match', matchSchema);

module.exports = { Team, Match };

*/
