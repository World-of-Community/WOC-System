const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, PermissionFlagsBits } = require('discord.js');
const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
];

const teamsData = [
  { name: "FC Adler", players: ["Müller", "Schmidt", "Fischer", "Weber"], stadium: "Adler Arena" },
  { name: "SV Löwen", players: ["Schneider", "Wagner", "Becker", "Hoffmann"], stadium: "Löwenstein-Stadion" },
  { name: "TSV Eiche", players: ["Bauer", "Koch", "Richter", "Klein"], stadium: "Stadion am Eichenweg" },
  { name: "SC Blau", players: ["Wolf", "Neumann", "Schröder", "Krüger"], stadium: "Blau-Weiß Arena" },
  { name: "VfB Stern", players: ["Hartmann", "Lange", "Schmitt", "Werner"], stadium: "Sternenfelder Stadion" },
  { name: "FC Rot-Weiß", players: ["Krause", "Meier", "Schulz", "Hahn"], stadium: "RW Arena" },
  { name: "SV Grünwald", players: ["König", "Fuchs", "Bergmann", "Lorenz"], stadium: "Grünwaldstadion" },
  { name: "TSV Nord", players: ["Frank", "Mayer", "Jung", "Albrecht"], stadium: "Nordstadion" },
  { name: "SC Süd", players: ["Böhm", "Engel", "Jäger", "Brandt"], stadium: "Südpark Stadion" },
  { name: "VfB West", players: ["Peters", "Simon", "Vogel", "Friedrich"], stadium: "Stadion am Westufer" },
  { name: "FC Ostwind", players: ["Paul", "Hoffmeister", "Bender", "Keller"], stadium: "Ostwind-Arena" },
  { name: "SV Nordstern", players: ["Mayerhofer", "Schulze", "Graf", "Krafft"], stadium: "Nordstern-Stadion" },
  { name: "TSV Berg", players: ["Winkler", "Horn", "Seidel", "Busch"], stadium: "Bergstadion" },
  { name: "SC Tal", players: ["Zimmermann", "Lutz", "Hahn", "Franke"], stadium: "Talgrund-Stadion" },
  { name: "VfB See", players: ["Döring", "Kuhn", "Voigt", "Bach"], stadium: "Seestadion" },
  { name: "FC Sturm", players: ["Schulz", "Ritter", "Heinrich", "Friedl"], stadium: "Sturmfeld Arena" },
  { name: "SV Blitz", players: ["Köhler", "Dietrich", "Eckert", "Löwe"], stadium: "Blitz Arena" },
  { name: "TSV Vulkan", players: ["Maier", "Groß", "Schulze", "Hoffmann"], stadium: "Vulkanstadion" },
  { name: "SC Frost", players: ["Schuster", "Brand", "Sauer", "Lang"], stadium: "Frostpark" },
  { name: "VfB Flamme", players: ["Reuter", "Schiller", "Born", "Herz"], stadium: "Flammenarena" },
  { name: "FC Donner", players: ["Lorenz", "Bauer", "Wolf", "Schmid"], stadium: "Donnerdom Arena" },
  { name: "SV Schatten", players: ["Ziegler", "Beck", "Kruse", "Hart"], stadium: "Schattenfeldstadion" },
  { name: "TSV Nebel", players: ["Lang", "Winter", "Schwarz", "Beier"], stadium: "Stadion am Nebelhang" },
  { name: "SC Licht", players: ["Günther", "Kaiser", "Sachs", "Mayer"], stadium: "Lichtstadion" }
];

const fixedTimes = [
  { name: '00:30', value: '00:30' },
  { name: '01:30', value: '01:30' },
  { name: '02:00', value: '02:00' },
  { name: '04:00', value: '04:00' },
  { name: '06:00', value: '06:00' },
  { name: '07:30', value: '07:30' },
  { name: '09:00', value: '09:00' },
  { name: '09:30', value: '09:30' },
  { name: '10:30', value: '10:30' },
  { name: '11:00', value: '11:00' },
  { name: '11:30', value: '11:30' },
  { name: '12:30', value: '12:30' },
  { name: '13:30', value: '13:30' },
  { name: '14:00', value: '14:00' },
  { name: '15:00', value: '15:00' },
  { name: '15:30', value: '15:30' },
  { name: '16:45', value: '16:45' },
  { name: '18:00', value: '18:00' },
  { name: '18:30', value: '18:30' },
  { name: '19:00', value: '19:00' },
  { name: '19:30', value: '19:30' },
  { name: '20:00', value: '20:00' },
  { name: '20:30', value: '20:30' },
  { name: '21:45', value: '21:45' },
  { name: '23:00', value: '23:00' }
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
        points: 0
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

  const description = `╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮\n` +
    proLeagueData.map((t, i) => {
      const platz = (i + 1).toString().padStart(2, ' ');
      return `┃ **${platz}.** ${t.name.padEnd(15)} | Sp: ${t.played.toString().padStart(2)} | S: ${t.won.toString().padStart(2)} | U: ${t.draw.toString().padStart(2)} | N: ${t.lost.toString().padStart(2)} | T: ${t.goalsFor.toString().padStart(2)} | GT: ${t.goalsAgainst.toString().padStart(2)} | TD: ${t.goalDifference.toString().padStart(3)} | Pkte: ${t.points.toString().padStart(3)} `;
    }).join('\n') +
    `\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`;

  return new EmbedBuilder()
    .setTitle('🏆 Pro League Tabelle')
    .setDescription(description || 'Keine Daten vorhanden')
    .setColor(0xFFD700)
    .setFooter({ text: 'Zuletzt aktualisiert' })
    .setTimestamp();
}

async function createNextMatchdayEmbed() {
  const now = new Date();

  const nextMatches = await Match.find({ date: { $gte: now } })
    .sort({ date: 1 })
    .limit(10);

  if (!nextMatches.length) {
    return new EmbedBuilder()
      .setTitle('📅 Nächster Spieltag')
      .setDescription('Keine Spiele für den nächsten Spieltag gefunden.')
      .setColor(0x00BFFF);
  }

  const nextMatchdayNumber = nextMatches[0].matchday;
  const matchdayGames = await Match.find({ matchday: nextMatchdayNumber }).sort({ date: 1 });

  const matchdayText = matchdayGames.map(m => {
    const dateStr = new Date(m.date).toLocaleString('de-DE', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
    });
    return `${m.homeTeam} vs ${m.awayTeam} - ${dateStr}`;
  }).join('\n');

  return new EmbedBuilder()
    .setTitle(`📅 Nächster Spieltag: Spieltag ${nextMatchdayNumber}`)
    .setDescription(matchdayText)
    .setColor(0x00BFFF);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-system')
    .setDescription('Fussball System')
    .addSubcommand((command) => 
      command
        .setName('fussball-match')
        .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!')
    )
    .addSubcommand((command) => 
      command
        .setName('fussball-manage')
        .setDescription('Verwalte Fußballteams')
        .addSubcommand(sub =>
          sub.setName('add')
          .setDescription('Füge ein Fußballteam hinzu')
          .addStringOption(opt =>
            opt.setName('teamname')
            .setDescription('Name des Teams')
            .setRequired(true))
          .addStringOption(opt =>
            opt.setName('emoji')
            .setDescription('Emoji/Icon für das Team')
            .setRequired(true)))
        .addSubcommand(sub =>
          sub.setName('remove')
          .setDescription('Entferne ein Fußballteam')
          .addStringOption(opt =>
            opt.setName('teamname')
            .setDescription('Name des Teams')
            .setRequired(true)))
        .addSubcommand(sub =>
          sub.setName('add-player')
          .setDescription('Füge einen Spieler zu einem Team hinzu')
          .addStringOption(opt =>
            opt.setName('teamname')
            .setDescription('Name des Teams')
            .setRequired(true))
          .addStringOption(opt =>
            opt.setName('spieler')
            .setDescription('Name des Spielers')
            .setRequired(true))
        )
    )
    .addSubcommand((command) => 
      command
        .setName('fussball-spieler-hinzufügen')
        .setDescription('Füge einem Team einen Spieler hinzu.')
        .addStringOption(opt =>
          opt.setName('team')
            .setDescription('Name des Teams')
            .setRequired(true))
        .addStringOption(opt =>
          opt.setName('spieler')
            .setDescription('Name des Spielers')
            .setRequired(true))
    )
    .addSubcommand((command) => 
      command
        .setName('spiel-erstellen')
        .setDescription('Erstellt ein Spiel mit Datum und fester Uhrzeit')
        .addStringOption(option =>
          option.setName('heimteam')
            .setDescription('Heimteam auswählen')
            .setRequired(true)
            .addChoices(...proLeagueTeams.map(team => ({ name: team, value: team }))))
        .addStringOption(option =>
          option.setName('auswaertsteam')
            .setDescription('Auswärtsteam auswählen')
            .setRequired(true)
            .addChoices(...proLeagueTeams.map(team => ({ name: team, value: team }))))
        .addIntegerOption(option =>
          option.setName('spieltag')
            .setDescription('Spieltag auswählen (1-34)')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('uhrzeit')
            .setDescription('Uhrzeit auswählen')
            .setRequired(true)
            .addChoices(...fixedTimes))
        .addStringOption(option =>
          option.setName('datum')
            .setDescription('Datum im Format TT.MM.JJJJ')
            .setRequired(true))
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const overviewEmbed = new EmbedBuilder()
      .setTitle('`⚽` » Fußball Übersicht')
      .setDescription(
        'Die **Pro League** ist die höchste Spielklasse in unserem Fußball-Universum. Hier treffen die besten Mannschaften aufeinander, um Ruhm, Ehre und den begehrten Meistertitel zu kämpfen. Nur die stärksten Teams schaffen es in diese Liga – hier zählen Taktik, Teamgeist und Strategie.\n\n' +
        '- `💥` » **Spannende Matches** mit Live-Statistiken\n' +
        '- `🏆` » **Kampf um den Meistertitel** unter den besten Teams\n' +
        '- `📊` » **Detaillierte Spielerwerte** und Teamdaten\n\n' +
        'Wähle unten eine Option aus, um die Tabelle oder den nächsten Spieltag anzuzeigen.'
      )
      .setColor('Blurple');

    const buttons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('show_table')
        .setLabel('📄 Tabelle')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('next_matchday')
        .setLabel('📅 Nächster Spieltag')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({ content: 'Fussball Übersicht gesendet.', ephemeral: true });
    const replymessage = await interaction.channel.send({ embeds: [overviewEmbed], components: [buttons], fetchReply: true });

    const collector = replymessage.createMessageComponentCollector({ componentType: ComponentType.Button });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Nur du kannst die Buttons benutzen!', ephemeral: true });
      }

      if (i.customId === 'show_table') {
        const tableEmbed = await createTabelleEmbed();
        await i.deferUpdate();
        await interaction.followUp({ embeds: [tableEmbed], ephemeral: true });
      }

      if (i.customId === 'next_matchday') {
        const matchdayEmbed = await createNextMatchdayEmbed();
        await i.deferUpdate();
        await interaction.followUp({ embeds: [matchdayEmbed], ephemeral: true });
      }
    });

    collector.on('end', async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        buttons.components.map(button => button.setDisabled(true))
      );
      await replymessage.edit({ components: [disabledRow] });
    });
  }
};
