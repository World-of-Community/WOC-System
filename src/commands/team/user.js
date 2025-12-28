const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");

const Timeout = require("../../../Datenbank/timeoutdb");
const Warn = require("../../../Datenbank/warndb");
const bandb = require("../../../Datenbank/bandb");
const Note = require("../../../Datenbank/notedb");

const BANNED_ROLE_ID = "886989738244964362";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("» User Verwaltung & Infos 👤")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
  // INFO
    .addSubcommand(sub =>
      sub.setName("info")
        .setDescription("» Zeigt Infos über einen User")
        .addUserOption(o =>
          o.setName("user")
            .setDescription("Der User")
            .setRequired(true),
        ),
    )
  // NOTE ADD
    .addSubcommand(sub =>
      sub.setName("note-add")
        .setDescription("» Fügt eine Notiz hinzu")
        .addUserOption(o =>
          o.setName("user")
            .setDescription("Der User")
            .setRequired(true),
        )
        .addStringOption(o =>
          o.setName("text")
            .setDescription("Notiz Text")
            .setRequired(true),
        ),
    )
  // NOTE EDIT
    .addSubcommand(sub =>
      sub.setName("note-edit")
        .setDescription("» Bearbeitet eine Notiz")
        .addStringOption(o =>
          o.setName("noteid")
            .setDescription("ID der Notiz")
            .setRequired(true),
        )
        .addStringOption(o =>
          o.setName("text")
            .setDescription("Neuer Text")
            .setRequired(true),
        ),
    )
  // NOTE DELETE
    .addSubcommand(sub =>
      sub.setName("note-delete")
        .setDescription("» Löscht eine einzelne Notiz")
        .addStringOption(o =>
          o.setName("noteid")
            .setDescription("ID der Notiz")
            .setRequired(true),
        ),
    )
  // NOTE CLEAR
    .addSubcommand(sub =>
      sub.setName("note-clear")
        .setDescription("» Löscht alle Notizen eines Users")
        .addUserOption(o =>
          o.setName("user")
            .setDescription("Der User")
            .setRequired(true),
        ),
    ),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const hasModPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);

    // ───────────── NOTE ADD ─────────────
    if (sub === "note-add") {
      if (!hasModPerm)
      {return interaction.reply({ content: "> `❌` » Keine Berechtigung.", ephemeral: true });}

      const user = interaction.options.getUser("user");
      const text = interaction.options.getString("text");

      if (text.length > 4000)
      {return interaction.reply({ content: "> `❌` » Max. 4000 Zeichen.", ephemeral: true });}

      await Note.create({
        userId: user.id,
        guildId: interaction.guild.id,
        authorId: interaction.user.id,
        note: text,
      });

      return interaction.reply({
        content: `> \`📝\` » Notiz für **${user.username}** gespeichert.`,
        ephemeral: true,
      });
    }

    // ───────────── NOTE EDIT ─────────────
    if (sub === "note-edit") {
      if (!hasModPerm)
      {return interaction.reply({ content: "> `❌` » Keine Berechtigung.", ephemeral: true });}

      const noteId = interaction.options.getString("noteid");
      const newText = interaction.options.getString("text");

      const note = await Note.findOne({ _id: noteId, guildId: interaction.guild.id });
      if (!note)
      {return interaction.reply({ content: "> `❌` » Notiz nicht gefunden.", ephemeral: true });}

      note.note = newText;
      await note.save();

      return interaction.reply({
        content: `> \`✏️\` » Notiz **${noteId}** bearbeitet.`,
        ephemeral: true,
      });
    }

    // ───────────── NOTE DELETE ─────────────
    if (sub === "note-delete") {
      if (!hasModPerm)
      {return interaction.reply({ content: "> `❌` » Keine Berechtigung.", ephemeral: true });}

      const noteId = interaction.options.getString("noteid");

      const deleted = await Note.findOneAndDelete({ _id: noteId, guildId: interaction.guild.id });
      if (!deleted)
      {return interaction.reply({ content: "> `❌` » Notiz nicht gefunden.", ephemeral: true });}

      return interaction.reply({
        content: `> \`🗑️\` » Notiz **${noteId}** gelöscht.`,
        ephemeral: true,
      });
    }

    // ───────────── NOTE CLEAR ─────────────
    if (sub === "note-clear") {
      if (!hasModPerm)
      {return interaction.reply({ content: "> `❌` » Keine Berechtigung.", ephemeral: true });}

      const user = interaction.options.getUser("user");

      await Note.deleteMany({
        userId: user.id,
        guildId: interaction.guild.id,
      });

      return interaction.reply({
        content: `> \`🗑️\` » Alle Notizen für **${user.username}** gelöscht.`,
        ephemeral: true,
      });
    }

    // ───────────── INFO ─────────────
    if (sub === "info") {
      try {
        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}:f>`;
        const joinedAt = member?.joinedTimestamp
          ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:f>`
          : "`Nicht auf dem Server`";

        const [timeouts, warns, notes] = await Promise.all([
          Timeout.countDocuments({ userId: user.id, guildId: interaction.guild.id }),
          Warn.countDocuments({ userId: user.id, guildId: interaction.guild.id }),
          Note.find({ userId: user.id, guildId: interaction.guild.id })
            .sort({ createdAt: -1 })
            .limit(5),
        ]);

        let banned = false;
        if (await bandb.findOne({ userId: user.id })) {banned = true;}
        else if (await interaction.guild.bans.fetch(user.id).catch(() => null)) {banned = true;}
        else if (member?.roles.cache.has(BANNED_ROLE_ID)) {banned = true;}

        const noteText = notes.length
          ? notes.map(n =>
            `> Beschreibung: ${n.note}\n> Notiz-ID: \`${n._id}\`\n> von <@${n.authorId}> (<t:${Math.floor(n.createdAt.getTime() / 1000)}:f>)`,
          ).join("\n")
          : "Keine Notizen vorhanden";

        const embed = new EmbedBuilder()
          .setColor(banned ? 0xED4245 : 0x57F287)
          .setTitle(`\`👤\` Informationen über ${member?.displayName || user.username}`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
          .setDescription(
            "**`📌` Benutzerinformationen**\n" +
                    `> \`👤\` » Benutzername: \`${user.username}\`\n` +
                    `> \`🆔\` » Benutzer-ID: \`${user.id}\`\n` +
                    `> \`🏷️\` » Anzeigename: \`${member?.displayName || user.username}\`\n\n` +

                    "**`⏰` Mitglied seit**\n" +
                    `> \`📅\` » Erstellt: ${createdAt}\n` +
                    `> \`📅\` » Beigetreten: ${joinedAt}\n\n` +

                    "**`👮` Moderation**\n" +
                    `> \`⛔\` » Bannstatus: ${banned ? "`🔴` Gebannt" : "`🟢` Nicht gebannt"}\n` +
                    `> \`🔇\` » Timeouts: \`${timeouts}\`\n` +
                    `> \`❗\` » Warnungen: \`${warns}\`\n\n` +

                    `**\`📝\` Notizen**\n> ${noteText}`,
          )
          .setFooter({ text: `${interaction.guild.name} | Userinfo` })
          .setTimestamp();

        // Optional: Button für Strafen anzeigen
        const buttonRow = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`showPunishments_${user.id}`)
              .setLabel("⚠️ Strafen anzeigen")
              .setStyle(ButtonStyle.Danger),
          );

        const msg = await interaction.reply({
          embeds: [embed],
          components: [buttonRow],
          ephemeral: true,
          fetchReply: true,
        });

        const collector = msg.createMessageComponentCollector({ time: 60 * 1000 });

        collector.on("collect", async btn => {
          if (btn.user.id !== interaction.user.id)
          {return btn.reply({ content: "> `❌` Das ist nicht dein Menü.", ephemeral: true });}

          if (btn.customId !== `showPunishments_${user.id}`) {return;}

          const timeouts = await Timeout.find({ userId: user.id, guildId: interaction.guild.id }).sort({ createdAt: -1 });
          const warns = await Warn.find({ userId: user.id, guildId: interaction.guild.id }).sort({ createdAt: -1 });

          // SICHERES FORMAT
          const format = (date) => {
            if (!date || !(date instanceof Date) || isNaN(date.getTime())) {return "`Datum fehlt`";}
            return `<t:${Math.floor(date.getTime() / 1000)}:F>`;
          };

          const warnText = warns.length > 0
            ? warns.map(w => `• **Grund:** \`${w.reason || "Keine Angabe"}\`\n• **Zeit:** ${format(w.createdAt)}`).join("\n\n")
            : "`Keine Warnungen vorhanden`";

          const timeoutText = timeouts.length > 0
            ? timeouts.map(t => `• **Grund:** \`${t.reason || "Keine Angabe"}\`\n• **Zeit:** ${format(t.createdAt)}`).join("\n\n")
            : "`Keine Timeouts vorhanden`";

          const punishEmbed = new EmbedBuilder()
            .setTitle(`\`🔴\` Strafen - ${user.username}`)
            .setColor("Red")
            .addFields(
              { name: "`❗` Warnungen", value: warnText },
              { name: "`🔇` Timeouts", value: timeoutText },
            )
            .setTimestamp();

          return btn.reply({
            embeds: [punishEmbed],
            ephemeral: true,
          });
        });

        collector.on("end", async () => {
          if (msg.editable) {msg.edit({ components: [] }).catch(() => { });}
        });

        return;

      } catch (error) {
        console.error("Fehler:", error);
        return interaction.reply({
          content: "> `❌` Fehler beim Abrufen der Benutzerdaten.",
          ephemeral: true,
        });
      }
    }

    // ------------------- FIND -------------------
    if (sub === "find") {
      const id = interaction.options.getString("id");
      const user = await interaction.client.users.fetch(id).catch(() => null);
      if (!user) {return interaction.reply({ content: "> `❌` Kein User mit dieser ID gefunden.", ephemeral: true });}
      const member = await interaction.guild.members.fetch(id).catch(() => null);
      const embed = new EmbedBuilder()
        .setColor("Blurple")
        .setTitle(`\`🔎\` User gefunden: ${user.username}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "`👤` Benutzername", value: `${user} (${user.username})`, inline: false },
          { name: "`🆔` User ID", value: `\`${user.id}\``, inline: false },
          {
            name: "`🏷️` Serverstatus",
            value: member
              ? `\`✅\` Auf dem Server\nNickname: ${member.displayName}`
              : "`❌` Nicht auf dem Server",
            inline: false,
          },
          {
            name: "`📅` Account erstellt",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}>` ,
            inline: false,
          },
          {
            name: "`📅` Server beigetreten",
            value: member?.joinedTimestamp
              ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>`
              : "`Nicht auf dem Server`",
            inline: false,
          },
        )
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};
