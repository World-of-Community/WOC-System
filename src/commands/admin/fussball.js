const { 
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb'); // Deine Datenbankanbindung

// Emojis für Teams
const teamIcons = {
  'FC Adler': '🦅', 'SV Löwen': '🦁', 'TSV Eiche': '🌳', 'SC Blau': '🔵',
  'VfB Stern': '⭐', 'FC Rot-Weiß': '🔴⚪', 'SV Grünwald': '🌲', 'TSV Nord': '❄️',
  'SC Süd': '☀️', 'VfB West': '🌅', 'FC Ostwind': '🌬️', 'SV Nordstern': '🌟',
  'TSV Berg': '⛰️', 'SC Tal': '🏞️', 'VfB See': '🌊', 'FC Sturm': '🌪️',
  'SV Blitz': '⚡', 'TSV Vulkan': '🌋', 'SC Frost': '❄️', 'VfB Flamme': '🔥',
  'FC Donner': '⛈️', 'SV Schatten': '🌑', 'TSV Nebel': '🌫️', 'SC Licht': '💡',
};

// Feste Teams und Spieler für Anzeige (optional, kannst du erweitern)
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
      // Pro League Teams aus DB holen
      const proLeagueTeams = await Team.find({ league: 'Pro League' });
      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      // Zwei unterschiedliche Teams auswählen
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
          await interaction.followUp('⏰ Zeit abgelaufen! Es wurde kein Tipp abgegeben.');
          return;
        }
        const userTip = reason; // Tipp des Users

        // Spiel simulieren
        const result = simulateGame(team1, team2);

        // Gewinner ermitteln
        let winnerText = '';
        if (result.score1 > result.score2) winnerText = `${icon1} ${team1LastName} gewinnt`;
        else if (result.score1 < result.score2) winnerText = `${icon2} ${team2LastName} gewinnt`;
        else winnerText = 'Unentschieden';

        // Ob der Tipp richtig war
        let correct = false;
        if (userTip === 'draw' && result.score1 === result.score2) correct = true;
        else if (userTip === 'team1' && result.score1 > result.score2) correct = true;
        else if (userTip === 'team2' && result.score1 < result.score2) correct = true;

        // Ergebnis-Embed
        const embedResult = new EmbedBuilder()
          .setTitle('⚽ Spielergebnis')
          .setColor(correct ? 'Green' : 'Red')
          .setDescription(
            `**Endstand:** ${icon1} ${team1LastName} ${result.score1} : ${result.score2} ${icon2} ${team2LastName}\n` +
            `**Tore:**\n${formatGoals(result.goals, teamIcons)}\n\n` +
            `Dein Tipp war **${correct ? 'richtig' : 'falsch'}**!`
          )
          .addFields(
            { name: 'Spielminute', value: `90'`, inline: true },
            { name: 'xG', value: `${result.xG1.toFixed(2)} : ${result.xG2.toFixed(2)}`, inline: true }
          );

        // Ergebnis senden
        await interaction.followUp({ embeds: [embedResult], components: [] });
      });
    } catch (error) {
      console.error('Fehler beim Fußballspiel-Befehl:', error);
      await interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  },
};

// Hilfsfunktionen

function getTwoDifferentTeams(teams) {
  if (teams.length < 2) throw new Error('Nicht genug Teams vorhanden');
  let t1 = teams[Math.floor(Math.random() * teams.length)];
  let t2;
  do {
    t2 = teams[Math.floor(Math.random() * teams.length)];
  } while (t1.name === t2.name);
  return [t1, t2];
}

function generateOdds() {
  // Einfache zufällige Quoten erzeugen (kannst du beliebig anpassen)
  const team1 = (Math.random() * 3 + 1).toFixed(2);
  const draw = (Math.random() * 3 + 2).toFixed(2);
  const team2 = (Math.random() * 3 + 1).toFixed(2);
  return { team1, draw, team2 };
}

function simulateGame(team1, team2) {
  // Simuliere ein Spiel: Tore und xG-Werte zufällig generieren

  const xG1 = Math.random() * 3;
  const xG2 = Math.random() * 3;

  // Tore annähern an xG (Poisson-Verteilung ist genauer, hier einfache Annäherung)
  const score1 = Math.floor(xG1 + Math.random());
  const score2 = Math.floor(xG2 + Math.random());

  // Zufällige Torschützen auswählen
  const goals = [];
  const players1 = teamsData.find(t => t.name === team1.name)?.players || [];
  const players2 = teamsData.find(t => t.name === team2.name)?.players || [];

  // Generiere Tore für Team 1
  for (let i = 0; i < score1; i++) {
    const scorer = players1.length ? players1[Math.floor(Math.random() * players1.length)] : 'Spieler 1';
    goals.push({ team: 'team1', scorer, minute: randomMinute() });
  }

  // Tore für Team 2
  for (let i = 0; i < score2; i++) {
    const scorer = players2.length ? players2[Math.floor(Math.random() * players2.length)] : 'Spieler 2';
    goals.push({ team: 'team2', scorer, minute: randomMinute() });
  }

  // Sortiere Tore nach Minute
  goals.sort((a, b) => a.minute - b.minute);

  return { score1, score2, xG1, xG2, goals };
}

function randomMinute() {
  return Math.floor(Math.random() * 90) + 1;
}

function formatGoals(goals, icons) {
  if (!goals.length) return 'Keine Tore';

  return goals
    .map(g => `${icons[g.team === 'team1' ? 'team1' : 'team2'] || '⚽'} ${g.minute}' - ${g.scorer}`)
    .join('\n');
}
