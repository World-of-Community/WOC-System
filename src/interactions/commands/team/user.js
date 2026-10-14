import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits} from "discord.js";

import Timeout from "#models/timeoutdb.js";
import Warn from "#models/warndb.js";
import bandb from "#models/bandb.js";
import Note from "#models/notedb.js";

const BANNED_ROLE_ID = "886989738244964362";

export default {
  name: "user",
  description: "» User Verwaltung & Infos 👤",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      "type": 1,
      "name": "info",
      "description": "» Zeigt Infos über einen User",
      "options": [
        {
          "name": "user",
          "description": "Der User",
          "required": true,
          "type": 6,
        },
      ],
    },
    {
      "type": 1,
      "name": "find",
      "description": "» Sucht nach einem User anhand der ID",
      "options": [
        {
          "type": 3,
          "name": "userid",
          "description": "User ID",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "note-add",
      "description": "» Fügt eine Notiz hinzu",
      "options": [
        {
          "name": "user",
          "description": "Der User",
          "required": true,
          "type": 6,
        },
        {
          "type": 3,
          "name": "text",
          "description": "Notiz Text",
          "required": true,
        },
        {
          "name": "beweis",
          "description": "Bild als Beweis",
          "required": false,
          "type": 11,
        },
      ],
    },
    {
      "type": 1,
      "name": "note-edit",
      "description": "» Bearbeitet eine Notiz",
      "options": [
        {
          "type": 3,
          "name": "noteid",
          "description": "ID der Notiz",
          "required": true,
        },
        {
          "type": 3,
          "name": "text",
          "description": "Neuer Text",
          "required": true,
        },
        {
          "name": "beweis",
          "description": "Bild als Beweis",
          "required": false,
          "type": 11,
        },
      ],
    },
    {
      "type": 1,
      "name": "note-delete",
      "description": "» Löscht eine einzelne Notiz",
      "options": [
        {
          "type": 3,
          "name": "noteid",
          "description": "ID der Notiz",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "note-clear",
      "description": "» Löscht alle Notizen eines Users",
      "options": [
        {
          "name": "user",
          "description": "Der User",
          "required": true,
          "type": 6,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();
    const hasModPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);

    // ───────────── NOTE ADD ─────────────
    if (sub === "note-add") {
      if (!hasModPerm)
      {return interaction.reply({ content: "> `❌` » Keine Berechtigung.", ephemeral: true });}

      const user = interaction.options.getUser("user");
      const text = interaction.options.getString("text");
      const proof = interaction.options.getAttachment("beweis");

      if (text.length > 4000)
      {return interaction.reply({ content: "> `❌` » Max. 4000 Zeichen.", ephemeral: true });}

      await Note.create({
        userId: user.id,
        guildId: interaction.guild.id,
        authorId: interaction.user.id,
        note: text,
        proof: proof?.url || null,
      });

      return interaction.reply({
        content: `> \`📝\` » Notiz für **${user.username}** erfolgreich gespeichert.`,
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
        content: `> \`✏️\` » Notiz **\`${noteId}\`** erfolgreich bearbeitet.`,
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
        content: `> \`🗑️\` » Notiz **\`${noteId}\`** gelöscht.`,
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

    // ───────────── FIND ─────────────
    if (sub === "find") {

      const userId = interaction.options.getString("userid");

      if (!/^\d+$/.test(userId)) {
        return interaction.reply({
          content: "> `❌` » Ungültige User-ID.",
          ephemeral: true,
        });
      }

      let user;
      try {
        user = await interaction.client.users.fetch(userId);
      } catch {
        return interaction.reply({
          content: "> `❌` » Kein User mit dieser ID gefunden.",
          ephemeral: true,
        });
      }

      const member = await interaction.guild.members.fetch(user.id).catch(() => null);

      const embed = new EmbedBuilder()
        .setColor(member ? 0x57F287 : 0xED4245)
        .setTitle("`🔎` User gefunden")
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .setDescription(
          `> \`👤\` » Username: \`${user.username}\`\n` +
                    `> \`👤\` » Name: \`${user}\`\n` +
                    `> \`🆔\` » ID: \`${user.id}\`\n` +
                    `> \`📌\` » Auf dem Server: ${member ? "`🟢 Ja`" : "`🔴 Nein`"}`,
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // ───────────── INFO ─────────────
    if (sub === "info") {
      let user = interaction.options.getUser("user");
      const userIdInput = interaction.options.getString("userid");

      if (!user && !userIdInput) {
        return interaction.reply({
          content: "> `❌` » Bitte User oder User-ID angeben.",
          ephemeral: true,
        });
      }

      if (!user && userIdInput) {
        try {
          user = await interaction.client.users.fetch(userIdInput);
        } catch {
          return interaction.reply({
            content: "> `❌` » User mit dieser ID nicht gefunden.",
            ephemeral: true,
          });
        }
      }
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
          `\`✍️\` » Beschreibung: ${n.note}\n` +
                    `> \`🆔\` » Notiz-ID: \`${n._id}\`\n` +
                    `> \`👤\` » von <@${n.authorId}> (<t:${Math.floor(n.createdAt.getTime() / 1000)}:f>)`,
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
                    `> \`🏷️\` » Anzeigename: \`${member?.displayName || user.username}\`\n` +
                    `> \`📍\` » Erwähnung: ${user}\n\n` +

                    "**`⏰` Mitglied seit**\n" +
                    `> \`📅\` » Erstellt: ${createdAt}\n` +
                    `> \`📅\` » Beigetreten: ${joinedAt}\n\n` +

                    "**`👮` Moderation**\n" +
                    `> \`⛔\` » Bannstatus: ${banned ? "`🔴` Gebannt" : "`🟢` Nicht gebannt"}\n` +
                    `> \`🔇\` » Timeouts: \`${timeouts}\`\n` +
                    `> \`❗\` » Warnungen: \`${warns}\` (max. 5)\n\n` +

                    `**\`📝\` Notizen**\n> ${noteText}`,
        )
        .setFooter({ text: `${interaction.guild.name} | Userinfo` })
        .setTimestamp();

      const buttonRow = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`showPunishments_${user.id}`)
            .setLabel("⚠️ Strafen anzeigen")
            .setStyle(ButtonStyle.Danger),
        );

      return interaction.reply({ embeds: [embed], components: [buttonRow], ephemeral: true });
    }
  },
};
