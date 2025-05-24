const { 
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb'); // Deine DB-Verbindung

const teamIcons = {
  'FC Adler': '🦅', 'SV Löwen': '🦁', 'TSV Eiche': '🌳', 'SC Blau': '🔵',
  'VfB Stern': '⭐', 'FC Rot-Weiß': '🔴⚪', 'SV Grünwald': '🌲', 'TSV Nord': '❄️',
  'SC Süd': '☀️', 'VfB West': '🌅', 'FC Ostwind': '🌬️', 'SV Nordstern': '🌟',
  'TSV Berg': '⛰️', 'SC Tal': '🏞️', 'VfB See': '🌊', 'FC Sturm': '🌪️',
  'SV Blitz': '⚡', 'TSV Vulkan': '🌋', 'SC Frost': '❄️', 'VfB Flamme': '🔥',
  'FC Donner': '⛈️', 'SV Schatten': '🌑', 'TSV Nebel': '🌫️', 'SC Licht': '💡',
};

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
  { "name": "SC Licht", "players": ["Günther", "Kaiser", "Sachs", "Mayer"] },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
      // Lade Teams aus der DB, die in der Pro League sind
      const proLeagueTeams = await Team.find({ league: 'Pro League' });
      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      // Wähle zwei verschiedene Teams zufällig aus
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      // Icons holen oder Standard
      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // Kürzere Teamnamen (falls mit Leerzeichen)
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      // Wettquoten generieren
      const odds = generateOdds();

      // Startwerte
      let spielminute = 0;
      let tore1 = 0;
      let tore2 = 0;
      let xg1 = 0;
      let xg2 = 0;
      let ereignisse = 'Noch keine Ereignisse...';

      // Embed-Funktion für Spielstatus (wird bei jedem Update neu gebaut)
      const embedStatus = () =>
        new EmbedBuilder()
          .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
          .setColor('Green')
          .addFields(
            { name: 'Spielminute', value: `${spielminute}'`, inline: true },
            { name: 'Spielstand', value: `${tore1} : ${tore2}`, inline: true },
            { name: 'xG', value: `${xg1.toFixed(2)} : ${xg2.toFixed(2)}`, inline: true },
            { name: 'Ereignisse', value: ereignisse }
          );

      // Spieler-Aufstellung aus teamsData laden
      const players1 = teamsData.find(t => t.name === team1.name)?.players || [];
      const players2 = teamsData.find(t => t.name === team2.name)?.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons für Tipps
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

      // Sende initialen Status-Embed
      await interaction.reply({ embeds: [embedStatus()] });
      // Sende Aufstellung + Buttons
      await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

      // Button Collector zum Abfangen des Tipps vom User
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60 * 1000,
      });

      const maxMinutes = 90;

      // Spielminute alle 1 Minute erhöhen und Spielstatus aktualisieren
      const interval = setInterval(async () => {
        spielminute++;

        // Zufällige xG-Zunahmen
        const xg1Inc = Math.random() * 0.12;
        const xg2Inc = Math.random() * 0.12;
        xg1 += xg1Inc;
        xg2 += xg2Inc;

        // Tore mit kleiner Wahrscheinlichkeit basierend auf xG-Inkrement
        if (Math.random() < xg1Inc * 0.25) {
          tore1++;
          ereignisse = `⚽ Tor für ${icon1} ${team1LastName} in der ${spielminute}'!`;
        } else if (Math.random() < xg2Inc * 0.25) {
          tore2++;
          ereignisse = `⚽ Tor für ${icon2} ${team2LastName} in der ${spielminute}'!`;
        } else {
          ereignisse = 'Keine Tore in dieser Minute.';
        }

        // Editiere den Status-Embed (in der ersten Antwort)
        try {
          const message = await interaction.fetchReply();
          await message.edit({ embeds: [embedStatus()] });
        } catch (e) {
          // Fehler ignorieren
        }

        if (spielminute >= maxMinutes) {
          clearInterval(interval);
          collector.stop('Spiel beendet');
        }
      }, 10 * 1000); // 10 Sekunden pro Spielminute für Demo, bei echtem Spiel 60000

      let tipperChoice = null;

      collector.on('collect', async i => {
        if (i.user.id !== interaction.user.id) {
          return i.reply({ content: 'Nur du kannst hier tippen!', ephemeral: true });
        }

        tipperChoice = i.customId;

        await i.update({
          content: `Du hast getippt: ${
            tipperChoice === 'win_team1' ? `${icon1} ${team1LastName}` :
            tipperChoice === 'draw' ? 'Unentschieden' :
            `${icon2} ${team2LastName}`
          }`,
          components: [],
          embeds: [embedStatus(), embedLineup]
        });
      });

      collector.on('end', async (_, reason) => {
        clearInterval(interval);

        // Ergebnis ermitteln
        let ergebnisText;
        if (tore1 > tore2) ergebnisText = `${icon1} ${team1LastName} gewinnt!`;
        else if (tore2 > tore1) ergebnisText = `${icon2} ${team2LastName} gewinnt!`;
        else ergebnisText = 'Unentschieden!';

        let tippRichtig = false;
        if (tipperChoice === 'win_team1' && tore1 > tore2) tippRichtig = true;
        else if (tipperChoice === 'win_team2' && tore2 > tore1) tippRichtig = true;
        else if (tipperChoice === 'draw' && tore1 === tore2) tippRichtig = true;

        const finalEmbed = new EmbedBuilder()
          .setTitle('🏁 Spiel beendet')
          .setColor(tippRichtig ? 'Green' : 'Red')
          .setDescription(
            `Endergebnis:\n${icon1} ${team1LastName} ${tore1} : ${tore2} ${icon2} ${team2LastName}\n` +
            `${ergebnisText}\n\n` +
            (tipperChoice
              ? `Dein Tipp: ${
                  tipperChoice === 'win_team1' ? `${icon1} ${team1LastName}` :
                  tipperChoice === 'draw' ? 'Unentschieden' :
                  `${icon2} ${team2LastName}`
                }\n${tippRichtig ? '✅ Du hast richtig getippt!' : '❌ Leider falsch getippt.'}`
              : 'Du hast nicht getippt.')
          );

        try {
          const msg = await interaction.fetchReply();
          await msg.edit({ embeds: [finalEmbed], components: [] });
        } catch {}

      });

    } catch (error) {
      console.error(error);
      return interaction.reply({ content: '❌ Ein Fehler ist aufgetreten.', ephemeral: true });
    }
  }
};

function getTwoDifferentTeams(teams) {
  if (teams.length < 2) return [];

  const idx1 = Math.floor(Math.random() * teams.length);
  let idx2 = Math.floor(Math.random() * teams.length);
  while (idx2 === idx1) idx2 = Math.floor(Math.random() * teams.length);

  return [teams[idx1], teams[idx2]];
}

function generateOdds() {
  // Einfache, plausible Wettquoten: Favorit leicht unter 2.0, Außenseiter höher, Unentschieden dazwischen
  // Zufall für Favoriten
  const fav = Math.random();
  if (fav < 0.33) {
    return { team1: '1.75', draw: '3.40', team2: '4.10' };
  } else if (fav < 0.66) {
    return { team1: '2.10', draw: '3.10', team2: '2.90' };
  } else {
    return { team1: '4.00', draw: '3.20', team2: '1.65' };
  }
}
