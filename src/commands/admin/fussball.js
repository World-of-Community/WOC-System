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
  { "name": "SC Licht", "players": ["Günther", "Kaiser", "Sachs", "Mayer"] }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
      const proLeagueTeams = await Team.find({ league: 'Pro League' });
      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      const odds = generateOdds();

      // Startwerte für Spielminute, Tore, xG, Ereignisse
      let spielminute = 0;
      let tore1 = 0;
      let tore2 = 0;
      let xg1 = 0;
      let xg2 = 0;
      let ereignisse = 'Noch keine Ereignisse...';

      // Erstelle das initiale Status-Embed
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

      // Spieler aus dem Array holen (für Aufstellung)
      const players1 = teamsData.find(t => t.name === team1.name)?.players || [];
      const players2 = teamsData.find(t => t.name === team2.name)?.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

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
      await interaction.reply({ embeds: [embedStatus()] });
      // Aufstellung + Buttons senden
      const lineupMessage = await interaction.followUp({ embeds: [embedLineup], components: [buttons], fetchReply: true });

      // Collector für Buttonklicks (nur vom Interaktionsuser)
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });

      // Interval zum Updaten des Status-Embeds jede Minute (max 90 Minuten)
      const maxMinutes = 90;
      let interval = setInterval(async () => {
        spielminute += 1;

        // Simuliere etwas Spielverlauf (xG + Tore zufällig erhöhen)
        const xg1Inc = Math.random() * 0.1;
        const xg2Inc = Math.random() * 0.1;
        xg1 += xg1Inc;
        xg2 += xg2Inc;

        // Chance für Tor (klein, basierend auf xG-Inkrement)
        if (Math.random() < xg1Inc * 0.2) tore1++;
        if (Math.random() < xg2Inc * 0.2) tore2++;

        // Beispiel Ereignis (alle 15 Minuten)
        if (spielminute % 15 === 0) {
          ereignisse = `⚽ Tore: ${tore1} : ${tore2} - Spielminute: ${spielminute}'`;
        }

        // Embed aktualisieren
        try {
          await interaction.editReply({ embeds: [embedStatus()] });
        } catch (e) {
          console.error('Fehler beim Aktualisieren des Status-Embeds:', e);
        }

        if (spielminute >= maxMinutes) clearInterval(interval);
      }, 60_000);

      // Ergebnis-Embed vorbereiten
      const embedResult = new EmbedBuilder()
        .setTitle('🎉 Ergebnis')
        .setColor('Gold')
        .setDescription(
          `Das Spiel ist beendet!\n\n` +
          `${icon1} ${team1LastName}: ${tore1} Tore\n` +
          `${icon2} ${team2LastName}: ${tore2} Tore\n\n` +
          `xG:\n${icon1} ${xg1.toFixed(2)} : ${xg2.toFixed(2)} ${icon2}`
        );

      // Collector Event: Button wurde gedrückt
      collector.on('collect', async i => {
        await i.deferUpdate();

        let tip;

        switch (i.customId) {
          case 'win_team1': tip = team1.name; break;
          case 'draw': tip = 'Unentschieden'; break;
          case 'win_team2': tip = team2.name; break;
          default: tip = 'Keine gültige Auswahl'; break;
        }

        // Collector stoppen, wenn ein Tipp abgegeben wurde
        collector.stop();

        clearInterval(interval);

        // Ergebnis ausgeben mit Tipp
        embedResult.addFields({ name: 'Dein Tipp', value: tip, inline: false });

        await interaction.followUp({ embeds: [embedResult] });
      });

      // Collector Ende (Timeout)
      collector.on('end', async collected => {
        if (collected.size === 0) {
          clearInterval(interval);
          await interaction.followUp({ content: '⏰ Zeit abgelaufen, du hast keinen Tipp abgegeben!' });
        }
      });

    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ Beim Starten des Spiels ist ein Fehler aufgetreten.',
        ephemeral: true,
      });
    }
  },
};

// Hilfsfunktionen

function getTwoDifferentTeams(teams) {
  if (teams.length < 2) return [];
  let idx1 = Math.floor(Math.random() * teams.length);
  let idx2;
  do {
    idx2 = Math.floor(Math.random() * teams.length);
  } while (idx2 === idx1);
  return [teams[idx1], teams[idx2]];
}

function generateOdds() {
  // Zufallsquoten (einfaches Beispiel)
  const team1 = (Math.random() * 2 + 1).toFixed(2);
  const draw = (Math.random() * 3 + 2).toFixed(2);
  const team2 = (Math.random() * 2 + 1).toFixed(2);
  return { team1, draw, team2 };
}
