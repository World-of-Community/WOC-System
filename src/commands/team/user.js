const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

const Timeout = require('../../../Datenbank/timeoutdb');
const Warn = require('../../../Datenbank/warndb');
const bandb = require('../../../Datenbank/bandb');
const Note = require('../../../Datenbank/notedb');

const BANNED_ROLE_ID = "886989738244964362";

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
                .addStringOption(o => o.setName("text").setDescription("Notiz").setRequired(true))
        )

        // NOTE CLEAR
        .addSubcommand(sub =>
            sub.setName("note-clear")
                .setDescription("» Löscht alle Notizen")
                .addUserOption(o => o.setName("user").setRequired(true))
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // ---------------- NOTE ADD ----------------
        if (sub === "note-add") {
            const user = interaction.options.getUser("user");
            const text = interaction.options.getString("text");

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

        // ---------------- NOTE CLEAR ----------------
        if (sub === "note-clear") {
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
                    .limit(3)
            ]);

            const banData = await getBanStatus(interaction, user.id, member);

            const noteText = notes.length
                ? notes.map(n =>
                    `• \`${n.note}\`\n  └ <@${n.authorId}> • <t:${Math.floor(n.createdAt.getTime() / 1000)}:R>`
                ).join("\n")
                : "`Keine Notizen vorhanden`";

            const embed = new EmbedBuilder()
                .setColor(banData.banned ? 0xED4245 : 0x57F287)
                .setTitle(`\`👤\` Userinfo — ${member?.displayName || user.username}`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setDescription(
                    `**\`📌\` Benutzer**\n` +
                    `> \`👤\` Name: \`${user.username}\`\n` +
                    `> \`🆔\` ID: \`${user.id}\`\n\n` +
                    `**\`⏰\` Zeiten**\n` +
                    `> Erstellt: ${createdAt}\n` +
                    `> Beigetreten: ${joinedAt}\n\n` +
                    `**\`👮\` Moderation**\n` +
                    `> Bann: ${banData.banned ? '`🔴` **Gebannt**' : '`🟢` Nicht gebannt'}\n` +
                    `> Timeouts: \`${timeouts}\`\n` +
                    `> Warnungen: \`${warns}\`\n\n` +
                    `**\`📝\` Notizen**\n${noteText}`
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
        if (dbBan) return { banned: true, reason: dbBan.reason || 'Keine Angabe' };

        const ban = await interaction.guild.bans.fetch(userId).catch(() => null);
        if (ban) return { banned: true, reason: ban.reason || 'Keine Angabe' };

        if (member?.roles.cache.has(BANNED_ROLE_ID))
            return { banned: true, reason: 'Rolle' };

    } catch (e) {
        console.error(e);
    }
    return { banned: false };
}
