const mongoose = require('mongoose');
const { Schema } = mongoose;
const { EmbedBuilder } = require('discord.js');
const { client } = require('../src/index'); // Passe den Pfad an, je nachdem wo dein client ist
const { Team } = require('../../../Datenbank/fussballdb');

const LEADERBOARD_CHANNEL_ID = '1373937313922682900';
const LEADERBOARD_MESSAGE_ID = '1376330791336022077';

const matchSchema = new Schema({
  team1: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  team2: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  score1: { type: Number, required: true },
  score2: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  league: { type: String, default: 'Pro League' }
});

// Hook: Nach dem Speichern eines Matches
matchSchema.post('save', async function (doc) {
  try {
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

    // Tabelle aktualisieren
    const teams = await Team.find({ league: doc.league });

    teams.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if ((b.goalsFor - b.goalsAgainst) !== (a.goalsFor - a.goalsAgainst)) return (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst);
      return b.goalsFor - a.goalsFor;
    });

    const table = teams.map((team, index) => {
      const rank = index + 1;
      const played = team.played;
      const won = team.won;
      const draw = team.draw;
      const lost = team.lost;
      const gf = team.goalsFor;
      const ga = team.goalsAgainst;
      const gd = gf - ga;
      const pts = team.points;

      return `**${rank}** - \`${team.name}\` | ${played} Sp | ${won} S | ${draw} U | ${lost} N | ${gf}:${ga} (${gd}) | ${pts} P`;
    }).join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`📊 Aktuelle Tabelle - ${doc.league}`)
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

module.exports = mongoose.model('Match', matchSchema);
