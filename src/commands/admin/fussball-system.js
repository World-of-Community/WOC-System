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

  const description = proLeagueData.map((t, i) =>
    `**${i + 1}. ${t.name}** | Sp: ${t.played} | S: ${t.won} | U: ${t.draw} | N: ${t.lost} | T: ${t.goalsFor} | GT: ${t.goalsAgainst} | TD: ${t.goalDifference} | Pkte: ${t.points}`
  ).join('\n');

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

module.exports = [
  {
    data: new SlashCommandBuilder()
      .setName('fussball-embed')
      .setDescription('Zeigt die Fußball Übersicht mit Tabelle und nächsten Spieltag')
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
  },

  {
    data: new SlashCommandBuilder()
      .setName('spiel-erstellen')
      .setDescription('Erstellt ein Spiel mit Datum und Uhrzeit')
      .addStringOption(option =>
        option.setName('heimteam')
          .setDescription('Heimteam')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('auswaertsteam')
          .setDescription('Auswärtsteam')
          .setRequired(true))
      .addIntegerOption(option =>
        option.setName('spieltag')
          .setDescription('Spieltagnummer')
          .setRequired(true))
      .addStringOption(option =>
        option.setName('datum')
          .setDescription('Datum & Uhrzeit (Format: TT.MM.JJJJ HH:MM)')
          .setRequired(true)),

    async execute(interaction) {
      const heim = interaction.options.getString('heimteam');
      const auswaerts = interaction.options.getString('auswaertsteam');
      const spieltag = interaction.options.getInteger('spieltag');
      const datum = interaction.options.getString('datum');

      try {
        const [tag, monat, rest] = datum.split('.');
        const [jahr, zeit] = rest.split(' ');
        const [stunde, minute] = zeit.split(':');
        const date = new Date(jahr, monat - 1, tag, stunde, minute);

        const match = new Match({
          homeTeam: heim,
          awayTeam: auswaerts,
          matchday: spieltag,
          date
        });

        await match.save();

        await interaction.reply({
          content: `✅ Spiel eingetragen: **${heim}** vs **${auswaerts}** am **${date.toLocaleString('de-DE')}** (Spieltag ${spieltag})`,
          ephemeral: true
        });
      } catch (error) {
        await interaction.reply({
          content: `❌ Fehler beim Eintragen des Spiels. Stelle sicher, dass das Datum im Format **TT.MM.JJJJ HH:MM** ist.`,
          ephemeral: true
        });
      }
    }
  }
];
