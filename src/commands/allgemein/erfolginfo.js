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

    // Erfolgsrollen
    const rollenErfolge = [
      {
        name: '💡〢 Informant (10 Server-Ideen)',
        roleId: '1147250265641201724',
        beschreibung: 'Reiche 10 Server-Ideen ein.',
      },
      {
        name: '📢〢 Teil des Rats (20 Umfragen)',
        roleId: '1147250982967836823',
        beschreibung: 'Nimm an 20 Server-Umfragen teil.',
      },
      {
        name: '☘️〢 Glückspilz (Event-Gewinner)',
        roleId: '1124598019862573096',
        beschreibung: 'Gewinne bei einem Event auf WOC.',
      }
    ];

    // Daten aus der DB laden
    let userData = await userDataModel.findOne({ userID: user.id });
    if (!userData) {
      userData = {
        erfolge: {
          informant: 0,
          umfragen: 0,
          glueckspilz: 0,
        }
      };
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏆 | Erfolge von ${user.username}`)
      .setColor(0xf1c40f)
      .setThumbnail(user.displayAvatarURL())
      .setFooter({ text: 'Erfolge werden automatisch durch Aktivitäten vergeben.' })
      .setTimestamp();

    // Rollen-Erfolge anzeigen
    let erfolgGefunden = false;
    for (const erfolg of rollenErfolge) {
      if (member.roles.cache.has(erfolg.roleId)) {
        embed.addFields({
          name: erfolg.name,
          value: `${erfolg.beschreibung}\n> Rolle: <@&${erfolg.roleId}>`,
          inline: false,
        });
        erfolgGefunden = true;
      }
    }

    // Abschnitt für Zähler-Erfolge aus DB
    embed.addFields(
      { name: '🔥 🗴 WIE SIEHT MEIN FORTSCHRITT AUS?', value: 'Nur Erfolge, die levelbar sind, werden hier angezeigt.' },
      { name: '💡〢 Informant', value: `Hat **${userData.erfolge?.informant ?? 0}** akzeptierte Ideen!`, inline: true },
      { name: '📢〢 Teil des Rats', value: `An **${userData.erfolge?.umfragen ?? 0}** Umfragen teilgenommen!`, inline: true },
      { name: '☘️〢 Glückspilz', value: `Hat **${userData.erfolge?.glueckspilz ?? 0}** Server-Events gewonnen!`, inline: true }
    );

    // Erklärung bei 0-Werten
    embed.addFields(
      {
        name: '❓ - Warum steht bei mir 0?',
        value: `:arrow_right: Wenn du den Erfolg erhalten hast, wird der Zähler wieder auf **0** gesetzt.`,
      },
      {
        name: 'ℹ️ Hinweis',
        value: `:arrow_right: Die Zähler sind manchmal niedriger, da der Bot Spam erkennt und blockiert.`,
      }
    );

    // Wenn keine Rollen-Erfolge vorhanden sind
    if (!erfolgGefunden) {
      embed.setDescription('❌ Dieser Benutzer hat aktuell keine **Rollen-Erfolge**.');
    }

    await interaction.reply({ embeds: [embed], ephemeral: false });
  }
};
