const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userdb = require("../../../Datenbank/userdb");

// Map für Track-Cooldowns: userId => timestamp
const trackCooldowns = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('erfolginfo')
    .setDescription('» Zeigt die Erfolge eines Nutzers an. 🏆')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer, dessen Erfolge du sehen möchtest')
        .setRequired(true)
    ),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(targetUser.id);

    const cooldownTime = 60 * 1000; // 1 Minute in ms
    const now = Date.now();

    // Prüfen, ob der Track-Cooldown für den Nutzer aktiv ist
    let rollenErfolge;
    if (trackCooldowns.has(targetUser.id)) {
      const lastTracked = trackCooldowns.get(targetUser.id);
      if (now - lastTracked < cooldownTime) {
        // Cooldown aktiv: keine neue Erfassung, stattdessen Daten aus DB laden und Rollenstatus minimal anzeigen
        let userData = await userdb.findOne({ userID: targetUser.id });
        if (!userData) {
          userData = {
            erfolge: {
              informant: 0,
              umfragen: 0,
              glueckspilz: 0,
            }
          };
        }

        rollenErfolge = [
          {
            name: '💡〢 Informant (10 Server-Ideen)',
            count: member.roles.cache.has('1147250265641201724') ? 1 : 0,
          },
          {
            name: '📢〢 Teil des Rats (20 Umfragen)',
            count: member.roles.cache.has('1147250982967836823') ? 1 : 0,
          },
          {
            name: '☘️〢 Glückspilz (Event-Gewinner)',
            count: member.roles.cache.has('1124598019862573096') ? 1 : 0,
          }
        ];

        // Embed-Text vorbereiten mit den gespeicherten Werten aus DB
        var listerfolge =
          `\`💡〢 Informant\`: **${userData.erfolge?.informant ?? 0}** akzeptierte Ideen\n` +
          `\`📢〢 Teil des Rats\`: **${userData.erfolge?.umfragen ?? 0}** Umfragen teilgenommen\n` +
          `\`☘️〢 Glückspilz\`: **${userData.erfolge?.glueckspilz ?? 0}** Server-Events gewonnen\n\n` +
          `*Hinweis: Die Erfolge werden nur alle 1 Minute aktualisiert.*`;
      } else {
        // Cooldown abgelaufen, also tracken wir neu
        trackCooldowns.set(targetUser.id, now);
        rollenErfolge = [
          {
            name: '💡〢 Informant (10 Server-Ideen)',
            count: member.roles.cache.has('1147250265641201724') ? 1 : 0,
          },
          {
            name: '📢〢 Teil des Rats (20 Umfragen)',
            count: member.roles.cache.has('1147250982967836823') ? 1 : 0,
          },
          {
            name: '☘️〢 Glückspilz (Event-Gewinner)',
            count: member.roles.cache.has('1124598019862573096') ? 1 : 0,
          }
        ];

        let userData = await userdb.findOne({ userID: targetUser.id });
        if (!userData) {
          userData = {
            erfolge: {
              informant: 0,
              umfragen: 0,
              glueckspilz: 0,
            }
          };
        }

        listerfolge =
          `\`💡〢 Informant\`: **${userData.erfolge?.informant ?? 0}** akzeptierte Ideen\n` +
          `\`📢〢 Teil des Rats\`: **${userData.erfolge?.umfragen ?? 0}** Umfragen teilgenommen\n` +
          `\`☘️〢 Glückspilz\`: **${userData.erfolge?.glueckspilz ?? 0}** Server-Events gewonnen`;
      }
    } else {
      // Noch nie getrackt, jetzt tracken
      trackCooldowns.set(targetUser.id, now);
      rollenErfolge = [
        {
          name: '💡〢 Informant (10 Server-Ideen)',
          count: member.roles.cache.has('1147250265641201724') ? 1 : 0,
        },
        {
          name: '📢〢 Teil des Rats (20 Umfragen)',
          count: member.roles.cache.has('1147250982967836823') ? 1 : 0,
        },
        {
          name: '☘️〢 Glückspilz (Event-Gewinner)',
          count: member.roles.cache.has('1124598019862573096') ? 1 : 0,
        }
      ];

      let userData = await userdb.findOne({ userID: targetUser.id });
      if (!userData) {
        userData = {
          erfolge: {
            informant: 0,
            umfragen: 0,
            glueckspilz: 0,
          }
        };
      }

      listerfolge =
        `\`💡〢 Informant\`: **${userData.erfolge?.informant ?? 0}** akzeptierte Ideen\n` +
        `\`📢〢 Teil des Rats\`: **${userData.erfolge?.umfragen ?? 0}** Umfragen teilgenommen\n` +
        `\`☘️〢 Glückspilz\`: **${userData.erfolge?.glueckspilz ?? 0}** Server-Events gewonnen`;
    }

    // Embed bauen
    const ErfolgEmbed = new EmbedBuilder()
      .setTitle(`\`✨\` × ${targetUser.username}'s Fortschritt`)
      .setDescription(
        `<:PfeilBlau:1119711275014955080> Mit **Erfolgen** kannst du **vor deinen Freunden** angeben und hast die Chance, in unserem Server **einzigartige Ränge freizuschalten!**\n` +
        `<:Pfeil:1119709908540076124> **Mehr Infos:** <#872063101640532008>\n\n` +
        `> \`🌍\` × **WIE SIEHT MEIN FORTSCHRITT AUS?**\n` +
        `<:PfeilBlau:1119711275014955080> **Beachte:** du kannst in diesem Befehl nur deinen Fortschritt von allen Erfolgen sehen, welche gelevelt werden können.\n\n` +
        `${listerfolge}\n\n` +
        `> \`❓\` **- BEI MIR STEHT 0 - WARUM?**\n` +
        `<:PfeilBlau:1119711275014955080> Solltest du den Erfolg bereits erhalten haben, wird deine Zahl wieder auf \`0\` festgelegt.\n\n` +
        `<:PfeilBlau:1119711275014955080> **Wichtige Info:** Nein, es ist kein Fehler das einige Stats vermutlich weniger zeigen, als sie sollten. Unser Bot hat einen dynamischen Cooldown und achtet stark auf Spam.`
      )
      .setColor('Blurple')
      .setThumbnail(targetUser.displayAvatarURL())
      .setFooter({ text: 'Schaffst du es alle Erfolge zu sammeln?', iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [ErfolgEmbed], ephemeral: true });
  }
};
