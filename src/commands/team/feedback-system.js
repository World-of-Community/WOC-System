const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
  .setName('feedback')
  .setDescription('» Schickt das Feedback System')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {

    const FeedbackBild = new EmbedBuilder()
      .setColor('Aqua')
      .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1280172685694996572/WOC_Banner_Information_Feedback.jpg?ex=67a4c738&is=67a375b8&hm=ed8af1095ccc443555be6401fd3f7215442952b99925a039b491512945004e54&')

    // Erster Embed - Bild und Feedback Beschreibung
    const FeedbackEmbed = new EmbedBuilder()
      .setTitle('Feedback')
      .setDescription('Du hast einen Verbesserungsvorschlag oder eine Idee, welche du loswerden willst? Dann bist du hier genau richtig!')
      .setColor('Aqua')
      .setFooter({ text: '» Wir schätzen dein Feedback und deine Unterstützung!', iconURL: interaction.guild.iconURL() });

    const FeedbackButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_feedback_ticket')
          .setLabel('Feedback')
          .setEmoji('🗳️')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.channel.send({ embeds: [FeedbackBild, FeedbackEmbed], components: [FeedbackButton] })
    await interaction.reply({ content: `> \`✅\` » Das **${setTitle}**-Embed wurde erfolgreich gesendet.`, ephemeral: true });
  },

  async buttonHandler(interaction) {
    if (interaction.customId === 'create_feedback_ticket') {
      // Erstelle das Modal für Feedback
      const feedbackModal = new ModalBuilder()
        .setTitle('Feedback einreichen')
        .setCustomId('feedback-modal');

      // Eingabefeld für den Kurztitel
      const titleInput = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('feedback-title')
          .setLabel('Kurztitel des Themas')
          .setPlaceholder('z.b. "Spielmodi", "Event-Idee" , "Feature-Wunsch"')
          .setStyle(TextInputStyle.Short)
          .setRequired(true)
      );

      // Eingabefeld für detaillierte Beschreibung
      const descriptionInput = new ActionRowBuilder().addComponents(
        new TextInputBuilder()
          .setCustomId('feedback-description')
          .setLabel('Detaillierte Beschreibung')
          .setPlaceholder('Beschreibe hier das problem oder dein Feedback genauer.')
          .setMinLength(5)
          .setMaxLength(1024)
          .setStyle(TextInputStyle.Paragraph)
          .setRequired(true)
      );

      feedbackModal.addComponents(titleInput, descriptionInput);

      // Zeige das Modal an
      await interaction.showModal(feedbackModal);
    }
  }
};
