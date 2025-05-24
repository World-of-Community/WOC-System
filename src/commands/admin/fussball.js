const { 
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb'); // Deine DB-Verbindung

// Emojis für Teams
const teamIcons = {
  'FC Adler': '🦅', 'SV Löwen': '🦁', 'TSV Eiche': '🌳', 'SC Blau': '🔵',
  'VfB Stern': '⭐', 'FC Rot-Weiß': '🔴⚪', 'SV Grünwald': '🌲', 'TSV Nord': '❄️',
  'SC Süd': '☀️', 'VfB West': '🌅', 'FC Ostwind': '🌬️', 'SV Nordstern': '🌟',
  'TSV Berg': '⛰️', 'SC Tal': '🏞️', 'VfB See': '🌊', 'FC Sturm': '🌪️',
  'SV Blitz': '⚡', 'TSV Vulkan': '🌋', 'SC Frost': '❄️', 'VfB Flamme': '🔥',
  'FC Donner': '⛈️', 'SV Schatten': '🌑', 'TSV Nebel': '🌫️', 'SC Licht': '💡',
};

// Beispielteams mit Spielern
const teamsData = [
  { "name": "FC Adler", "players": ["Müller", "Schmidt", "Fischer", "Weber"] },
  { "name": "SV Löwen", "players": ["Schneider", "Wagner", "Becker", "Hoffmann"] },
  { "name": "TSV Eiche", "players": ["Bauer", "Koch", "Richter", "Klein"] },
  { "name": "SC Blau", "players": ["Wolf", "Neumann", "Schröder", "Krüger"] },
  { "name": "VfB Stern", "players": ["Hartmann", "Lange", "Schmitt", "Werner"] },
  { "name": "FC Rot-Weiß", "players": ["Krause", "Meier", "Schulz", "Hahn"] },
  { "name": "SV Grünwald", "players": ["König", "Fuchs", "Bergmann", "Lorenz"] },
  { "name": "TSV Nord", "players": ["Frank", "Mayer", "Jung", "Albrecht"] },
  { "name": "SC Süd", "players": ["Böhm", "Engel", "Jäger", "Brandt"] },
  { "name": "VfB West", "players": ["Peters", "Simon", "Vogel", "Friedrich"] },
  { "name": "FC Ostwind", "players": ["Paul", "Hoffmeister", "Bender", "Keller"] },
  { "name": "SV Nordstern", "players": ["Mayerhofer", "Schulze", "Graf", "Krafft"] },
  { "name": "TSV Berg", "players": ["Winkler", "Horn", "Seidel", "Busch"] },
  { "name": "SC Tal", "players": ["Zimmermann", "Lutz", "Hahn", "Franke"] },
  { "name": "VfB See", "players": ["Döring", "Kuhn", "Voigt", "Bach"] },
  { "name": "FC Sturm", "players": ["Schulz", "Ritter", "Heinrich", "Friedl"] },
  { "name": "SV Blitz", "players": ["Köhler", "Dietrich", "Eckert", "Löwe"] },
  { "name": "TSV Vulkan", "players": ["Maier", "Groß", "Schulze", "Hoffmann"] },
  { "name": "SC Frost", "players": ["Schuster", "Brand", "Sauer", "Lang"] },
  { "name": "VfB Flamme", "players": ["Reuter", "Schiller", "Born", "Herz"] },
  { "name": "FC Donner", "players": ["Lorenz", "Bauer", "Wolf", "Schmid"] },
  { "name": "SV Schatten", "players": ["Ziegler", "Beck", "Kruse", "Hart"] },
  { "name": "TSV Nebel", "players": ["Lang", "Winter", "Schwarz", "Beier"] },
  { "name": "SC Licht", "players": ["Günther", "Kaiser", "Sachs", "Mayer"] }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
      // Hol dir Teams aus der Datenbank, Pro League als Beispiel
      const proLeagueTeams = await Team.find({ league: 'Pro League' });
      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      // Wähle zwei unterschiedliche Teams
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // Kurzname (z.B. "FC Adler" -> "Adler")
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      const odds = generateOdds();

      // Erstes Embed: Spielstatus
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: `0'`, inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
        );

      // Spieler aus dem Array holen (für Aufstellung)
      const players1 = teamsData.find(t => t.name === team1.name)?.players || [];
      const players2 = teamsData.find(t => t.name === team2.name)?.players || [];

      // Zweites Embed: Aufstellung
      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons für Tippmöglichkeiten
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('win_team1')
          .setLabel(`${icon1} ${team1LastName} gewinnt (${odds.team1})`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('draw')
          .setLabel(`Unentschieden (${odds.draw})`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('win_team2')
          .setLabel(`${icon2} ${team2LastName} gewinnt (${odds.team2})`)
          .setStyle(ButtonStyle.Primary),
      );

      // Status-Embed senden
      await interaction.reply({ embeds: [embedStatus] });
      // Aufstellung + Buttons senden
      const lineupMessage = await interaction.followUp({ embeds: [embedLineup], components: [buttons], fetchReply: true });

      // Collector für Buttonklicks (nur vom Interaktionsuser)
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });

      collector.on('collect', async i => {
        let userTip;
        switch (i.customId) {
          case 'win_team1': userTip = 'team1'; break;
          case 'win_team2': userTip = 'team2'; break;
          case 'draw': userTip = 'draw'; break;
          default:
            return await i.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
        }
        await i.reply({ content: `Du hast getippt: ${userTip}`, ephemeral: true });
        collector.stop(userTip);
      });

      collector.on('end', async (_, reason) => {
        if (reason === 'time') {
          return interaction.followUp({ content: '⏰ Zeit abgelaufen! Du hast keinen Tipp abgegeben.', ephemeral: true });
        }

        // Simuliere Ergebnis
        const result = simulateMatch(odds);

        // Ergebnis-Embed mit Tipp-Auswertung
        const embedResult = new EmbedBuilder()
          .setTitle('⚽ Spielergebnis')
          .setColor('Gold')
          .setDescription(
            `**${icon1} ${team1LastName}** ${result.goals1} : ${result.goals2} **${icon2} ${team2LastName}**\n\n` +
            `Dein Tipp: ${formatTip(reason, icon1, team1LastName, icon2, team2LastName)}\n` +
            `${reason === result.winner ? '✅ Du hast richtig getippt!' : '❌ Leider falsch geraten.'}`
          )
          .addFields(
            { name: 'xG', value: `${result.xg1.toFixed(2)} : ${result.xg2.toFixed(2)}`, inline: true },
            { name: 'Spielminute', value: `90'`, inline: true }
          );

        await interaction.followUp({ embeds: [embedResult], components: [] });
      });

    } catch (error) {
      console.error('Fehler beim /fussball Command:', error);
      return interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  },
};

// Hilfsfunktionen

function getTwoDifferentTeams(teams) {
  if (teams.length < 2) throw new Error('Nicht genug Teams');
  const firstIndex = Math.floor(Math.random() * teams.length);
  let secondIndex;
  do {
    secondIndex = Math.floor(Math.random() * teams.length);
  } while (secondIndex === firstIndex);
  return [teams[firstIndex], teams[secondIndex]];
}

// Generiere zufällige Wettquoten (z.B. 1.5 - 5.0)
function generateOdds() {
  // Odds für beide Teams plus Draw, summe aber ungleich 1
  const team1 = (Math.random() * 3 + 1).toFixed(2);
  const team2 = (Math.random() * 3 + 1).toFixed(2);
  const draw = (Math.random() * 4 + 1).toFixed(2);
  return {
    team1: team1,
    team2: team2,
    draw: draw,
  };
}

// Simuliere ein Spiel basierend auf Quoten
function simulateMatch(odds) {
  // Verwende Quoten als Indikator für Siegchancen
  // Einfaches Modell: Niedrigere Quote = Favorit
  // Hier erzeugen wir xG und Tore zufällig mit leichten Gewichtungen
  const xg1 = Math.random() * (5 / odds.team1);
  const xg2 = Math.random() * (5 / odds.team2);

  const goals1 = Math.floor(xg1);
  const goals2 = Math.floor(xg2);

  let winner;
  if (goals1 > goals2) winner = 'team1';
  else if (goals2 > goals1) winner = 'team2';
  else winner = 'draw';

  return { goals1, goals2, winner, xg1, xg2 };
}

// Hilft Tipp-Text zu formatieren
function formatTip(tip, icon1, team1, icon2, team2) {
  switch (tip) {
    case 'team1': return `${icon1} ${team1} gewinnt`;
    case 'team2': return `${icon2} ${team2} gewinnt`;
    case 'draw': return 'Unentschieden';
    default: return 'Kein Tipp';
  }
}
