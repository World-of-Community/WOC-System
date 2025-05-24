const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');

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

      // Zwei unterschiedliche Teams zufällig auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      const team1Name = team1.name;
      const team2Name = team2.name;

      // Quoten initial generieren (vor Spielstart)
      let odds = generateOdds();

      // Status-Embed initial
      let embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${team1Name} vs. ${team2Name}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: `0 - 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
        );

      // Buttons mit aktuellen Quoten
      let buttons = createOddsButtons(team1Name, team2Name, odds);

      // Erstes Reply mit Status
      const statusMessage = await interaction.reply({ embeds: [embedStatus], fetchReply: true });
      // Zweites Reply mit Aufstellung und Buttons
      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${team1Name}:**\n${players1.length > 0 ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${team2Name}:**\n${players2.length > 0 ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

      // Collector für die Tipps (nur 1 Minute, nur vom Command-User)
      const filter = i => i.user.id === interaction.user.id;
      const collector = interaction.channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        time: 60000,
      });

      let userTip = null;

      collector.on('collect', async i => {
        switch (i.customId) {
          case 'win_team1': userTip = 'team1'; break;
          case 'win_team2': userTip = 'team2'; break;
          case 'draw': userTip = 'draw'; break;
          default:
            return await i.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
        }

        await i.update({ content: 'Das Spiel startet... ⚽', embeds: [], components: [] });
        collector.stop();

        // Match simulieren und währenddessen Quoten bei Toren aktualisieren
        await simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip);
      });

      collector.on('end', async collected => {
        if (collected.size === 0) {
          await interaction.editReply({
            content: '⏱️ Zeit abgelaufen, kein Tipp abgegeben.',
            embeds: [],
            components: [],
          });
          await interaction.followUp({ content: 'Das Spiel wurde abgebrochen.', ephemeral: true });
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

function getTwoDifferentTeams(teams) {
  const team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);
  return [teams[team1Index], teams[team2Index]];
}

function generateOdds(score1 = 0, score2 = 0) {
  // Basis-Wahrscheinlichkeiten (ohne Spielstand)
  // Je nachdem wie der Spielstand ist, verändern sich die Wahrscheinlichkeiten
  // z.B.: Führt Team1 deutlich? -> Wahrscheinlichkeit für Sieg Team1 höher
  // Für Demo einfach etwas anpassen:
  let baseProbTeam1 = 0.33;
  let baseProbDraw = 0.34;
  let baseProbTeam2 = 0.33;

  const lead = score1 - score2;

  if (lead > 0) {
    baseProbTeam1 += lead * 0.1;  // je Führungstor +10% Chance Sieg
    baseProbTeam2 -= lead * 0.1;
  } else if (lead < 0) {
    baseProbTeam2 += Math.abs(lead) * 0.1;
    baseProbTeam1 -= Math.abs(lead) * 0.1;
  }

  // Wahrscheinlichkeiten validieren (zwischen 0 und 1)
  baseProbTeam1 = Math.min(Math.max(baseProbTeam1, 0.05), 0.9);
  baseProbTeam2 = Math.min(Math.max(baseProbTeam2, 0.05), 0.9);
  baseProbDraw = 1 - baseProbTeam1 - baseProbTeam2;
  if (baseProbDraw < 0.05) baseProbDraw = 0.05;

  return {
    team1: 1 / baseProbTeam1,
    draw: 1 / baseProbDraw,
    team2: 1 / baseProbTeam2,
  };
}

function createOddsButtons(team1Name, team2Name, odds) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('win_team1')
      .setLabel(`${team1Name} gewinnt (${odds.team1.toFixed(2)})`)
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId('draw')
      .setLabel(`Unentschieden (${odds.draw.toFixed(2)})`)
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId('win_team2')
      .setLabel(`${team2Name} gewinnt (${odds.team2.toFixed(2)})`)
      .setStyle(ButtonStyle.Primary),
  );
}

async function simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip) {
  let score1 = 0;
  let score2 = 0;
  let xG1 = 0.0;
  let xG2 = 0.0;
  const goals = [];

  // Quoten initial
  let odds = generateOdds(score1, score2);

  // Wir simulieren 90 Minuten, 1 Sek pro Minute
  for (let minute = 1; minute <= 90; minute++) {

    // Update Embed mit aktuellem Spielstand
    let embedUpdate = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${team1Name} vs. ${team2Name}`)
      .setColor('Green')
      .addFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Noch keine Ereignisse...' }
      );

    // Button-Update nur, wenn noch nicht getippt wurde
    // (Weil danach wird das Spiel direkt fortgesetzt ohne Buttons)
    // Wir versuchen hier, die Buttons zu aktualisieren mit neuen Quoten
    if (!userTip) {
      odds = generateOdds(score1, score2);
      const buttons = createOddsButtons(team1Name, team2Name, odds);
      await statusMessage.edit({ embeds: [embedUpdate], components: [buttons] });
    } else {
      await statusMessage.edit({ embeds: [embedUpdate], components: [] });
    }

    // Torchance (alle 4 Minuten ca 25%)
    if (minute % 4 === 0 && Math.random() < 0.25) {
      const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
      const xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
      const players = teamScored === 'team1' ? team1.players : team2.players;
      const scorer = players && players.length > 0
        ? players[Math.floor(Math.random() * players.length)]
        : 'Unbekannter Spieler';

      if (teamScored === 'team1') {
        score1++;
        xG1 += xG;
        goals.push(`⚽ Tooor! ${team1Name} - ${scorer} (${minute}')`);
      } else {
        score2++;
        xG2 += xG;
        goals.push(`⚽ Tooor! ${team2Name} - ${scorer} (${minute}')`);
      }
      
      // Quoten neu generieren nach Tor
      odds = generateOdds(score1, score2);
      if (!userTip) {
        const buttons = createOddsButtons(team1Name, team2Name, odds);
        embedUpdate = embedUpdate.setFields(
          { name: 'Spielminute', value: `${minute}'`, inline: true },
          { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
          { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
          { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Noch keine Ereignisse...' }
        );
        await statusMessage.edit({ embeds: [embedUpdate], components: [buttons] });
      }
    }

    await delay(1000);
  }

  // Ergebnis-Embed nach Spielende
  const embedResult = new EmbedBuilder()
    .setTitle(`🏁 Spiel beendet: ${team1Name} vs. ${team2Name}`)
    .setColor(score1 > score2 ? 'Green' : score2 > score1 ? 'Red' : 'Yellow')
    .addFields(
      { name: 'Endstand', value: `${score1} - ${score2}`, inline: true },
      { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
      { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Keine Tore' }
    );

  let tipMessage = '';
  if (userTip === 'team1') {
    tipMessage = score1 > score2
      ? '✅ Du hast richtig getippt! Dein Team hat gewonnen.'
      : '❌ Leider falsch getippt. Dein Team hat nicht gewonnen.';
  } else if (userTip === 'team2') {
    tipMessage = score2 > score1
      ? '✅ Du hast richtig getippt! Dein Team hat gewonnen.'
      : '❌ Leider falsch getippt. Dein Team hat nicht gewonnen.';
  } else if (userTip === 'draw') {
    tipMessage = score1 === score2
      ? '✅ Du hast richtig getippt! Das Spiel endete unentschieden.'
      : '❌ Leider falsch getippt. Das Spiel endete nicht unentschieden.';
  }

  await interaction.followUp({ embeds: [embedResult], content: tipMessage });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*

const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
} = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');

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

      // Zwei unterschiedliche Teams zufällig auswählen
      const [team1, team2] = getTwoDifferentTeams(proLeagueTeams);

      // Nur Teamnamen (ohne Icon)
      const team1Name = team1.name;
      const team2Name = team2.name;

      // Quoten generieren
      const odds = generateOdds();

      // Status-Embed
      const embedStatus = new EmbedBuilder()
        .setTitle(`🏟️ Fußballspiel: ${team1Name} vs. ${team2Name}`)
        .setColor('Green')
        .addFields(
          { name: 'Spielminute', value: '0\'', inline: true },
          { name: 'Spielstand', value: `0 - 0`, inline: true },
          { name: 'xG', value: `0.00 : 0.00`, inline: true },
          { name: 'Ereignisse', value: 'Noch keine Ereignisse...' }
        );

      // Aufstellung-Embed
      const players1 = team1.players || [];
      const players2 = team2.players || [];

      const embedLineup = new EmbedBuilder()
        .setTitle('📋 Aufstellung')
        .setColor('Blue')
        .setDescription(
          `**${team1Name}:**\n${players1.length > 0 ? players1.join(', ') : 'Keine Spieler-Daten'}\n\n` +
          `**${team2Name}:**\n${players2.length > 0 ? players2.join(', ') : 'Keine Spieler-Daten'}`
        );

      // Buttons ohne Icons
      const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('win_team1')
          .setLabel(`${team1Name} gewinnt (${odds.team1.toFixed(2)})`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('draw')
          .setLabel(`Unentschieden (${odds.draw.toFixed(2)})`)
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('win_team2')
          .setLabel(`${team2Name} gewinnt (${odds.team2.toFixed(2)})`)
          .setStyle(ButtonStyle.Primary),
      );

      const statusMessage = await interaction.reply({ embeds: [embedStatus], fetchReply: true });
      await interaction.followUp({ embeds: [embedLineup], components: [buttons] });

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

        await i.update({ content: 'Das Spiel startet... ⚽', embeds: [], components: [] });
        collector.stop();

        await simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip);
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

function getTwoDifferentTeams(teams) {
  const team1Index = Math.floor(Math.random() * teams.length);
  let team2Index;
  do {
    team2Index = Math.floor(Math.random() * teams.length);
  } while (team2Index === team1Index);
  return [teams[team1Index], teams[team2Index]];
}

function generateOdds() {
  const probTeam1 = Math.random() * 0.5 + 0.25;
  const probTeam2 = Math.random() * (1 - probTeam1);
  const probDraw = 1 - probTeam1 - probTeam2;

  return {
    team1: 1 / probTeam1,
    draw: 1 / probDraw,
    team2: 1 / probTeam2,
  };
}

async function simulateMatch(interaction, statusMessage, team1, team2, team1Name, team2Name, userTip) {
  let score1 = 0;
  let score2 = 0;
  let xG1 = 0.0;
  let xG2 = 0.0;
  const goals = [];

  for (let minute = 1; minute <= 90; minute++) {
    const embedUpdate = EmbedBuilder.from(statusMessage.embeds[0])
      .setFields(
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score1} - ${score2}`, inline: true },
        { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
        { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Noch keine Ereignisse...' }
      );

    await statusMessage.edit({ embeds: [embedUpdate] });

    if (minute % 4 === 0 && Math.random() < 0.25) {
      const teamScored = Math.random() < 0.5 ? 'team1' : 'team2';
      const xG = parseFloat((Math.random() * 0.5 + 0.1).toFixed(2));
      const players = teamScored === 'team1' ? team1.players : team2.players;
      const scorer = players && players.length > 0
        ? players[Math.floor(Math.random() * players.length)]
        : 'Unbekannter Spieler';

      if (teamScored === 'team1') {
        score1++;
        xG1 += xG;
        goals.push(`⚽ Tooor! ${team1Name} - ${scorer} (${minute}')`);
      } else {
        score2++;
        xG2 += xG;
        goals.push(`⚽ Tooor! ${team2Name} - ${scorer} (${minute}')`);
      }
    }

    await delay(1000);
  }

  const embedResult = new EmbedBuilder()
    .setTitle(`🏁 Spiel beendet: ${team1Name} vs. ${team2Name}`)
    .setColor(score1 > score2 ? 'Green' : score2 > score1 ? 'Red' : 'Yellow')
    .addFields(
      { name: 'Endstand', value: `${score1} - ${score2}`, inline: true },
      { name: 'xG', value: `${xG1.toFixed(2)} : ${xG2.toFixed(2)}`, inline: true },
      { name: 'Ereignisse', value: goals.length > 0 ? goals.join('\n') : 'Keine Tore' }
    );

  let tipMessage = '';
  if (userTip === 'team1') {
    tipMessage = score1 > score2
      ? '✅ Du hast richtig getippt! Dein Team hat gewonnen.'
      : '❌ Leider falsch getippt. Dein Team hat nicht gewonnen.';
  } else if (userTip === 'team2') {
    tipMessage = score2 > score1
      ? '✅ Du hast richtig getippt! Dein Team hat gewonnen.'
      : '❌ Leider falsch getippt. Dein Team hat nicht gewonnen.';
  } else if (userTip === 'draw') {
    tipMessage = score1 === score2
      ? '✅ Du hast richtig getippt! Das Spiel endete unentschieden.'
      : '❌ Leider falsch getippt. Das Spiel endete nicht unentschieden.';
  }

  await interaction.followUp({ embeds: [embedResult], content: tipMessage });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

*/
