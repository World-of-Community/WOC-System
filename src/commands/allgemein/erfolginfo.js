const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const userdb = require("../../../Datenbank/userdb");

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
    const user = interaction.options.getUser('user');
    const member = await interaction.guild.members.fetch(user.id);

    // Erfolgsrollen mit Zählung (0 = nicht, 1 = hat Rolle)
    const rollenErfolge = [
      {
        name: '💡〢 Informant (10 Server-Ideen)',
        roleId: '1147250265641201724',
        beschreibung: 'Reiche 10 Server-Ideen ein.',
        count: member.roles.cache.has('1147250265641201724') ? 1 : 0,
      },
      {
        name: '📢〢 Teil des Rats (20 Umfragen)',
        roleId: '1147250982967836823',
        beschreibung: 'Nimm an 20 Server-Umfragen teil.',
        count: member.roles.cache.has('1147250982967836823') ? 1 : 0,
      },
      {
        name: '☘️〢 Glückspilz (Event-Gewinner)',
        roleId: '1124598019862573096',
        beschreibung: 'Gewinne bei einem Event auf WOC.',
        count: member.roles.cache.has('1124598019862573096') ? 1 : 0,
      }
    ];

    // Daten aus der DB laden
    let userData = await userdb.findOne({ userID: user.id });
    if (!userData) {
      userData = {
        erfolge: {
          informant: 0,
          umfragen: 0,
          glueckspilz: 0,
        }
      };
    }

    const listerfolge =
      `💡〢 Informant: **${userData.erfolge?.informant ?? 0}** akzeptierte Ideen\n` +
      `📢〢 Teil des Rats: **${userData.erfolge?.umfragen ?? 0}** Umfragen teilgenommen\n` +
      `☘️〢 Glückspilz: **${userData.erfolge?.glueckspilz ?? 0}** Server-Events gewonnen`;

    // Rollen-Erfolge Übersicht als Text (0 oder 1)
    const rollenErfolgeText = rollenErfolge
      .map(e => `${e.name}: **${e.count}**`)
      .join('\n');

    // Embed bauen
    const ErfolgEmbed = new EmbedBuilder()
      .setTitle(`${user.username}'s Fortschritt`)
      .setDescription(
        `<:PfeilBlau:1119711275014955080> Mit **Erfolgen** kannst du **vor deinen Freunden** angeben und hast die Chance, in unserem Server **einzigartige Ränge freizuschalten!**\n` +
        `<:Pfeil:1119709908540076124> **Mehr Infos:** <#872063101640532008>\n\n` +
        `> **WIE SIEHT MEIN FORTSCHRITT AUS?**\n` +
        `<:PfeilBlau:1119711275014955080> **Beachte:** du kannst in diesem Befehl nur deinen Fortschritt von allen Erfolgen sehen, welche gelevelt werden können.\n\n` +
        `${listerfolge}\n\n` +
        `> \`❓\` **- BEI MIR STEHT 0 - WARUM?**\n` +
        `<:PfeilBlau:1119711275014955080> Solltest du den Erfolg bereits erhalten haben, wird deine Zahl wieder auf \`0\` festgelegt.\n\n` +
        `<:PfeilBlau:1119711275014955080> **Wichtige Info:** Nein, es ist kein Fehler das einige Stats vermutlich weniger zeigen, als sie sollten. Unser Bot hat einen dynamischen Cooldown und achtet stark auf Spam.\n\n` +
        `> **Rollen-Erfolge Übersicht:**\n${rollenErfolgeText}`
      )
      .setColor('Blurple')
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: 'Schaffst du es alle Erfolge zu sammeln?', iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    await interaction.reply({ embeds: [ErfolgEmbed], ephemeral: true });
  }
};
