import { EmbedBuilder } from "discord.js";
import TeamInfo from "#models/TeamInfo.js";
import UserDB from "#models/User.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

export default {
  name: "team-info",
  description: "» Verwaltung der Team Mitglieder",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "type": 1,
      "name": "add",
      "description": "» Füge ein Teammitglied hinzu. 📌",
      "options": [
        {
          "type": 3,
          "choices": [
            {
              "name": "Admin",
              "value": "Admin",
            },
            {
              "name": "Developer",
              "value": "Developer",
            },
            {
              "name": "Sr-Moderator",
              "value": "Sr-Moderator",
            },
            {
              "name": "Moderator",
              "value": "Moderator",
            },
            {
              "name": "Supporter",
              "value": "Supporter",
            },
            {
              "name": "Builder",
              "value": "Builder",
            },
          ],
          "name": "bereich",
          "description": "Bereich des Teammitglieds",
          "required": true,
        },
        {
          "name": "user",
          "description": "Welches Teammitglied?",
          "required": true,
          "type": 6,
        },
        {
          "type": 3,
          "name": "aufgabe",
          "description": "Aufgabe des Teammitglieds",
          "required": true,
        },
        {
          "type": 3,
          "name": "alter",
          "description": "Alter des Teammitglieds (Optional, wird sonst automatisch berechnet)",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "edit",
      "description": "» Bearbeite ein bestehendes Teammitglied.",
      "options": [
        {
          "name": "user",
          "description": "Welches Teammitglied soll bearbeitet werden?",
          "required": true,
          "type": 6,
        },
        {
          "type": 3,
          "choices": [
            {
              "name": "Admin",
              "value": "Admin",
            },
            {
              "name": "Developer",
              "value": "Developer",
            },
            {
              "name": "Sr-Moderator",
              "value": "Sr-Moderator",
            },
            {
              "name": "Moderator",
              "value": "Moderator",
            },
            {
              "name": "Supporter",
              "value": "Supporter",
            },
            {
              "name": "Builder",
              "value": "Builder",
            },
          ],
          "name": "bereich",
          "description": "Neuer Bereich des Teammitglieds",
          "required": false,
        },
        {
          "type": 3,
          "name": "aufgabe",
          "description": "Neue Aufgabe",
          "required": false,
        },
        {
          "type": 3,
          "name": "name",
          "description": "Neuer Name",
          "required": false,
        },
        {
          "type": 3,
          "name": "alter",
          "description": "Neues Alter oder \"remove\" zum Löschen",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "remove",
      "description": "» Entferne ein Team-Mitglied. 📌",
      "options": [
        {
          "name": "user",
          "description": "» Discord-Nutzer auswählen",
          "required": false,
          "type": 6,
        },
        {
          "type": 3,
          "name": "userid",
          "description": "» Oder gib eine Discord-ID manuell ein",
          "required": false,
        },
      ],
    },
    {
      "type": 1,
      "name": "list",
      "description": "Sendet das Team Info Embed.",
      "options": [],
    },
    {
      "type": 1,
      "name": "refresh",
      "description": "Aktualisiere das Team Info Embed.",
      "options": [],
    },
  ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const bereich = interaction.options.getString("bereich");
      const user = interaction.options.getUser("user");
      const aufgabe = interaction.options.getString("aufgabe");
      let alter = interaction.options.getString("alter");

      const existing = await TeamInfo.findOne({ userID: user.id });
      if (existing) {
        return interaction.reply({ content: `> \`⚠️\` » ${user} ist bereits ein Teammitglied.`, ephemeral: true });
      }

      if (!alter) {
        const userData = await UserDB.findOne({ userId: user.id });
        if (userData?.birthday?.jahr) {
          const heute = new Date();
          alter = heute.getFullYear() - userData.birthday.jahr;
          if (
            userData.birthday.monat > (heute.getMonth() + 1) ||
                        (userData.birthday.monat === (heute.getMonth() + 1) && userData.birthday.tag > heute.getDate())
          ) {
            alter--;
          }
        } else {
          alter = "`➖`";
        }
      }

      try {
        const newMember = new TeamInfo({
          userID: user.id,
          alter,
          aufgabe,
          bereich,
        });

        await newMember.save();
        await interaction.reply({ content: `> \`✅\` » ${user} wurde dem Team im Bereich **${bereich}** hinzugefügt.`, ephemeral: true });
        await updateTeamEmbed(interaction);
      } catch (err) {
        logger.error("Fehler beim Speichern:", err);
        return interaction.reply({ content: "> `❌` » Fehler beim Speichern des Teammitglieds.", ephemeral: true });
      }
    }

    else if (subcommand === "edit") {
      const user = interaction.options.getUser("user");
      const member = await TeamInfo.findOne({ userID: user.id });

      if (!member) {
        return interaction.reply({ content: `> \`❗\` » ${user} ist kein Teammitglied.`, ephemeral: true });
      }

      const bereich = interaction.options.getString("bereich");
      const aufgabe = interaction.options.getString("aufgabe");
      let alter = interaction.options.getString("alter");

      if (alter && (alter.toLowerCase() === "remove" || alter.toLowerCase() === "none")) {
        alter = "`➖`";
      } else if (!alter) {
        alter = member.alter;
      }

      if (bereich !== null && bereich !== undefined) {member.bereich = bereich;}
      if (aufgabe !== null && aufgabe !== undefined) {member.aufgabe = aufgabe;}
      if (alter !== null && alter !== undefined) {member.alter = alter;}

      try {
        await member.save();
        await interaction.reply({ content: `> \`✅\` » Teammitglied ${user} wurde aktualisiert.`, ephemeral: true });
        await updateTeamEmbed(interaction);
      } catch (err) {
        logger.error("Fehler beim Aktualisieren:", err);
        return interaction.reply({ content: "> `❌` » Fehler beim Aktualisieren des Teammitglieds.", ephemeral: true });
      }
    }

    else if (subcommand === "remove") {
      const user = interaction.options.getUser("user");
      const userId = interaction.options.getString("userid");
      const idToRemove = user?.id || userId;

      if (!idToRemove) {
        return interaction.reply({
          content: "> `❗` » Bitte gib einen Nutzer an oder eine ID ein.",
          ephemeral: true,
        });
      }

      const member = await TeamInfo.findOneAndDelete({ userID: idToRemove });

      if (member) {
        const displayName = user ? `${user}` : `\`${idToRemove}\``;
        await interaction.reply({
          content: `> \`❌\` » ${displayName} wurde aus dem Team entfernt.`,
          ephemeral: true,
        });
        await updateTeamEmbed(interaction);
      } else {
        const displayName = user ? `${user}` : `\`${idToRemove}\``;
        await interaction.reply({
          content: `> \`❗\` » ${displayName} ist kein Teammitglied.`,
          ephemeral: true,
        });
      }
    }

    else if (subcommand === "list") {
      await sendTeamEmbed(interaction);
    }

    else if (subcommand === "refresh") {
      await updateTeamEmbed(interaction);
      await interaction.reply({ content: "> `✅` » Das Team Embed wurde aktualisiert.", ephemeral: true });
    }
  },
};

async function updateTeamEmbed(interaction) {
  const teamMembers = await TeamInfo.find({});
  const bereiche = [
    { name: "Admin", id: settings.get("teamRoles.admin") },
    { name: "Developer", id: settings.get("teamRoles.developer") },
    { name: "Sr-Moderator", id: settings.get("teamRoles.srModerator") },
    { name: "Moderator", id: settings.get("teamRoles.moderator") },
    { name: "Supporter", id: settings.get("teamRoles.supporter") },
    { name: "Builder", id: settings.get("teamRoles.builder") },
  ];

  let embedDescription = "";

  bereiche.forEach(bereich => {
    const role = interaction.guild.roles.cache.get(bereich.id) || `<@&${bereich.id}>`;
    const membersInArea = teamMembers.filter(m => m.bereich === bereich.name);

    const countDisplay = `(\`${membersInArea.length}👥\`)`;

    if (membersInArea.length > 0) {
      embedDescription += `${role} ${countDisplay}:\n` +
                membersInArea.map(member => {
                  const mention = `<@${member.userID}>`;
                  const displayedAge = member.alter || "`➖`";
                  return `- ${mention} (${member.aufgabe}) - (Alter: ${displayedAge})`;
                }).join("\n") + "\n\n";
    } else {
      embedDescription += `${role} ${countDisplay}:\n> \`❌\` » Aktuell kein Teammitglied in diesem Bereich.\n\n`;
    }
  });

  const TeamEmbed = new EmbedBuilder()
    .setTitle("WOC Server-Team")
    .setDescription(embedDescription || "Keine Teammitglieder gelistet.")
    .setColor("Orange")
    .setFooter({ text: "Zuletzt Aktualisiert" })
    .setTimestamp();

  try {
    const channel = interaction.guild.channels.cache.get(settings.get("channels.teamOverview")); // Channel-ID prüfen
    const messageId = settings.get("messages.teamOverview"); // Embed-Nachricht-ID prüfen

    if (!channel) {return logger.error("Team-Channel nicht gefunden.");}
    const message = await channel.messages.fetch(messageId).catch(err => {
      logger.error("Fehler beim Nachricht-Fetch:", err);
      return null;
    });

    if (message) {await message.edit({ embeds: [TeamEmbed] });}
    else {logger.error("Embed-Nachricht nicht gefunden.");}
  } catch (error) {
    logger.error("Fehler beim Aktualisieren des Embeds:", error);
  }
}

async function sendTeamEmbed(interaction) {
  const teamMembers = await TeamInfo.find({});
  const bereiche = [
    { name: "Admin", id: settings.get("teamRoles.admin") },
    { name: "Developer", id: settings.get("teamRoles.developer") },
    { name: "Sr-Moderator", id: settings.get("teamRoles.srModerator") },
    { name: "Moderator", id: settings.get("teamRoles.moderator") },
    { name: "Supporter", id: settings.get("teamRoles.supporter") },
    { name: "Builder", id: settings.get("teamRoles.builder") },
  ];

  let embedDescription = "";

  bereiche.forEach(bereich => {
    const role = interaction.guild.roles.cache.get(bereich.id) || `<@&${bereich.id}>`;
    const membersInArea = teamMembers.filter(m => m.bereich === bereich.name);

    const countDisplay = `(\`${membersInArea.length}👥\`)`;

    if (membersInArea.length > 0) {
      embedDescription += `${role} ${countDisplay}:\n` +
                membersInArea.map(member => {
                  const mention = `<@${member.userID}>`;
                  const displayedAge = member.alter || "`➖`";
                  return `- ${mention} (${member.aufgabe}) - (Alter: ${displayedAge})`;
                }).join("\n") + "\n\n";
    } else {
      embedDescription += `${role} ${countDisplay}:\n> \`❌\` » Aktuell kein Teammitglied in diesem Bereich.\n\n`;
    }
  });

  const TeamEmbed = new EmbedBuilder()
    .setTitle("WOC Server-Team")
    .setDescription(embedDescription || "Keine Teammitglieder gelistet.")
    .setColor("Orange")
    .setFooter({ text: "Zuletzt Aktualisiert" })
    .setTimestamp();

  await interaction.reply({ embeds: [TeamEmbed], ephemeral: true });
}
