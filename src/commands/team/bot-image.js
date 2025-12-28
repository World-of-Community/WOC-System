const { SlashCommandBuilder, ChannelType, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot-image")
    .setDescription("» Sende ein Bild mit dem Bot in einen Kanal. 📌")
    .addChannelOption(option => option.setName("kanal").setDescription("Der Kanal, in den das Bild gesendet werden soll").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption(option => option.setName("image").setDescription("» URL des Bildes, das hinzugefügt werden soll").setRequired(true))
    .addStringOption(option => option.setName("starten_in").setDescription("Wann soll es gesendet werden? (z.B. 10s, 5m, 2h, 1d)").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const kanal = interaction.options.getChannel("kanal");
    const imageUrl = interaction.options.getString("image");
    const zeit = interaction.options.getString("starten_in");

    let verzögerungInMs = 0;

    if (zeit) {
      const zeitwert = parseInt(zeit.slice(0, -1));
      const einheit = zeit.slice(-1);

      // Verzögerung in Millisekunden basierend auf der Einheit berechnen
      switch (einheit) {
      case "s":
        verzögerungInMs = zeitwert * 1000; // Sekunden in Millisekunden
        break;
      case "m":
        verzögerungInMs = zeitwert * 60 * 1000; // Minuten in Millisekunden
        break;
      case "h":
        verzögerungInMs = zeitwert * 60 * 60 * 1000; // Stunden in Millisekunden
        break;
      case "d":
        verzögerungInMs = zeitwert * 24 * 60 * 60 * 1000; // Tage in Millisekunden
        break;
      default:
        return interaction.reply({ content: "> `❗` » Bitte gib eine gültige Zeiteinheit an (s, m, h, d).", ephemeral: true });
      }

      const timestamp = Math.floor((Date.now() + verzögerungInMs) / 1000);
      await interaction.reply({ content: `> \`📌\` » Das Bild wird **<t:${timestamp}:R>** im Kanal ${kanal} gesendet.\n> \`📌\` » Geplanter Zeitpunkt: <t:${timestamp}:F>`, ephemeral: true });
    } else {
      await interaction.reply({ content: `> \`📌\` » Das Bild wird sofort im Kanal ${kanal} gesendet.`, ephemeral: true });
    }

    const imageEmbed = new EmbedBuilder()
      .setImage(imageUrl)
      .setColor("Blurple");

    setTimeout(async () => {
      await kanal.send({ embeds: [imageEmbed] });
    }, verzögerungInMs);
  },
};
