import {ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder} from "discord.js";
import teamdb from "../../models/teamdb.js";
import serverdb from "../../models/serverdb.js";
import logger from "../../functions/logger.js";

export default {
  name: "team",
  description: "Team",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      "type": 1,
      "name": "urlaub",
      "description": "» Teile deinen Urlaub mit. 🌴",
      "permission": "820658664536145940",
      "options": [
        {
          "type": 3,
          "name": "von",
          "description": "Startdatum des Urlaubs (DD.MM.YYYY)",
          "required": true,
        },
        {
          "type": 3,
          "name": "bis",
          "description": "Enddatum des Urlaubs (DD.MM.YYYY)",
          "required": true,
        },
        {
          "type": 3,
          "name": "grund",
          "description": "Grund des Urlaubs",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "plan",
      "description": "» Plane ein Meeting 📅",
      "options": [
        {
          "type": 3,
          "name": "datum",
          "description": "» Datum und Uhrzeit des Meetings (DD.MM.YYYY HH:MM)",
          "required": true,
        },
        {
          "type": 3,
          "name": "beschreibung",
          "description": "» Beschreibung des Meetings",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "meeting",
      "description": "» Schau nach wann die Nächste Team-Besprechung stattfindet. 📣",
      "options": [],
    },
    {
      "type": 1,
      "name": "help",
      "description": "» Zeigt dir alle Team-Befehle an. 🎯",
      "options": [],
    },
  ],

  async run(client, interaction) {
    const targetChannel = interaction.guild.channels.cache.get("877446081036836884");
    const sub = interaction.options.getSubcommand();
    const grund = interaction.options.getString("grund") || "Kein Grund angegeben";

    if (!targetChannel) {
      return interaction.reply("> `❌` » Fehler beim Verarbeiten des Befehls.");
    }

    switch (sub) {
      case "urlaub": {
        const vonStr = interaction.options.getString("von");
        const bisStr = interaction.options.getString("bis");

        const convertDate = (dateStr) => {
          const [day, month, year] = dateStr.split(".").map(Number);
          return `${year}-${month}-${day}`;
        };

        const formattedVon = convertDate(vonStr);
        const formattedBis = convertDate(bisStr);

        if (!formattedVon || !formattedBis) {
          return interaction.reply({ content: "> `❌` » Bitte gib gültige Daten im Format `DD.MM.YYYY` ein.", ephemeral: true });
        }

        const vonDate = new Date(formattedVon);
        const bisDate = new Date(formattedBis);

        if (vonDate > bisDate) {
          return interaction.reply({ content: "> `❌` » Das Enddatum muss nach dem Startdatum liegen.", ephemeral: true });
        }

        const teamData = await teamdb.findOneAndUpdate(
          { userID: interaction.user.id },
          {
            $set: {
              "urlaub.beginn": formattedVon,
              "urlaub.ende": formattedBis,
              "urlaub.grund": grund,
              "urlaub.messageID": null,
            },
            $inc: { "counter.urlaub": 1 },
          },
          { returnDocument: "after", upsert: true },
        );

        //const urlaubEmbed = new EmbedBuilder()
        //  .setTitle("🌴 Urlaubsmeldung")
        //  .setDescription(`\`📅\` ${interaction.user} hat Urlaub von \`${vonStr}\` bis \`${bisStr}\`.\n\n\`📋\` Grund: \`${grund}\``)
        //  .setColor("Green")
        //  .setFooter({ text: `${interaction.user.username}'s Urlaub`, iconURL: interaction.user.displayAvatarURL() })
        //  .setTimestamp();
        //
        //const message = await targetChannel.send({ embeds: [urlaubEmbed] });
        //teamData.urlaub.messageID = message.id;
        //await teamData.save();
        //
        //await interaction.reply({ content: "> `✅` » Deine Urlaubsmeldung wurde **erfolgreich** gesendet.", ephemeral: true });
        //break;

        const grundText = grund?.trim()
          ? `\n\n\`📋\` Grund: \`${grund.trim()}\``
          : "";

        const urlaubEmbed = new EmbedBuilder()
          .setTitle("🌴 Urlaubsmeldung")
          .setDescription(
            `\`📅\` ${interaction.user} hat Urlaub von \`${vonStr}\` bis \`${bisStr}\`.${grundText}`,
          )
          .setColor("Green")
          .setFooter({
            text: `${interaction.user.username}'s Urlaub`,
            iconURL: interaction.user.displayAvatarURL(),
          })
          .setTimestamp();

        const message = await targetChannel.send({
          embeds: [urlaubEmbed],
        });

        teamData.urlaub.messageID = message.id;
        await teamData.save();

        await interaction.reply({
          content: "> `✅` » Deine Urlaubsmeldung wurde **erfolgreich** gesendet.",
          ephemeral: true,
        });

        break;
      }

      case "plan": {
        const dateStr = interaction.options.getString("datum");
        const description = interaction.options.getString("beschreibung") || "Keine Beschreibung angegeben";

        const datePattern = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/;
        const match = dateStr.match(datePattern);

        if (!match) {
          return interaction.reply({ content: "> `❌` » Bitte gib das Datum im Format `DD.MM.YYYY HH:MM` ein.", ephemeral: true });
        }

        const [, day, month, year, hour, minute] = match;

        // Erstelle das Meeting-Datum in UTC
        const meetingDateUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

        // Überprüfe die Gültigkeit des Datums
        if (isNaN(meetingDateUTC.getTime())) {
          return interaction.reply({ content: "> `❌` » Das Datum scheint ungültig zu sein. Bitte überprüfe deine Eingabe.", ephemeral: true });
        }

        // Speichern des Meetings in der Datenbank
        try {
          const teamDataMeeting = await serverdb.findOneAndUpdate(
            { guildID: "815919809379172354" },
            {
              $push: {
                meetings: {
                  date: meetingDateUTC,
                  description,
                  reminders: [],
                  attendees: [],
                  nonAttendees: [],
                  messageID: null,
                },
              },
            },
            { returnDocument: "after", upsert: true },
          );

          await interaction.reply({ content: "> `✅` » Das Meeting wurde **erfolgreich** geplant.", ephemeral: true });

          const localDate = new Date(meetingDateUTC.getTime() - meetingDateUTC.getTimezoneOffset() * 60000);
          const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
          const dayName = days[localDate.getDay()];
          const d = localDate.getDate().toString().padStart(2, "0");
          const m = (localDate.getMonth() + 1).toString().padStart(2, "0");
          const y = localDate.getFullYear();
          const h = localDate.getHours().toString().padStart(2, "0");
          const min = localDate.getMinutes().toString().padStart(2, "0");

          const TeamMeetingEmbed = new EmbedBuilder()
            .setTitle("`📅` » Eine Team-Besprechung wurde geplant.")
            .setDescription(`> **Datum:** ${dayName}, ${d}.${m}.${y} ${h}:${min}\n> **Beschreibung:** ${description}`);

          const remindMeButton = new ButtonBuilder()
            .setCustomId("remindMe")
            .setLabel("🕒 Remind Me")
            .setStyle(ButtonStyle.Primary);

          const attendButton = new ButtonBuilder()
            .setCustomId("attend")
            .setLabel("✅ Teilnehmen")
            .setStyle(ButtonStyle.Success);

          const declineButton = new ButtonBuilder()
            .setCustomId("decline")
            .setLabel("❌ Nicht Teilnehmen")
            .setStyle(ButtonStyle.Secondary);

          const listButton = new ButtonBuilder()
            .setCustomId("list")
            .setLabel("📋 Teilnehmerliste")
            .setStyle(ButtonStyle.Secondary);

          const row = new ActionRowBuilder().addComponents(remindMeButton, attendButton, declineButton, listButton);

          // Note: targetChannel2 and other variables seem missing in the original code, but I'll keep the logic as is while fixing syntax
          const targetChannel2 = interaction.guild.channels.cache.get("877446081036836884"); // Fallback or assume same as targetChannel
          if (targetChannel2) {
            const meetingMessage = await targetChannel2.send({ embeds: [TeamMeetingEmbed], components: [row] });

            const meetingIndex = teamDataMeeting.meetings.length - 1;
            teamDataMeeting.meetings[meetingIndex].messageID = meetingMessage.id;

            await teamDataMeeting.save();
          }

          // These variables are also missing: schedule, remindUsers, deleteMeetingMessage
          // I will leave them commented or as they were if they were expected to be global (unlikely in ESM)
          /*
                        const reminderDate = new Date(meetingDateUTC.getTime() - 10 * 60000);
                        const deleteDate = new Date(meetingDateUTC.getTime() + 60000);

                        schedule.scheduleJob(reminderDate, () => {
                            remindUsers(client, meetingDateUTC);
                        });

                        schedule.scheduleJob(deleteDate, () => {
                            deleteMeetingMessage(client, meetingDateUTC);
                        });
                        */

        } catch (error) {
          logger.error("Fehler beim Speichern des Meetings:", error);
          await interaction.reply({ content: "> `❌` » Es ist ein Fehler beim Planen des Meetings aufgetreten.", ephemeral: true });
        }
        break;
      }

      case "meeting": {
        const serverData = await serverdb.findOne({ guildID: "815919809379172354" });

        if (!serverData || !serverData.meetings || serverData.meetings.length === 0) {
          return interaction.reply({ content: "> `❌` » Derzeit ist keine Team-Besprechung geplant.", ephemeral: true });
        }

        const sortedMeetings = serverData.meetings.sort((a, b) => a.date - b.date);

        const embed = new EmbedBuilder()
          .setTitle("`📅` Geplante Team-Besprechungen")
          .setColor("Blurple")
          .setTimestamp();

        sortedMeetings.forEach(meeting => {

          const utcDate = new Date(meeting.date.toISOString());
          const options = { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC" };
          const formattedDate = utcDate.toLocaleString("de-DE", options);

          embed.addFields({
            name: `> Besprechung am: \`${formattedDate}\``,
            value: `➥ ${meeting.description}`,
            inline: false,
          });
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
      }
        break;

      case "help": {
        // --- Home ---
        const homeEmbed = new EmbedBuilder()
          .setTitle("`🏠` » Team Hilfe Übersicht")
          .setDescription(
            "> **Willkommen zur Team Hilfe Übersicht!**\n\n" +
                        "Nutze die Buttons unten, um durch die verschiedenen Kategorien der Team Befehle zu navigieren.\n\n" +
                        "» **Admin:** Verwaltung und Einstellungen.\n" +
                        "» **Moderation:** Wichtige Moderationswerkzeuge.\n" +
                        "» **Support:** Unterstützung und Kommunikation.\n" +
                        "» **Infos:** Weitere wichtige Systeme.",
          )
          .setColor("Blurple")
          .setFooter({
            text: `${interaction.guild.name} - Home Info`,
            iconURL: interaction.guild.iconURL(),
          })
          .setTimestamp();

        // --- Administration ---
        const adminEmbed = new EmbedBuilder()
          .setTitle("`🎯` » Admin-Befehle")
          .setDescription(
            "> **Wichtige Admin-Befehle:**\n\n" +
                        "- `/admin add <user> <rolle>`\n" +
                        "» Fügt ein neues Teammitglied hinzu.\n\n" +

                        "- `/admin kick <user> <rolle>`\n" +
                        "» Entfernt einen Benutzer aus dem Server-Team.\n\n" +

                        "- `/admin uprank <user> <rolle>`\n" +
                        "» Aktualisiere die Rolle eines Teammitgliedes.\n\n" +

                        "- `/admin downrank <user> <rolle>`\n" +
                        "» Setzt einen Benutzer auf eine niedrigere Rolle.\n\n" +

                        "- `/admin-info <rolle>`\n" +
                        "» Zeigt eine Liste von Benutzern mit einer bestimmten Rolle an.\n\n" +

                        "- `/aktivieren <system>`\n" +
                        "» Aktiviere eine Funktion.\n\n" +

                        "- `/deaktivieren <system>`\n" +
                        "» Deaktiviere eine Funktion.",
          )
          .setColor("Red")
          .setFooter({
            text: `${interaction.guild.name} - Admin Befehle`,
            iconURL: interaction.guild.iconURL(),
          })
          .setTimestamp();

        // --- Moderation ---
        const moderationEmbed = new EmbedBuilder()
          .setTitle("`🎯` » Moderation Befehle")
          .setDescription(
            "> **Wichtige Moderation-Befehle:**\n\n" +

                        "- `/clear <anzahl> (Optional) <kanal> <grund>`\n" +
                        "» Löscht eine Anzahl an Nachrichten.\n\n" +

                        "- `/ban <user> <grund> (Optional) <dauer>`\n" +
                        "» Sperrt einen Nutzer in den Bann-Bereich.\n" +
                        "> `📋` » Text Gründe:\n" +
                        "➥ `An Verdächtiger Spam Aktivität beteiligt`\n" +
                        "➥ `Verdächtiger oder Spam Account`\n" +
                        "➥ `Gefährdeter oder Gehackter Account`\n" +
                        "➥ `Gegen Serverregeln verstoßen`\n\n" +

                        "- `/unban <user> <grund>`\n" +
                        "» Entbannt einen Nutzer aus dem Bann-bereich.\n\n" +

                        "- `/unban-info`\n" +
                        "» Sendet Informationen zur Entbannung.\n\n" +

                        "- `/warn <user> <grund>`\n" +
                        "» Warnt einen Nutzer per DM.\n\n" +

                        "- `/timeout <user> <grund> <dauer>`\n" +
                        "» Gibt einem Nutzer eine Auszeit.\n\n" +

                        "- `/user find`\n" +
                        "» Sucht einen User anhand seiner ID.\n\n" +

                        "- `/user list`\n" +
                        "» Listet alle Mitglieder (20 pro Seite).",
          )
          .setColor("Green")
          .setFooter({
            text: `${interaction.guild.name} - Moderation Befehle`,
            iconURL: interaction.guild.iconURL(),
          })
          .setTimestamp();

        // --- Support ---
        const supportEmbed = new EmbedBuilder()
          .setTitle("`🛠️` » Support Befehle")
          .setDescription(
            "> **Support & Kommunikation:**\n\n" +

                        "- `/message <user> <nachricht> (Optional) <image>`\n" +
                        "» Sendet einem Nutzer eine Nachricht.\n\n" +

                        "- `/event-info <kanal> <nachricht> (Optional) <starten>`\n" +
                        "» Sendet eine Event-Nachricht.\n\n" +

                        "- `/info <rolle>`\n" +
                        "» Zeigt Nutzer mit einer bestimmten Rolle.\n\n" +

                        "- `/info-bewerbung`\n" +
                        "» Sendet eine Info zur Bewerbung.\n\n" +

                        "- `/userinfo`\n" +
                        "» Zeigt Infos über einen Nutzer.\n\n" +

                        "- `/vorschlag`\n" +
                        "» Verwalte Vorschläge in <#1254340245772701747>.",
          )
          .setColor("Green")
          .setFooter({
            text: `${interaction.guild.name} - Support Befehle`,
            iconURL: interaction.guild.iconURL(),
          })
          .setTimestamp();


        // --- Infos / Sonstiges ---
        const infoEmbed = new EmbedBuilder()
          .setTitle("`📚` » Weitere Infos")
          .setDescription(
            "> **Weitere wichtige Systeme:**\n\n" +

                        "- `/info reward`\n" +
                        "» Zeigt Belohnungen mit Wahrscheinlichkeiten.\n\n" +

                        "- `/partner add/edit/remove`\n" +
                        "» Partner-System Verwaltung.\n\n" +

                        "> **Level System Befehle:**\n\n" +
                        "- `:?modifyexp <add/remove> <1 - 100000> <@user>`\n" +
                        "» Modifiziere XP eines Nutzers.\n\n" +

                        "- `:?setlevel <@user> <level>`\n" +
                        "» Setzt das Level eines Nutzers auf einen bestimmten Wert.\n\n" +

                        "- `:?level reset <@user>`\n" +
                        "» Setzt das Level eines Nutzers zurück.\n\n" +

                        "- `:?pmulti set <1/2>`\n" +
                        "» Setzt den globalen XP-Multiplikator.",
          )
          .setColor("Orange")
          .setFooter({
            text: `${interaction.guild.name} - Info Befehle`,
            iconURL: interaction.guild.iconURL(),
          })
          .setTimestamp();


        // =============================
        //        BUTTONS
        // =============================

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("help_home")
            .setLabel("Home")
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId("help_admin")
            .setLabel("Admin")
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId("help_mod")
            .setLabel("Moderation")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("help_support")
            .setLabel("Support")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("help_infos")
            .setLabel("Infos")
            .setStyle(ButtonStyle.Secondary),
        );

        // =============================
        //      SEND INITIAL EMBED
        // =============================

        await interaction.reply({
          embeds: [homeEmbed],
          components: [row],
          ephemeral: true,
        });


        // =============================
        //       BUTTON HANDLER
        // =============================

        const collector = interaction.channel.createMessageComponentCollector({
          componentType: ComponentType.Button,
        });

        collector.on("collect", async btn => {
          if (btn.user.id !== interaction.user.id)
          {return btn.reply({ content: "Du kannst diese Hilfe nicht bedienen.", ephemeral: true });}

          switch (btn.customId) {
            case "help_home":
              await btn.update({ embeds: [homeEmbed] });
              break;

            case "help_admin":
              await btn.update({ embeds: [adminEmbed] });
              break;

            case "help_mod":
              await btn.update({ embeds: [moderationEmbed] });
              break;

            case "help_support":
              await btn.update({ embeds: [supportEmbed] });
              break;

            case "help_infos":
              await btn.update({ embeds: [infoEmbed] });
              break;
          }
        });
      }
    }
  },
};
