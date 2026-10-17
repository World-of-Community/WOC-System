import { MessageFlags } from "discord.js";
import ms from "ms";
import logger from "#core/logger.js";

export default {

  name: "event-info",
  description: "» Event Nachrichten senden und bearbeiten. 💬",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      type: 1,
      name: "send",
      description: "Sende eine Nachricht.",
      options: [
        {
          name: "kanal",
          description: "Der Kanal",
          required: true,
          type: 7,
        },
        {
          type: 3,
          name: "nachricht",
          description: "Die Nachricht (\n für neue Zeile)",
          required: true,
        },
        {
          name: "bild",
          description: "Optionales Bild",
          required: false,
          type: 11,
        },
        {
          type: 3,
          name: "starten",
          description: "z.B. 10s, 5m, 1h",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "edit",
      description: "Bearbeite eine Nachricht.",
      options: [
        {
          name: "kanal",
          description: "Der Kanal der Nachricht",
          required: true,
          type: 7,
        },
        {
          type: 3,
          name: "messageid",
          description: "Die Message ID",
          required: true,
        },
        {
          type: 3,
          name: "nachricht",
          description: "Neue Nachricht (\n für neue Zeile)",
          required: true,
        },
        {
          name: "bild",
          description: "Neues Bild (optional)",
          required: false,
          type: 11,
        },
      ],
    },
  ],

  async run(client, interaction) {

    const subcommand = interaction.options.getSubcommand();

    // 🔥 bessere newline Verarbeitung
    const parseText = (text) => {
      if (!text) {return text;}

      return text
        .replace(/\\n/g, "\n")   // echtes "\n"
        .replace(/\r\n/g, "\n"); // Windows linebreak fix
    };

    if (subcommand === "send") {

      const channel = interaction.options.getChannel("kanal");
      const rawMessage = interaction.options.getString("nachricht");
      const bild = interaction.options.getAttachment("bild");
      const time = interaction.options.getString("starten");

      const message = parseText(rawMessage);

      if (time) {

        const timeMs = ms(time);

        if (!timeMs) {
          return await interaction.reply({
            content: "> `❌` » Bitte gib eine gültige Zeit an. Beispiel: `10s`, `5m`, `1h`",
            flags: MessageFlags.Ephemeral,
          });
        }

        const endDate = new Date(Date.now() + timeMs);
        const timestamp = Math.floor(endDate.getTime() / 1000);

        await interaction.reply({
          content: `> \`⏳\` » Die Nachricht wird <t:${timestamp}:R> gesendet.`,
          flags: MessageFlags.Ephemeral,
        });

        // the interaction token is only valid for 15 minutes, so the result may have to go out as a DM
        const notify = async (content) => {
          try {
            await interaction.editReply({ content });
          } catch {
            await interaction.user.send(content).catch(() => {});
          }
        };

        setTimeout(async () => {
          try {
            const sentMessage = await channel.send({
              content: message,
              files: bild ? [bild.url] : [],
            });
            await notify(`> \`✅\` » Nachricht erfolgreich gesendet.
> Message ID: \`${sentMessage.id}\``);
          } catch (error) {
            logger.error("Fehler beim Senden:", error);
            await notify("> `❌` » Fehler beim Senden der Nachricht.");
          }
        }, timeMs);

      } else {

        // uploading an image can take longer than the 3 seconds Discord allows for the first reply
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
          const sentMessage = await channel.send({
            content: message,
            files: bild ? [bild.url] : [],
          });
          await interaction.editReply({ content: `> \`✅\` » Nachricht erfolgreich gesendet.
> Message ID: \`${sentMessage.id}\`` });
        } catch (error) {
          logger.error("Fehler beim Senden:", error);
          await interaction.editReply({ content: "> `❌` » Fehler beim Senden der Nachricht." }).catch(() => {});
        }
      }
    }

    else if (subcommand === "edit") {

      const channel = interaction.options.getChannel("kanal");
      const messageId = interaction.options.getString("messageid");
      const rawMessage = interaction.options.getString("nachricht");
      const bild = interaction.options.getAttachment("bild");

      const newMessage = parseText(rawMessage);

      await interaction.deferReply({ flags: MessageFlags.Ephemeral });

      try {

        const message = await channel.messages.fetch(messageId);

        const editData = {
          content: newMessage,
        };

        if (bild) {
          editData.files = [bild.url];
        }

        await message.edit(editData);

        await interaction.editReply({ content: "> `✅` » Nachricht erfolgreich bearbeitet." });

      } catch (error) {

        logger.error("Fehler beim Bearbeiten:", error);

        await interaction.editReply({ content: "> `❌` » Nachricht nicht gefunden oder Fehler beim Bearbeiten." }).catch(() => {});
      }
    }
  },
};
