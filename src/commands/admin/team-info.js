const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const TeamInfo = require("../../../Datenbank/teaminfodb");
const UserDB = require("../../../Datenbank/userdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("team-info")
    .setDescription("» Verwaltung der Team Mitglieder")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName("add")
        .setDescription("» Füge ein Teammitglied hinzu. 📌")
        .addStringOption(option =>
          option.setName("bereich")
            .setDescription("Bereich des Teammitglieds")
            .setRequired(true)
            .addChoices(
              { name: "Admin", value: "Admin" },
              { name: "Developer", value: "Developer" },
              { name: "Sr-Moderator", value: "Sr-Moderator" },
              { name: "Moderator", value: "Moderator" },
              { name: "Supporter", value: "Supporter" },
              { name: "Builder", value: "Builder" },
            ))
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Welches Teammitglied?")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("beschreibung")
            .setDescription("Beschreibung des Teammitglieds")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("name")
            .setDescription("Name des Teammitglieds")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("alter")
            .setDescription("Alter des Teammitglieds (Optional, wird sonst automatisch berechnet)")
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName("edit")
        .setDescription("» Bearbeite ein bestehendes Teammitglied.")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("Welches Teammitglied soll bearbeitet werden?")
            .setRequired(true))
        .addStringOption(option =>
          option.setName("bereich")
            .setDescription("Neuer Bereich des Teammitglieds")
            .setRequired(false)
            .addChoices(
              { name: "Admin", value: "Admin" },
              { name: "Developer", value: "Developer" },
              { name: "Sr-Moderator", value: "Sr-Moderator" },
              { name: "Moderator", value: "Moderator" },
              { name: "Supporter", value: "Supporter" },
              { name: "Builder", value: "Builder" },
            ))
        .addStringOption(option =>
          option.setName("beschreibung")
            .setDescription("Neue Beschreibung")
            .setRequired(false))
        .addStringOption(option =>
          option.setName("name")
            .setDescription("Neuer Name")
            .setRequired(false))
        .addStringOption(option =>
          option.setName("alter")
            .setDescription('Neues Alter oder "remove" zum Löschen')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName("remove")
        .setDescription("» Entferne ein Team-Mitglied. 📌")
        .addUserOption(option =>
          option.setName("user")
            .setDescription("» Discord-Nutzer auswählen")
            .setRequired(false))
        .addStringOption(option =>
          option.setName("userid")
            .setDescription("» Oder gib eine Discord-ID manuell ein")
            .setRequired(false)),
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName("list")
        .setDescription("Sendet das Team Info Embed."))
    .addSubcommand(subcommand =>
      subcommand
        .setName("refresh")
        .setDescription("Aktualisiere das Team Info Embed.")),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const bereich = interaction.options.getString("bereich");
      const user = interaction.options.getUser("user");
      const name = interaction.options.getString("name");
      const beschreibung = interaction.options.getString("beschreibung");
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
          name,
          alter,
          beschreibung,
          bereich,
        });

        await newMember.save();
        await interaction.reply({ content: `> \`✅\` » ${user} wurde dem Team im Bereich **${bereich}** hinzugefügt.`, ephemeral: true });
        await updateTeamEmbed(interaction);
      } catch (err) {
        console.error("Fehler beim Speichern:", err);
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
      const beschreibung = interaction.options.getString("beschreibung");
      const name = interaction.options.getString("name");
      let alter = interaction.options.getString("alter");

      if (alter && (alter.toLowerCase() === "remove" || alter.toLowerCase() === "none")) {
        alter = "`➖`";
      } else if (!alter) {
        alter = member.alter;
      }

      if (bereich !== null && bereich !== undefined) {member.bereich = bereich;}
      if (beschreibung !== null && beschreibung !== undefined) {member.beschreibung = beschreibung;}
      if (name !== null && name !== undefined) {member.name = name;}
      if (alter !== null && alter !== undefined) {member.alter = alter;}

      try {
        await member.save();
        await interaction.reply({ content: `> \`✅\` » Teammitglied ${user} wurde aktualisiert.`, ephemeral: true });
        await updateTeamEmbed(interaction);
      } catch (err) {
        console.error("Fehler beim Aktualisieren:", err);
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
    { name: "Admin", id: "959869691529154631" },
    { name: "Developer", id: "929349039433056276" },
    { name: "Sr-Moderator", id: "816985466230145044" },
    { name: "Moderator", id: "815920052385480754" },
    { name: "Supporter", id: "815920170371383366" },
    { name: "Builder", id: "1263645368441241700" },
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
                  return `- ${mention} (${member.beschreibung}) - (Alter: ${displayedAge})`;
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
    const channel = interaction.guild.channels.cache.get("1291421526238822481"); // Channel-ID prüfen
    const messageId = "1293559329961803950"; // Embed-Nachricht-ID prüfen

    if (!channel) {return console.error("Team-Channel nicht gefunden.");}
    const message = await channel.messages.fetch(messageId).catch(err => {
      console.error("Fehler beim Nachricht-Fetch:", err);
      return null;
    });

    if (message) {await message.edit({ embeds: [TeamEmbed] });}
    else {console.error("Embed-Nachricht nicht gefunden.");}
  } catch (error) {
    console.error("Fehler beim Aktualisieren des Embeds:", error);
  }
}

async function sendTeamEmbed(interaction) {
  const teamMembers = await TeamInfo.find({});
  const bereiche = [
    { name: "Admin", id: "959869691529154631" },
    { name: "Developer", id: "929349039433056276" },
    { name: "Sr-Moderator", id: "816985466230145044" },
    { name: "Moderator", id: "815920052385480754" },
    { name: "Supporter", id: "815920170371383366" },
    { name: "Builder", id: "1263645368441241700" },
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
                  return `- ${mention} (${member.beschreibung}) - (Alter: ${displayedAge})`;
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
