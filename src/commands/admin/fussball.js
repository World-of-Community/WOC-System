const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');

// alle 1 minte das embed und die minte aktualisieren bearbeiten

const teamIcons = {
  'FC Adler': '🦅', 'SV Löwen': '🦁', 'TSV Eiche': '🌳', 'SC Blau': '🔵',
  'VfB Stern': '⭐', 'FC Rot-Weiß': '🔴⚪', 'SV Grünwald': '🌲', 'TSV Nord': '❄️',
  'SC Süd': '☀️', 'VfB West': '🌅', 'FC Ostwind': '🌬️', 'SV Nordstern': '🌟',
  'TSV Berg': '⛰️', 'SC Tal': '🏞️', 'VfB See': '🌊', 'FC Sturm': '🌪️',
  'SV Blitz': '⚡', 'TSV Vulkan': '🌋', 'SC Frost': '❄️', 'VfB Flamme': '🔥',
  'FC Donner': '⛈️', 'SV Schatten': '🌑', 'TSV Nebel': '🌫️', 'SC Licht': '💡',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!'),

  async execute(interaction) {
    try {
      // Lade alle Teams aus der "Pro League"
      const proLeagueTeams = await Team.find({ league: 'Pro League' });

      if (!proLeagueTeams || proLeagueTeams.length < 2) {
        return interaction.reply({
          content: '❌ Es sind nicht genug Teams in der Pro League Datenbank.',
          ephemeral: true,
        });
      }

      // Zwei unterschiedliche Teams zufällig auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);
      const icon1 = teamIcons[team1.name] || '⚽';
      const icon2 = teamIcons[team2.name] || '⚽';

      // Letzten Teil des Teamnamens für bessere Darstellung
      const team1LastName = team1.name.split(' ').slice(1).join(' ') || team1.name;
      const team2LastName = team2.name.split(' ').slice(1).join(' ') || team2.name;

      // Quoten generieren (Odds)
      const odds = generateOdds();

      // Initiales Status-Embed mit Spielminute, Spielstand und xG
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${icon1} ${team1LastName} vs. ${icon2} ${team2LastName}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: `0 : 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Tore', value: 'Noch keine Tore...' }
        );

      // Spieleraufstellung-Embed
      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${icon1} ${team1LastName}:**\n${players1.length > 0 ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${icon2} ${team2LastName}:**\n${players2.length > 0 ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons für Tipps
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('win_team1')
          .setLabel(`${icon1} ${team1LastName} gewinnt (${odds.team1.toFixed(2)})`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('draw')
          .setLabel(`Unentschieden (${odds.draw.toFixed(2)})`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('win_team2')
          .setLabel(`${icon2} ${team2LastName} gewinnt (${odds.team2.toFixed(2)})`)
          .setStyle(ButtonStyle.Primary),
      );

      // Sende Status-Embed und dann Aufstellung + Buttons als FollowUp
      const statusMessage = await interaction.reply({ embeds: [embedStatus], fetchReply: true });
      await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

      // Button Collector (nur für den Kommando-Aufrufer)
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000, // 1 Minute Zeit zum Tippen
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

        // Antwort auf Button klicken: Startmeldung und Buttons entfernen
        await i.update({ content: 'Das Spiel startet... ⚽', embeds: [], components: [] });
        collector.stop();

        // Simulation starten
        await simulateMatch(interaction, statusMessage, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip);
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: '⏱️ Zeit abgelaufen, kein Tipp abgegeben.',
            embeds: [],
            components: [],
          });
        }
      });

    } catch (error) {
      console.error('❌ Fehler im /fussball Command:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Ein Fehler ist aufgetreten.', ephemeral: true });
      }
    }
  },
};

// Hilfsfunktion: Zwei verschiedene Teams zufällig auswählen
function getTwoDifferentTeams(teams) {
  const team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);
  return [teams[team1Index], teams[team2Index]];
}

// Quoten generieren (invertierte Wahrscheinlichkeit)
function generateOdds() {
  const probTeam1 = Math.random() * 0.5 + 0.25; // zwischen 0.25 und 0.75
  const probTeam2 = Math.random() * (1 - probTeam1);
  const probDraw = 1 - probTeam1 - probTeam2;

  return {
    team1: 1 / probTeam1,
    draw: 1 / probDraw,
    team2: 1 / probTeam2,
  };
}

// Spielsimulation mit 90 "Spielminuten"
async function simulateMatch(interaction, statusMessage, team1, team2, icon1, icon2, team1LastName, team2LastName, userTip) {
  let score1 = 0;
  let score2 = 0;
  let xG1 = 0.0;
  let xG2 = 0.0;
  const goals = [];

  for (let minute = 1; minute <= 90; minute++) {
    // Alle 1 Minute das Embed aktualisieren
    const embedUpdate = EmbedBuilder.from(statusMessage.embeds[0])
      .setFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} : ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Noch keine Ereignisse...' }
      );

    await statusMessage.edit({ embeds: [embedUpdate] });

    // Alle 5 Minuten mit 10% Chance ein Tor
    if (minute % 5 === 0 && Math.random() < 0.1) {
      const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
      const xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
      const players = teamScored === 'team1' ? team1.players : team2.players;
      const scorer = players && players.length > 0
        ? players[Math.floor(Math.random() * players.length)]
        : 'Unbekannt';

      if (teamScored === 'team1') {
        score1++;
        xG1 += xG;
      } else {
        score2++;
        xG2 += xG;
      }

      goals.push(`⚽ Tooor! ${teamScored === 'team1' ? icon1 : icon2} **${scorer}** (${minute}')`);
    }

    // 1000 ms warten = 1 Spielminute simulieren (kann an die gewünschte Geschwindigkeit angepasst werden)
    await new Promise(r => setTimeout(r, 1000));
  }

  // Endstand-Embed
  const finalEmbed = new EmbedBuilder()
    .setTitle(`🏁 Endstand: ${icon1} ${team1LastName} ${score1} : ${score2} ${icon2} ${team2LastName}`)
    .setColor('Gold')
    .addFields(
      { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
      { name: 'Tore', value: goals.length > 0 ? goals.join('\n') : 'Keine Tore im Spiel.' }
    );

  await interaction.followUp({ embeds: [finalEmbed] });

  // Ergebnis mit Tipp vergleichen
  const winner = score1 > score2 ? 'team1' : score2 > score1 ? 'team2' : 'draw';
  const resultText = userTip === winner
    ? '🎉 Du hast richtig getippt!'
    : '❌ Dein Tipp war leider falsch.';

  await interaction.followUp({ content: resultText });
}
