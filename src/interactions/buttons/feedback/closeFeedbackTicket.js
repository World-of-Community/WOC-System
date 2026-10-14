import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export default {
  id: "close_feedback_ticket",
  async run(client, interaction) {
    if (!interaction.guild) {return;}

    const decisionEmbed = new EmbedBuilder()
      .setTitle("`❓` » Schließ-Anfrage")
      .setDescription(`${interaction.user} hat das Schließen dieses Tickets angefordert.\n\nBitte akzeptiere oder verweigere mit den untenstehenden Schaltflächen.`)
      .setColor("#5865F2");

    const decisionButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("feedback_accept_close")
        .setLabel("Akzeptieren & schließen")
        .setEmoji("☑️")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("feedback_reject_open")
        .setLabel("Ablehnen & offen lassen")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({
      content: `<@${interaction.user.id}>`,
      embeds: [decisionEmbed],
      components: [decisionButtons],
    });
  },
};
