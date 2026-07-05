import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder } from "discord.js";

export default {
  id: "feedback-modal",
  run: async (client, interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true });

      const title = interaction.fields.getTextInputValue("feedback-title");
      const description = interaction.fields.getTextInputValue("feedback-description");

      const threadName = `${title} - ${interaction.user.username}`;
      const feedbackChannelId = "1336720916591149137"; // Feedback channel
      const supportRoleId = "1011207481357238272"; // Team-Rolle

      const feedbackChannel = interaction.guild.channels.cache.get(feedbackChannelId);
      if (!feedbackChannel) {
        return interaction.editReply({
          content: "> `❌` » Feedback-Kanal nicht gefunden. Bitte kontaktiere einen Administrator.",
        });
      }

      const activeThreads = await feedbackChannel.threads.fetchActive();
      const existingThread = activeThreads.threads.find(thread =>
        thread.name.includes(interaction.user.username) && !thread.archived,
      );

      if (existingThread) {
        return interaction.editReply({
          content: `> ⚠️ Du hast bereits ein offenes Feedback-Ticket: ${existingThread}`,
        });
      }

      const thread = await feedbackChannel.threads.create({
        name: threadName,
        type: ChannelType.PrivateThread,
        autoArchiveDuration: 10080, // 24 Stunden
        reason: `Feedback von ${interaction.user.tag}`,
      });

      // Add user to thread
      await thread.members.add(interaction.user.id);

      const ticketEmbed = new EmbedBuilder()
        .setDescription(`**Hey ${interaction.user}!**\n\nDanke für dein Feedback!\nDein Ticket wird zeitnah von unserem Server-Team bearbeitet.`)
        .setColor("Aqua")
        .setImage("https://imgur.com/kekDug7.png");

      const ticketEmbed2 = new EmbedBuilder()
        .setDescription(`**Kurztitel des Themas**\n${title}\n\n**Detaillierte Beschreibung**\n${description}`)
        .setColor("Aqua")
        .setImage("https://imgur.com/kekDug7.png");

      const closeButtonRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("close_feedback_ticket")
          .setLabel("❌ Ticket schließen")
          .setStyle(ButtonStyle.Secondary),
      );

      await thread.send({
        content: `> User: <@${interaction.user.id}> | Team: <@&${supportRoleId}>`,
        embeds: [ticketEmbed, ticketEmbed2],
        components: [closeButtonRow],
      });

      // Rolle als Viewer hinzufügen
      await thread.permissionOverwrites.edit("1270369938972082177", {
        ViewChannel: true,
        SendMessages: true,
        ReadMessageHistory: true,
      });

      await interaction.editReply({ content: `> \`✅\` » Dein **Feedback-Ticket** wurde erstellt: ${thread}` });
    } catch (err) {
      try {
        if (interaction.deferred && !interaction.replied) {
          await interaction.editReply({
            content: "> `❌` » Beim Erstellen des Feedback-Tickets ist ein Fehler aufgetreten. Bitte kontaktiere einen Administrator.",
          });
        } else if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "> `❌` » Beim Erstellen des Feedback-Tickets ist ein Fehler aufgetreten. Bitte kontaktiere einen Administrator.",
          });
        }
      } catch (replyErr) {
        console.error("[FEEDBACK-MODAL] Failed to send error message:", replyErr);
      }
    }
  },
};
