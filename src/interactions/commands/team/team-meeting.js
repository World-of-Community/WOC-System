import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";
import Meeting from "#models/meetingdb.js";
import logger from "#core/logger.js";

export default {
  name: "team-meeting",
  description: "Verwaltet Team-Meetings",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      "type": 1,
      "name": "create",
      "description": "» Erstellt ein neues Team-Meeting. ➕",
      "options": [
        {
          "type": 3,
          "name": "beschreibung",
          "description": "Beschreibung des Team-Meetings",
          "required": true,
        },
        {
          "type": 3,
          "name": "datum",
          "description": "Datum des Team-Meetings (z.B. 25.05.2025 12:00)",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "edit",
      "description": "» Editiert ein Team-Meeting. ✍️",
      "options": [
        {
          "type": 3,
          "name": "beschreibung",
          "description": "Neue Beschreibung",
          "required": true,
        },
        {
          "type": 3,
          "name": "datum",
          "description": "Neues Datum",
          "required": true,
        },
        {
          "type": 3,
          "name": "messageid",
          "description": "ID des Team-Meeting-Embeds",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "remove",
      "description": "» Löscht ein Team-Meeting. 🗑️",
      "options": [
        {
          "type": 3,
          "name": "messageid",
          "description": "ID des Team-Meeting-Embeds",
          "required": false,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();

    // Hilfsfunktion zum Parsen des Datums aus "DD.MM.YYYY HH:mm" in Date-Objekt
    function parseDate(dateStr) {
      // Annahme: dateStr ist "DD.MM.YYYY HH:mm"
      const [datePart, timePart] = dateStr.split(" ");
      if (!datePart || !timePart) {return null;}
      const [day, month, year] = datePart.split(".").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      if ([day, month, year, hour, minute].some(isNaN)) {return null;}
      return new Date(year, month - 1, day, hour, minute);
    }

    if (sub === "create") {
      const description = interaction.options.getString("beschreibung");
      const datumStr = interaction.options.getString("datum");
      const dateObj = parseDate(datumStr);
      if (!dateObj || isNaN(dateObj.getTime())) {
        return interaction.reply({ content: "> `❌` » Ungültiges Datum. Bitte Format: TT.MM.JJJJ HH:mm", ephemeral: true });
      }
      const unixTimestamp = Math.floor(dateObj.getTime() / 1000);

      const embed = new EmbedBuilder()
        .setTitle("`📅` Eine Team-Besprechung wurde geplant")
        .setDescription(
          `> **Datum:** <t:${unixTimestamp}:F>\n` +
          `> **Beschreibung:** ${description || "Keine Beschreibung angegeben."}`,
        )
        .setColor("Orange")
        .setFooter({ text: `Team-Besprechung von ${interaction.member ? interaction.member.displayName : interaction.user.tag}` });

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("meeting_join")
          .setLabel("Teilnehmen")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("meeting_leave")
          .setLabel("Nicht teilnehmen")
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("meeting_show")
          .setLabel("Teilnehmer")
          .setStyle(ButtonStyle.Primary),
      );

      try {
        const channel = interaction.channel;
        const message = await channel.send({ embeds: [embed], components: [row] });

        const newMeeting = new Meeting({
          guildId: interaction.guildId,
          channelId: channel.id,
          messageId: message.id,
          description,
          time: dateObj,  // Jetzt als Date speichern
          participants: [],
          nonParticipants: [],
        });
        await newMeeting.save();

        await interaction.reply({ content: "> `✅` » Team-Meeting wurde erfolgreich erstellt!", ephemeral: true });
      } catch (error) {
        logger.error("Fehler beim Erstellen des Meetings:", error);
        return interaction.reply({ content: "> `❌` » Fehler beim Erstellen des Meetings.", ephemeral: true });
      }
    }
    else if (sub === "edit") {
      const description = interaction.options.getString("beschreibung");
      const datumStr = interaction.options.getString("datum");
      const messageId = interaction.options.getString("messageid");

      const dateObj = parseDate(datumStr);
      if (!dateObj || isNaN(dateObj.getTime())) {
        return interaction.reply({ content: "> `❌` » Ungültiges Datum. Bitte Format: TT.MM.JJJJ HH:mm", ephemeral: true });
      }
      const unixTimestamp = Math.floor(dateObj.getTime() / 1000);

      let meeting;
      if (messageId) {
        meeting = await Meeting.findOne({ guildId: interaction.guildId, messageId });
      } else {
        meeting = await Meeting.findOne({ guildId: interaction.guildId }).sort({ _id: -1 });
      }

      if (!meeting) {return interaction.reply({ content: "> `❌` » Kein Team-Meeting gefunden.", ephemeral: true });}

      meeting.description = description;
      meeting.time = dateObj;  // Update als Date
      await meeting.save();

      try {
        const channel = await interaction.guild.channels.fetch(meeting.channelId);
        const msg = await channel.messages.fetch(meeting.messageId);

        const embed = new EmbedBuilder()
          .setTitle("`📅` Team-Meeting (bearbeitet)")
          .setDescription(
            `> **Datum:** <t:${unixTimestamp}:F>\n` +
            `> **Beschreibung:** ${description}`,
          )
          .setColor("Blue")
          .setFooter({ text: `Meeting von ${interaction.user.tag}` });

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("meeting_join")
            .setLabel("Teilnehmen")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId("meeting_leave")
            .setLabel("Nicht teilnehmen")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("meeting_show")
            .setLabel("Teilnehmer")
            .setStyle(ButtonStyle.Primary),
        );

        await msg.edit({ embeds: [embed], components: [row] });

        await interaction.reply({ content: "> `✅` » Team-Meeting wurde erfolgreich bearbeitet!", ephemeral: true });
      } catch (error) {
        logger.error("Fehler beim Bearbeiten des Meetings:", error);
        return interaction.reply({ content: "> `❌` » Fehler beim Bearbeiten des Meetings.", ephemeral: true });
      }
    }
    else if (sub === "remove") {
      const messageId = interaction.options.getString("messageid");

      let meeting;
      if (messageId) {
        meeting = await Meeting.findOne({ guildId: interaction.guildId, messageId });
      } else {
        meeting = await Meeting.findOne({ guildId: interaction.guildId }).sort({ _id: -1 });
      }
      if (!meeting) {return interaction.reply({ content: "> `❌` » Kein Team-Meeting gefunden.", ephemeral: true });}

      try {
        const channel = await interaction.guild.channels.fetch(meeting.channelId);
        const msg = await channel.messages.fetch(meeting.messageId);
        await msg.delete();
      } catch {
        // Nachricht evtl. schon gelöscht, ignoriere
      }

      await meeting.deleteOne();

      await interaction.reply({ content: "> `✅` » Team-Meeting wurde erfolgreich gelöscht!", ephemeral: true });
    }
  },
};
