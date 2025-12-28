const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  async execute(interaction) {
    if (!interaction.isModalSubmit() || interaction.customId !== "feedback-modal") {return;}

    const title = interaction.fields.getTextInputValue("feedback-title");
    const description = interaction.fields.getTextInputValue("feedback-description");

    const ticketName = `feedback-${interaction.user.username.toLowerCase()}`;
    const categoryId = "886985648714682439"; // Feedback-Kategorie
    const supportRoleId = "1011207481357238272"; // Team-Rolle

    try {
      // Prüfen, ob Kategorie existiert
      const category = interaction.guild.channels.cache.get(categoryId);
      if (!category) {
        return interaction.reply({
          content: "> `❌` » Die Feedback-Kategorie konnte nicht gefunden werden. Bitte informiere einen Administrator.",
          ephemeral: true,
        });
      }

      // Prüfen, ob schon ein Feedback-Ticket offen ist
      const existingChannel = interaction.guild.channels.cache.find(c => c.name === ticketName);
      if (existingChannel) {
        return interaction.reply({
          content: "> ⚠️ Du hast bereits ein offenes Feedback-Ticket.",
          ephemeral: true,
        });
      }

      // Channel erstellen
      const ticketChannel = await interaction.guild.channels.create({
        name: ticketName,
        type: ChannelType.GuildText,
        parent: categoryId,
        topic: `Feedback von ${interaction.user.tag}`,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AttachFiles,
            ],
          },
          {
            id: supportRoleId,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ManageMessages,
            ],
          },
        ],
      });

      // Haupt-Embed (Begrüßung)
      const infoEmbed = new EmbedBuilder()
        .setColor("#00FFFF")
        .setTitle("💬 » Feedback-Ticket")
        .setDescription(`Hey ${interaction.user},\n\nvielen Dank für dein Feedback! ✨\nUnser Team wird sich dein Anliegen ansehen und ggf. Rückfragen stellen.`)
        .setImage("https://imgur.com/kekDug7.png")
        .setTimestamp();

      // Inhalt-Embed (Feedback-Details)
      const feedbackEmbed = new EmbedBuilder()
        .setColor("#00FFFF")
        .setTitle("📝 » Feedback-Details")
        .addFields(
          { name: "Kurztitel", value: title || "–", inline: false },
          { name: "Beschreibung", value: description || "–", inline: false },
        )
        .setFooter({ text: `Eingereicht von ${interaction.user.tag}` })
        .setTimestamp();

      // Schließen-Button
      const buttonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_feedback_ticket")
          .setLabel("❌ Ticket schließen")
          .setStyle(ButtonStyle.Secondary),
      );

      // Embeds + Button senden
      await ticketChannel.send({
        content: `User: <@&${supportRoleId}> | Team: ${interaction.user}`,
        embeds: [infoEmbed, feedbackEmbed],
        components: [buttonRow],
      });

      // Antwort an User
      await interaction.reply({
        content: `> \`✅\` » Dein **Feedback-Ticket** wurde erfolgreich erstellt: ${ticketChannel}`,
        ephemeral: true,
      });

    } catch (err) {
      console.error("Fehler beim Erstellen des Feedback-Tickets:", err);
      return interaction.reply({
        content: "> `❌` » Beim Erstellen des Feedback-Tickets ist ein Fehler aufgetreten. Bitte versuche es später erneut.",
        ephemeral: true,
      });
    }
  },
};
