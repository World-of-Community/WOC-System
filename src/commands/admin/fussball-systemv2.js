const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
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

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball-systemv2')
    .setDescription('Zeigt die Fußball-Übersicht an'),

  async execute(interaction) {
    await interaction.deferReply();

    // Hilfsfunktion für Datum/Zeit
    function formatDate(date) {
      return date.toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Berlin'
      }).replace(',', ' -');
    }

    const teams = await Team.find().sort({ points: -1, goalsFor: -1 });
    const upcomingMatches = await Match.find({ date: { $gte: new Date() } }).sort({ date: 1 });

    // 📊 Tabelle
    const tabelleEmbed = new EmbedBuilder()
      .setTitle('📊 Aktuelle Tabelle')
      .setColor('#0099ff');

    teams.forEach((team, index) => {
      tabelleEmbed.addFields({
        name: `${index + 1}. ${team.name}`,
        value: `Spiele: ${team.played}, Punkte: ${team.points}, Tore: ${team.goalsFor}:${team.goalsAgainst}`,
        inline: false
      });
    });

    // 🏟️ Nächstes Spiel
    const nextMatch = upcomingMatches[0];
    const naechstesSpielEmbed = new EmbedBuilder()
      .setTitle('🏟️ Nächstes Spiel')
      .setColor('#00cc66');

    if (nextMatch) {
      naechstesSpielEmbed.setDescription(
        `**${nextMatch.homeTeam}** vs **${nextMatch.awayTeam}**\n` +
        `📅 ${formatDate(nextMatch.date)} Uhr`
      );
    } else {
      naechstesSpielEmbed.setDescription('Kein Spiel geplant.');
    }

    // 📅 Nächster Spieltag
    const ersterSpieltag = nextMatch?.matchday ?? null;
    const spieltagMatches = await Match.find({ matchday: ersterSpieltag }).sort({ date: 1 });

    const spieltagEmbed = new EmbedBuilder()
      .setTitle(`📅 Spieltag ${ersterSpieltag ?? 'N/A'}`)
      .setColor('#ffaa00');

    if (spieltagMatches.length) {
      for (const match of spieltagMatches) {
        spieltagEmbed.addFields({
          name: `${match.homeTeam} vs ${match.awayTeam}`,
          value: `🕒 ${formatDate(match.date)} Uhr`,
          inline: false
        });
      }
    } else {
      spieltagEmbed.setDescription('Keine Spiele anstehend.');
    }

    // Übersicht Embed
    const overviewEmbed = new EmbedBuilder()
      .setTitle('`⚽` » Fußball Übersicht')
      .setDescription(
        'Die **Pro League** ist die höchste Spielklasse in unserem Fußball-Universum. Hier treffen die besten Mannschaften aufeinander, um Ruhm, Ehre und den begehrten Meistertitel zu kämpfen.\n\n' +
        '- `💥` » **Spannende Matches** mit Live-Statistiken\n' +
        '- `🏆` » **Kampf um den Meistertitel** unter den besten Teams\n' +
        '- `📊` » **Detaillierte Spielerwerte** und Teamdaten\n\n' +
        'Wähle unten aus, um mehr zu sehen.'
      )
      .setColor('Blurple');

    // Select-Menü
    const auswahlMenü = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('fussball-info-menu')
        .setPlaceholder('📋 » Informationen auswählen')
        .addOptions(
          {
            label: '📊 Aktuelle Tabelle',
            value: 'tabelle'
          },
          {
            label: '🏟️ Nächstes Spiel',
            value: 'naechstes_spiel'
          },
          {
            label: '📅 Nächster Spieltag',
            value: 'spieltag'
          }
        )
    );

    const msg = await interaction.editReply({
      embeds: [overviewEmbed],
      components: [auswahlMenü]
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 5 * 60 * 1000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Nur du darfst diese Auswahl benutzen.', ephemeral: true });
      }

      let selectedEmbed;
      switch (i.values[0]) {
        case 'tabelle':
          selectedEmbed = tabelleEmbed;
          break;
        case 'naechstes_spiel':
          selectedEmbed = naechstesSpielEmbed;
          break;
        case 'spieltag':
          selectedEmbed = spieltagEmbed;
          break;
      }

      await i.update({ embeds: [selectedEmbed], components: [auswahlMenü] });
    });
  }
};
