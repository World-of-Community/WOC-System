const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  ComponentType, 
  PermissionFlagsBits 
} = require('discord.js');

const { Team } = require('../../../Datenbank/fussballdb');
const { Match } = require('../../../Datenbank/matchdb');

const proLeagueTeams = [
  'FC Adler', 'SV Löwen', 'TSV Eiche', 'SC Blau', 'VfB Stern',
  'FC Rot-Weiß', 'SV Grünwald', 'TSV Nord', 'SC Süd', 'VfB West',
  'FC Ostwind', 'SV Nordstern', 'TSV Berg', 'SC Tal', 'VfB See',
  'FC Sturm', 'SV Blitz', 'TSV Vulkan', 'SC Frost', 'VfB Flamme',
  'FC Donner', 'SV Schatten', 'TSV Nebel', 'SC Licht'
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

// Erzeugt das Tabellen-Embed mit den aktuellen Team-Daten
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

// Erzeugt das Embed für den nächsten Spieltag mit den nächsten Spielen
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
    // hier Subcommands/SubcommandGroups hinzufügen wie in deinem Beispiel
    .addSubcommand((command) =>
      command
        .setName('fussball-match')
        .setDescription('Starte ein Fußballspiel und tippe, wer gewinnt!')
    )
    .addSubcommandGroup(group =>
      group
        .setName('fussball-manage')
        .setDescription('Verwalte Fußballteams')
        .addSubcommand(sub =>
          sub
            .setName('add')
            .setDescription('Füge ein Fußballteam hinzu')
            .addStringOption(opt =>
              opt.setName('teamname')
                .setDescription('Name des Teams')
                .setRequired(true))
            .addStringOption(opt =>
              opt.setName('emoji')
                .setDescription('Emoji/Icon für das Team')
                .setRequired(true))
        )
        .addSubcommand(sub =>
          sub
            .setName('remove')
            .setDescription('Entferne ein Fußballteam')
            .addStringOption(opt =>
              opt.setName('teamname')
                .setDescription('Name des Teams')
                .setRequired(true))
        )
        .addSubcommand(sub =>
          sub
            .setName('add-player')
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
        .setName('spieler-hinzufügen')
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
            .setDescription('Datum im Format YYYY-MM-DD')
            .setRequired(true))
    ),
  async execute(interaction) {
    const subCommand = interaction.options.getSubcommand(false);
    const subCommandGroup = interaction.options.getSubcommandGroup(false);

    // Beispiel für Subcommands
    if (subCommand === 'spiel-erstellen') {
      const heimteam = interaction.options.getString('heimteam');
      const auswaertsteam = interaction.options.getString('auswaertsteam');
      const spieltag = interaction.options.getInteger('spieltag');
      const uhrzeit = interaction.options.getString('uhrzeit');
      const datum = interaction.options.getString('datum');

      // Datum & Uhrzeit kombinieren
      const dateTimeString = `${datum}T${uhrzeit}:00`;
      const dateObj = new Date(dateTimeString);
      if (isNaN(dateObj)) {
        return interaction.reply({ content: 'Ungültiges Datum oder Uhrzeit!', ephemeral: true });
      }

      // Spiel speichern
      const newMatch = new Match({
        homeTeam: heimteam,
        awayTeam: auswaertsteam,
        matchday: spieltag,
        date: dateObj,
        score1: null,
        score2: null,
        events: [],
        yellowCards: [],
        redCards: []
      });

      await newMatch.save();

      return interaction.reply(`Spiel zwischen ${heimteam} und ${auswaertsteam} für Spieltag ${spieltag} wurde erstellt.`);
    }

    // Tabelle-Embed und Button-Row generieren
    const tabelleEmbed = await createTabelleEmbed();
    const nextMatchdayEmbed = await createNextMatchdayEmbed();

    // Buttons für Übersicht (Beispiel, du kannst sie erweitern)
    const buttonRow = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('tabelle')
          .setLabel('Tabelle')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('spieltag')
          .setLabel('Nächster Spieltag')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('update')
          .setLabel('Aktualisieren')
          .setStyle(ButtonStyle.Secondary)
      );

    // Antwort mit Tabelle + Buttons
    const message = await interaction.reply({ 
      embeds: [tabelleEmbed], 
      components: [buttonRow], 
      fetchReply: true 
    });

    // Collector für Button-Interaktionen (30 Sekunden)
    const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'Nur der ursprüngliche Benutzer kann hier klicken.', ephemeral: true });
      }

      if (i.customId === 'tabelle') {
        await i.update({ embeds: [await createTabelleEmbed()] });
      } else if (i.customId === 'spieltag') {
        await i.update({ embeds: [await createNextMatchdayEmbed()] });
      } else if (i.customId === 'update') {
        await i.deferUpdate();
        // Optional: Daten neu laden oder Logik ergänzen
        await i.editReply({ embeds: [await createTabelleEmbed()] });
      }
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch {}
    });
  }
};
