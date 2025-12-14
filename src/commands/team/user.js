const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
} = require("discord.js");

const Timeout = require('../../../Datenbank/timeoutdb');
const Warn = require('../../../Datenbank/warndb');
const bandb = require('../../../Datenbank/bandb');
const Note = require('../../../Datenbank/notedb');

const RoleIds = [
    '959869691529154631', // Admin
    '929349039433056276', // Developer
    '816985466230145044', // Sr-Moderator
    '815920052385480754', // Moderator
    '815920170371383366', // Support
    '1263645368441241700', // Builder
    '1399157711752532132', // Content
    '815920219247214644', // Creator
    '862708375698538507', // VIP
    '815921105407574056', // Supreme
    '917826787977871441', // Premium
    '815920452337139733', // Legende
    '835775627721179167', // Diamond
    '835775556611997697', // Emerald
    '835775597446955048', // Episch
    '1258825307239219371', // Hyper Aktiv
    '1258794321533075526', // Ultra Aktiv
    '1258825144697360485', // Mega Aktiv
    '1258827956634128467', // Stark Aktiv
    '1258794479570124920', // Sehr Aktiv
    '1258794944953319534', // Aktiv
    '1258827226846199808', // Inaktiv
    '1391760378924630109', // OG
];

const BANNED_ROLE_ID = "886989738244964362";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('» User Verwaltung & Infos 👤')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        // INFO
        .addSubcommand(sub =>
            sub.setName("info")
                .setDescription("» Zeigt Infos über einen User")
                .addUserOption(o => o.setName("user").setRequired(true))
        )

        // NOTE ADD
        .addSubcommand(sub =>
            sub.setName("note-add")
                .setDescription("» Fügt eine Notiz hinzu")
                .addUserOption(o => o.setName("user").setRequired(true))
                .addStringOption(o => o.setName("text").setRequired(true))
        )

        // NOTE EDIT
        .addSubcommand(sub =>
            sub.setName("note-edit")
                .setDescription("» Bearbeitet eine Notiz")
                .addStringOption(o => o.setName("noteid").setRequired(true))
                .addStringOption(o => o.setName("text").setRequired(true))
        )

        // NOTE DELETE
        .addSubcommand(sub =>
            sub.setName("note-delete")
                .setDescription("» Löscht eine einzelne Notiz")
                .addStringOption(o => o.setName("noteid").setRequired(true))
        )

        // NOTE CLEAR
        .addSubcommand(sub =>
            sub.setName("note-clear")
                .setDescription("» Löscht alle Notizen eines Users")
                .addUserOption(o => o.setName("user").setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const hasModPerm = interaction.member.permissions.has(PermissionFlagsBits.ManageMessages);

        // ---------------- NOTE ADD ----------------
        if (sub === "note-add") {
            if (!hasModPerm)
                return interaction.reply({ content: "> `❌` Keine Berechtigung.", ephemeral: true });

            const user = interaction.options.getUser("user");
            const text = interaction.options.getString("text");

            if (text.length > 300)
                return interaction.reply({ content: "> `❌` Max. 300 Zeichen.", ephemeral: true });

            await Note.create({
                userId: user.id,
                guildId: interaction.guild.id,
                authorId: interaction.user.id,
                note: text
            });

            return interaction.reply({
                content: `> \`📝\` Notiz für **${user.username}** gespeichert.`,
                ephemeral: true
            });
        }

        // ---------------- NOTE EDIT ----------------
        if (sub === "note-edit") {
            if (!hasModPerm)
                return interaction.reply({ content: "> `❌` Keine Berechtigung.", ephemeral: true });

            const noteId = interaction.options.getString("noteid");
            const newText = interaction.options.getString("text");

            if (newText.length > 300)
                return interaction.reply({ content: "> `❌` Max. 300 Zeichen.", ephemeral: true });

            const note = await Note.findOne({ _id: noteId, guildId: interaction.guild.id }).catch(() => null);
            if (!note)
                return interaction.reply({ content: "> `❌` Notiz nicht gefunden.", ephemeral: true });

            note.note = newText;
            await note.save();

            return interaction.reply({
                content: `> \`✏️\` Notiz **${noteId}** bearbeitet.`,
                ephemeral: true
            });
        }

        // ---------------- NOTE DELETE ----------------
        if (sub === "note-delete") {
            if (!hasModPerm)
                return interaction.reply({ content: "> `❌` Keine Berechtigung.", ephemeral: true });

            const noteId = interaction.options.getString("noteid");

            const deleted = await Note.findOneAndDelete({
                _id: noteId,
                guildId: interaction.guild.id
            }).catch(() => null);

            if (!deleted)
                return interaction.reply({ content: "> `❌` Notiz nicht gefunden.", ephemeral: true });

            return interaction.reply({
                content: `> \`🗑️\` Notiz **${noteId}** gelöscht.`,
                ephemeral: true
            });
        }

        // ---------------- NOTE CLEAR ----------------
        if (sub === "note-clear") {
            if (!hasModPerm)
                return interaction.reply({ content: "> `❌` Keine Berechtigung.", ephemeral: true });

            const user = interaction.options.getUser("user");

            await Note.deleteMany({
                userId: user.id,
                guildId: interaction.guild.id
            });

            return interaction.reply({
                content: `> \`🗑️\` Alle Notizen für **${user.username}** gelöscht.`,
                ephemeral: true
            });
        }

        // ---------------- INFO ----------------
        if (sub === "info") {
            const user = interaction.options.getUser("user");
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}>`;
            const joinedAt = member?.joinedTimestamp
                ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>`
                : '`Nicht auf dem Server`';

            const [timeouts, warns, notes] = await Promise.all([
                Timeout.countDocuments({ userId: user.id, guildId: interaction.guild.id }),
                Warn.countDocuments({ userId: user.id, guildId: interaction.guild.id }),
                Note.find({ userId: user.id, guildId: interaction.guild.id })
                    .sort({ createdAt: -1 })
                    .limit(5)
            ]);

            const banData = await getBanStatus(interaction, user.id, member);

            const noteText = notes.length
                ? notes.map(n =>
                    `• \`${n.note}\`\n  ├ ID: \`${n._id}\`\n  └ <@${n.authorId}> • <t:${Math.floor(n.createdAt.getTime() / 1000)}:R>`
                ).join("\n")
                : "`Keine Notizen vorhanden`";

            const embed = new EmbedBuilder()
                .setColor(banData.banned ? 0xED4245 : 0x57F287)
                .setTitle(`👤 Userinfo — ${member?.displayName || user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setDescription(
                    `**📌 Benutzer**\n` +
                    `> Name: \`${user.username}\`\n` +
                    `> ID: \`${user.id}\`\n\n` +
                    `**⏰ Zeiten**\n` +
                    `> Erstellt: ${createdAt}\n` +
                    `> Beigetreten: ${joinedAt}\n\n` +
                    `**👮 Moderation**\n` +
                    `> Bann: ${banData.banned ? '`🔴` Gebannt' : '`🟢` Nicht gebannt'}\n` +
                    `> Timeouts: \`${timeouts}\`\n` +
                    `> Warnungen: \`${warns}\`\n\n` +
                    `**📝 Notizen**\n${noteText}`
                )
                .setFooter({ text: `${interaction.guild.name} | Userinfo` })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        }
    }
};

// ---------------- BAN STATUS ----------------
async function getBanStatus(interaction, userId, member) {
    try {
        const dbBan = await bandb.findOne({ userId });
        if (dbBan) return { banned: true };

        const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
        if (ban) return { banned: true };

        if (member?.roles.cache.has(BANNED_ROLE_ID))
            return { banned: true };

    } catch (e) {
        console.error(e);
    }
    return { banned: false };
}

