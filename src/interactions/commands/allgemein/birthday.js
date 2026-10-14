import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits} from "discord.js";
import userDB from "#models/User.js";
import logger from "#core/logger.js";

export default {
  name: "birthday",
  description: "Geburstag System",
  type: 1,
  options: [
    {
      "type": 1,
      "name": "set",
      "description": "» Setze deinen Geburtstag. 🎂",
      "options": [
        {
          "type": 4,
          "name": "tag",
          "description": "» An welchen Tag wurdest du geboren?",
          "required": true,
        },
        {
          "type": 4,
          "name": "monat",
          "description": "» In welchen Monat wurdest du geboren?",
          "required": true,
        },
        {
          "type": 4,
          "name": "jahr",
          "description": "» In welchen Jahr wurdest du geboren?",
          "required": false,
        },
        {
          "type": 6,
          "name": "user",
          "description": "» (Nur Admins) Für welchen Nutzer soll der Geburtstag gesetzt werden?",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "delete",
      "description": "» Lösche den Geburtstag eines Nutzers. 🎂",
      "options": [
        {
          "name": "user",
          "description": "» Welchen Nutzer möchtest du löschen?",
          "required": true,
          "type": 6,
        },
      ],
    },
    {
      "type": 1,
      "name": "change",
      "description": "» Ändere den Geburtstag eines Nutzers. 🎂",
      "options": [
        {
          "name": "user",
          "description": "» Welchen Nutzer möchtest du ändern?",
          "required": true,
          "type": 6,
        },
        {
          "type": 4,
          "name": "tag",
          "description": "» An welchem Tag wurde der Nutzer geboren?",
          "required": true,
        },
        {
          "type": 4,
          "name": "monat",
          "description": "» In welchem Monat wurde der Nutzer geboren?",
          "required": true,
        },
        {
          "type": 4,
          "name": "jahr",
          "description": "» In welchem Jahr wurde der Nutzer geboren?",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "next",
      "description": "» Zeigt dir die nächsten Geburtstage an. 🎂",
      "options": [],
    },
  ],

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();
    let tag, monat, jahr, user;

    switch (sub) {
      case "set":
        tag = interaction.options.getInteger("tag");
        monat = interaction.options.getInteger("monat");
        jahr = interaction.options.getInteger("jahr");
        user = interaction.options.getUser("user");

        if (user && user.id !== interaction.user.id && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
          return interaction.reply({ content: "> `❌` » Du hast keine Berechtigung, den Geburtstag anderer Nutzer zu setzen.", ephemeral: true });
        }

        if (!isValidDate(tag, monat, jahr)) {
          return interaction.reply({ content: "> `❌` » Bitte gib ein gültiges Datum ein.", ephemeral: true });
        }

        try {
          const targetID = user ? user.id : interaction.user.id;
          if (jahr) {
            await userDB.findOneAndUpdate(
              { userID: targetID },
              {
                "birthday.tag": tag,
                "birthday.monat": monat,
                "birthday.jahr": jahr,
              },
              { upsert: true, returnDocument: "after" },
            );
          } else {
            await userDB.findOneAndUpdate(
              { userID: targetID },
              {
                "birthday.tag": tag,
                "birthday.monat": monat,
              },
              { upsert: true, returnDocument: "after" },
            );
          }
          if (user && user.id !== interaction.user.id) {
            await interaction.reply({ content: `> \`✅\` » Der Geburtstag von ${user} wurde erfolgreich gespeichert.`, ephemeral: true });
          } else {
            await interaction.reply({ content: "> `✅` » Danke dass du mit uns deinen Geburtstag feierst, dein Geburtstag wurde erfolgreich gespeichert. <a:Cool:915211628755169301>", ephemeral: true });
          }
        } catch (error) {
          logger.error(error);
          await interaction.reply({ content: "> `❌` » Es gab einen Fehler beim Speichern des Geburtstags. Bitte melde dich beim Ticket Support.", ephemeral: true });
        }
        break;

      case "delete":
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
          return interaction.reply({ content: "> `❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.", ephemeral: true });
        }

        user = interaction.options.getUser("user");
        if (!user) {
          return interaction.reply({ content: "> `❌` » User wurde nicht gefunden.", ephemeral: true });
        }

        try {
          await userDB.findOneAndUpdate(
            { userID: user.id },
            { $unset: { birthday: "" } },
          );
          await interaction.reply({ content: "> `✅` » Der Geburtstag wurde gelöscht.", ephemeral: true });
        } catch (error) {
          logger.error(error);
          await interaction.reply({ content: "> `❌` » Es gab einen Fehler beim Löschen des Geburtstags. Bitte melde dich beim Ticket Support.", ephemeral: true });
        }
        break;

      case "change":
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
          return interaction.reply({ content: "> `❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.", ephemeral: true });
        }

        user = interaction.options.getUser("user");
        tag = interaction.options.getInteger("tag");
        monat = interaction.options.getInteger("monat");
        jahr = interaction.options.getInteger("jahr");

        if (!user) {
          return interaction.reply({ content: "> `❌` » User wurde nicht gefunden.", ephemeral: true });
        }

        if (!isValidDate(tag, monat, jahr)) {
          return interaction.reply({ content: "> `❌` » Bitte gib ein gültiges Datum ein.", ephemeral: true });
        }

        try {
          if (jahr) {
            await userDB.findOneAndUpdate(
              { userID: user.id },
              {
                "birthday.tag": tag,
                "birthday.monat": monat,
                "birthday.jahr": jahr,
              },
              { upsert: true, returnDocument: "after" },
            );
          } else {
            await userDB.findOneAndUpdate(
              { userID: user.id },
              {
                "birthday.tag": tag,
                "birthday.monat": monat,
              },
              { upsert: true, returnDocument: "after" },
            );
          }
          await interaction.reply({ content: "> `✅` » Der Geburtstag wurde geändert.", ephemeral: true });
        } catch (error) {
          logger.error(error);
          await interaction.reply({ content: "> `❌` » Es gab einen Fehler beim Ändern des Geburtstags. Bitte melde dich beim Ticket Support.", ephemeral: true });
        }
        break;

        //

      case "next": {
        const pageSize = 10;

        let upcomingBirthdays = await userDB.find({
          "birthday.tag": { $exists: true, $ne: null },
          "birthday.monat": { $exists: true, $ne: null },
        });

        upcomingBirthdays = upcomingBirthdays.filter(b => b.birthday.tag !== 0);

        if (upcomingBirthdays.length === 0) {
          return interaction.reply({ content: "> `❌` » Keine Geburtstage gefunden.", ephemeral: true });
        }

        // Heute-Datum holen
        const today = new Date();
        const currentYear = today.getFullYear();

        // Sortieren nach dem nächsten echten Geburtstag
        upcomingBirthdays.sort((a, b) => {
          const dateA = new Date(currentYear, a.birthday.monat - 1, a.birthday.tag);
          const dateB = new Date(currentYear, b.birthday.monat - 1, b.birthday.tag);

          // Wenn der Geburtstag dieses Jahr schon vorbei ist → aufs nächste Jahr schieben
          if (dateA < today) {dateA.setFullYear(currentYear + 1);}
          if (dateB < today) {dateB.setFullYear(currentYear + 1);}

          return dateA - dateB;
        });

        let currentPage = 1;
        const totalPages = Math.ceil(upcomingBirthdays.length / pageSize);

        function createBirthdayEmbed(birthdays, page) {
          const startIndex = (page - 1) * pageSize;
          const endIndex = Math.min(page * pageSize, birthdays.length);

          let description = "Hier sind die nächsten Geburtstage:\n\n";

          // Nur auf Seite 1 den nächsten Geburtstag oben anzeigen
          if (page === 1 && birthdays.length > 0) {
            const next = birthdays[0];
            const formattedTag = next.birthday.tag.toString().padStart(2, "0");
            const formattedMonat = next.birthday.monat.toString().padStart(2, "0");
            const formattedDate = next.birthday.jahr
              ? `${formattedTag}.${formattedMonat}.${next.birthday.jahr}`
              : `${formattedTag}.${formattedMonat}.`;

            description += `**Nächster Geburtstag:** <@${next.userID}> - ${formattedDate}\n\n`;
          }

          const pageBirthdays = birthdays.slice(startIndex, endIndex);

          let previousMonth = null; // Für die Trennung der Jahre/Monate

          for (const birthday of pageBirthdays) {
            const { userID, birthday: { tag, monat, jahr } } = birthday;
            const member = interaction.guild.members.cache.get(userID);
            if (!member) {continue;}

            // Trennlinie, wenn Monatswechsel von hoch zu niedrig (z.B. 12 → 1)
            if (previousMonth !== null && monat < previousMonth) {
              description += "──────────────────────────────────────────────\n";
            }
            previousMonth = monat;

            const formattedTag = tag.toString().padStart(2, "0");
            const formattedMonat = monat.toString().padStart(2, "0");
            const formattedDate = jahr ? `${formattedTag}.${formattedMonat}.${jahr}` : `${formattedTag}.${formattedMonat}.`;

            description += `${member} - ${formattedDate}\n`;
          }

          return new EmbedBuilder()
            .setTitle("`🎂` × Geburtstage der Community")
            .setDescription(description)
            .setColor("Blurple")
            .setFooter({ text: `» ${interaction.guild.name} - Seite ${page} von ${totalPages}`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();
        }

        function createPaginationButtons(page, totalPages) {
          return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId("prev")
              .setLabel("⬅️ Vorherige Seite")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === 1),
            new ButtonBuilder()
              .setCustomId("next")
              .setLabel("➡️ Nächste Seite")
              .setStyle(ButtonStyle.Primary)
              .setDisabled(page === totalPages),
          );
        }

        const embed = createBirthdayEmbed(upcomingBirthdays, currentPage);
        const buttons = createPaginationButtons(currentPage, totalPages);

        const message = await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });

        const filter = i => ["prev", "next"].includes(i.customId) && i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter });

        collector.on("collect", async i => {
          if (i.customId === "prev") {
            currentPage = Math.max(currentPage - 1, 1);
          } else if (i.customId === "next") {
            currentPage = Math.min(currentPage + 1, totalPages);
          }

          const updatedEmbed = createBirthdayEmbed(upcomingBirthdays, currentPage);
          const updatedButtons = createPaginationButtons(currentPage, totalPages);

          await i.update({ embeds: [updatedEmbed], components: [updatedButtons] });
        });

        collector.on("end", () => {
          message.edit({ components: [] });
        });
      }
        break;
    }
  },
};

function isValidDate(day, month, year) {
  if (!year) {
    year = 2000; // Ein Schaltjahr, um Datumsprobleme zu vermeiden
  }
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
