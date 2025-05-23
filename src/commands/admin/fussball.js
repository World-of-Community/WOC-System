const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fussball')
    .setDescription('Starte ein Fußballspiel mit echten Teams und Spielern!')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply();

    // Teams und ihre Spieler
    const teamData = {
      'FC Adler': ['Müller', 'Becker', 'Krause', 'Falk', 'Schwarz'],
      'SV Löwen': ['Schmidt', 'Wagner', 'Hahn', 'Zimmermann', 'Pohl'],
      'TSV Blitz': ['Bergmann', 'Klein', 'Voigt', 'Arnold', 'Franz'],
      'SC Phönix': ['Lorenz', 'Brandt', 'Fuchs', 'Sauer', 'Horn'],
      'Rot-Weiß': ['Jansen', 'Meier', 'Koch', 'Albrecht', 'Schulte'],
      'Blau-Gelb': ['Neumann', 'Fischer', 'Hartmann', 'Seidel', 'Engel'],
      'SV Sturm': ['Lange', 'Dietrich', 'Bauer', 'Schreiber', 'Graf'],
      'VfB Dynamit': ['Beck', 'Kraus', 'Simon', 'Jung', 'Wolf'],
      'TSV Könige': ['Peters', 'Brand', 'Schmitt', 'Friedrich', 'Lang'],
      'FC Titan': ['Mayer', 'Keller', 'Hart', 'Richter', 'Wendt'],
      'SV Adlerhorst': ['Zimmer', 'Krüger', 'Friedrich', 'Böhm', 'Voigt'],
      'VfL Stürmer': ['Kuhn', 'Bauer', 'Maier', 'Fischer', 'Brandt'],
      'SG Blitzschlag': ['Graf', 'Schmidt', 'Lang', 'Heinrich', 'Schulz'],
      'FC Drachen': ['Schulze', 'Keller', 'Becker', 'Hoffmann', 'Wolfgang'],
      'TSV Titanen': ['Jung', 'Fischer', 'Koch', 'Zimmermann', 'Schmidt'],
      'SV Panther': ['Hahn', 'Lange', 'Bauer', 'Engel', 'Meier'],
      'VfR Sturm': ['Schulz', 'Neumann', 'Lorenz', 'Brandt', 'Seidel'],
      'FC Falken': ['Kraus', 'Wolf', 'Jansen', 'Simon', 'Richter']
    };

    // Emojis als Team-Icons/Farben
    const teamColors = {
      'FC Adler': '🦅',
      'SV Löwen': '🦁',
      'TSV Blitz': '⚡',
      'SC Phönix': '🔥',
      'Rot-Weiß': '🔴⚪',
      'Blau-Gelb': '🔵💛',
      'SV Sturm': '🌪️',
      'VfB Dynamit': '💥',
      'TSV Könige': '👑',
      'FC Titan': '🛡️',
      'SV Adlerhorst': '🦅',
      'VfL Stürmer': '🎯',
      'SG Blitzschlag': '⚡',
      'FC Drachen': '🐉',
      'TSV Titanen': '🛡️',
      'SV Panther': '🐆',
      'VfR Sturm': '🌪️',
      'FC Falken': '🦅'
    };

    const allTeams = Object.keys(teamData);

    // Zufällige Auswahl von zwei unterschiedlichen Teams
    let team1, team2;
    do {
      team1 = allTeams[Math.floor(Math.random() * allTeams.length)];
      team2 = allTeams[Math.floor(Math.random() * allTeams.length)];
    } while (team1 === team2);

    const score = { [team1]: 0, [team2]: 0 };
    const xG = { [team1]: 0, [team2]: 0 };
    let minute = 0;
    const log = [];

    // Initiales Embed mit Spielstart-Infos
    const embed = new EmbedBuilder()
      .setTitle(`🏟️ Fußballspiel: ${teamColors[team1]} ${team1} vs. ${teamColors[team2]} ${team2}`)
      .setColor('Green')
      .setDescription('Das Spiel beginnt...')
      .addFields(
        { name: 'Spielminute', value: '0\'', inline: true },
        { name: 'Spielstand', value: `0 : 0`, inline: true },
        { name: 'xG', value: `0.00 : 0.00`, inline: true },
        { name: 'Tore', value: 'Noch keine Tore...' }
      );

    const message = await interaction.editReply({ embeds: [embed] });

    // Simulation des Spiels im 5-Minuten-Takt (alle 5 Sekunden in Echtzeit)
    const interval = setInterval(async () => {
      minute += 5;

      // Spielende nach 90 Minuten
      if (minute > 90) {
        clearInterval(interval);

        embed
          .setTitle(`🏁 Spiel beendet: ${teamColors[team1]} ${team1} vs. ${teamColors[team2]} ${team2}`)
          .setDescription('Das Spiel ist vorbei.')
          .spliceFields(0, 4,
            { name: 'Endstand', value: `${teamColors[team1]} ${team1} ${score[team1]} : ${score[team2]} ${teamColors[team2]} ${team2}` },
            { name: 'xG Endstand', value: `${xG[team1].toFixed(2)} : ${xG[team2].toFixed(2)}`, inline: true },
            { name: 'Tore', value: log.length > 0 ? log.join('\n') : 'Keine Tore im Spiel.' }
          )
          .setColor('Gold');

        await message.edit({ embeds: [embed] });
        return;
      }

      // Torchance ca. 30%
      if (Math.random() < 0.3) {
        const scoringTeam = Math.random() < 0.5 ? team1 : team2;
        const players = teamData[scoringTeam];
        const scorer = players[Math.floor(Math.random() * players.length)];
        score[scoringTeam]++;

        const chanceXG = (Math.random() * 0.4) + 0.1;
        xG[scoringTeam] += chanceXG;

        log.push(`⚽ ${minute}. Minute: ${scorer} (${teamColors[scoringTeam]} ${scoringTeam}) [xG: ${chanceXG.toFixed(2)}]`);
      } else {
        // Kleine xG-Erhöhung ohne Tor (10% Chance)
        if (Math.random() < 0.1) {
          const teamForXG = Math.random() < 0.5 ? team1 : team2;
          const chanceXG = (Math.random() * 0.09) + 0.01;
          xG[teamForXG] += chanceXG;
        }
      }

      // Aktualisiere das Embed mit aktuellem Spielstand
      embed.spliceFields(0, 4,
        { name: 'Spielminute', value: `${minute}'`, inline: true },
        { name: 'Spielstand', value: `${score[team1]} : ${score[team2]}`, inline: true },
        { name: 'xG', value: `${xG[team1].toFixed(2)} : ${xG[team2].toFixed(2)}`, inline: true },
        { name: 'Tore', value: log.length > 0 ? log.join('\n') : 'Noch keine Tore...' }
      );

      await message.edit({ embeds: [embed] });
    }, 5000); // alle 5 Sekunden = 5 Minuten Spielzeit
  },
};
