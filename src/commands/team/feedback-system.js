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

    const FeedbackEmbed = new EmbedBuilder()
      .setTitle('Feedback')
      .setDescription('Du hast einen Verbesserungsvorschlag oder eine Idee, welche du loswerden willst? Dann bist du hier genau richtig!')
      .setColor('Aqua')
      .setImage('https://images-ext-1.discordapp.net/external/FXl45Y5BGOgY0JGxnjCg5pK0J7wFF-m2qjyp-u0_q-Y/https/imgur.com/kekDug7.png?format=webp&quality=lossless&width=1260&height=6')

    const FeedbackButton = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_feedback_ticket')
          .setLabel('Ticket öffnen')
          .setEmoji('🗳️')
          .setStyle(ButtonStyle.Primary)
      );

    await interaction.channel.send({ embeds: [FeedbackBild, FeedbackEmbed], components: [FeedbackButton] })
    await interaction.reply({ content: `> \`✅\` » Das **Feedback**-Embed wurde erfolgreich gesendet.`, ephemeral: true });
  },
};
