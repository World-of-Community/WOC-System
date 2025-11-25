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
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        .addSubcommand(sub =>
            sub
                .setName("info")
                .setDescription("» Zeigt Informationen über einen User an.")
                .addUserOption(option =>
                    option.setName("user")
                        .setDescription("» Wähle einen User aus.")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("find")
                .setDescription("» Suche einen User über eine ID.")
                .addStringOption(option =>
                    option.setName("id")
                        .setDescription("» Die ID des Users.")
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("» Zeigt alle Server-Mitglieder an (20 pro Seite).")
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // ------------------- LIST -------------------
        if (sub === "list") {
            const members = await interaction.guild.members.fetch();
            const allUsers = [...members.values()];

            if (!allUsers.length) {
                return interaction.reply({
                    content: "> `❌` Keine User gefunden.",
                    ephemeral: true,
                });
            }

            let page = 0;
            const perPage = 20;
            const maxPage = Math.ceil(allUsers.length / perPage);

            const generateEmbed = (page) => {
                const start = page * perPage;
                const end = start + perPage;
                const users = allUsers.slice(start, end);

                return new EmbedBuilder()
                    .setColor('Blurple')
                    .setTitle(`\`📋\` Mitgliederliste — Seite ${page + 1}/${maxPage}`)
                    .setDescription(
                        users.map(u => {
                            const highestRole = u.roles.cache
                                .filter(r => RoleIds.includes(r.id))
                                .sort((a, b) => b.position - a.position)
                                .first();
                            const roleMention = highestRole ? `<@&${highestRole.id}>` : '';
                            return `${roleMention} ${u} (${u.user.username}) - \`${u.user.id}\``;
                        }).join("\n")
                    )
                    .setFooter({ text: `${allUsers.length} Mitglieder insgesamt` })
                    .setTimestamp();
            };

            const row = (page) =>
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prevPage")
                        .setLabel("⬅️ Vorige Seite")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),
                    new ButtonBuilder()
                        .setCustomId("nextPage")
                        .setLabel("➡️ Nächste Seite")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === maxPage - 1)
                );

            const msg = await interaction.reply({
                embeds: [generateEmbed(page)],
                components: [row(page)],
                ephemeral: true,
                fetchReply: true,
            });

            const collector = msg.createMessageComponentCollector({ });

            collector.on("collect", async (btn) => {
                if (btn.user.id !== interaction.user.id) {
                    return btn.reply({ content: "> `❌` Das ist nicht dein Menü.", ephemeral: true });
                }

                if (btn.customId === "prevPage" && page > 0) page--;
                else if (btn.customId === "nextPage" && page < maxPage - 1) page++;

                await btn.update({
                    embeds: [generateEmbed(page)],
                    components: [row(page)],
                });
            });

            collector.on("end", async () => {
                if (msg.editable) msg.edit({ components: [] }).catch(() => { });
            });

            return;
        }

        // ------------------- INFO -------------------
        if (sub === "info") {
            const user = interaction.options.getUser('user');

            try {
                const member = await interaction.guild.members.fetch(user.id).catch(() => null);

                const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}>`;
                const joinedAt = member?.joinedTimestamp
                    ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>`
                    : '`Nicht auf dem Server`';

                const banData = await getBanStatus(interaction, user.id, member);

                const [timeoutCount, warnCount] = await Promise.all([
                    Timeout.countDocuments({ userId: user.id, guildId: interaction.guild.id }).catch(() => 0),
                    Warn.countDocuments({ userId: user.id, guildId: interaction.guild.id }).catch(() => 0)
                ]);

                const banColor = banData.banned ? 0xED4245 : 0x57F287;
                const banEmoji = banData.banned ? '`🔴`' : '`🟢`';

                const embed = new EmbedBuilder()
                    .setTitle(`\`👤\` Informationen über ${member?.displayName || user.username}`)
                    .setColor(banColor)
                    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                    .setDescription(
                        `**\`📌\` Benutzerinformationen**\n` +
                        `> \`👤\` Benutzername: \`${user.username}\`\n` +
                        `> \`🆔\` Benutzer-ID: \`${user.id}\`\n` +
                        `> \`🏷️\` Anzeigename: \`${member?.displayName || 'Nicht auf dem Server'}\`\n\n` +
                        `**\`⏰\` Mitglied Seit**\n` +
                        `> \`📅\` Erstellt: ${createdAt}\n` +
                        `> \`📅\` Beigetreten: ${joinedAt}\n\n` +
                        `**\`👮\` Moderation**\n` +
                        `> \`⛔\` Bannstatus: ${banEmoji} ${banData.banned ? '**Gebannt**' : 'Nicht gebannt'}\n` +
                        (banData.banned ? `> \`📄\` Grund: \`${banData.reason}\`\n` : '') +
                        `> \`🔇\` Timeouts: \`${timeoutCount}\`\n` +
                        `> \`❗\` Warnungen: \`${warnCount}\``
                    )
                    .setFooter({ text: `${interaction.guild.name} | Userinfo`, iconURL: interaction.guild.iconURL() || user.displayAvatarURL() })
                    .setTimestamp();

                // BUTTON FÜR STRAFEN
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`showPunishments_${user.id}`)
                        .setLabel("⚠️ Strafen anzeigen")
                        .setStyle(ButtonStyle.Danger)
                );

                const msg = await interaction.reply({
                    embeds: [embed],
                    components: [row],
                    ephemeral: true,
                    fetchReply: true
                });

                const collector = msg.createMessageComponentCollector({ time: 60 * 1000 });

                collector.on("collect", async btn => {
                    if (btn.user.id !== interaction.user.id)
                        return btn.reply({ content: "> `❌` Das ist nicht dein Menü.", ephemeral: true });

                    if (btn.customId !== `showPunishments_${user.id}`) return;

                    const timeouts = await Timeout.find({ userId: user.id, guildId: interaction.guild.id }).sort({ createdAt: -1 });
                    const warns = await Warn.find({ userId: user.id, guildId: interaction.guild.id }).sort({ createdAt: -1 });

                    const format = (date) => `<t:${Math.floor(date.getTime() / 1000)}:F>`;

                    const warnText = warns.length > 0
                        ? warns.map(w => `• **Grund:** \`${w.reason}\`\n  **Zeit:** ${format(w.createdAt)}`).join("\n\n")
                        : "`Keine Warnungen vorhanden`";

                    const timeoutText = timeouts.length > 0
                        ? timeouts.map(t => `• **Grund:** \`${t.reason}\`\n  **Zeit:** ${format(t.createdAt)}`).join("\n\n")
                        : "`Keine Timeouts vorhanden`";

                    const punishEmbed = new EmbedBuilder()
                        .setTitle(`⚠️ Strafen — ${user.username}`)
                        .setColor("Red")
                        .addFields(
                            { name: "❗ Warnungen", value: warnText },
                            { name: "🔇 Timeouts", value: timeoutText }
                        )
                        .setTimestamp();

                    return btn.reply({
                        embeds: [punishEmbed],
                        ephemeral: true
                    });
                });

                return;

            } catch (error) {
                console.error('Fehler:', error);
                return interaction.reply({
                    content: '> `❌` Fehler beim Abrufen der Benutzerdaten.',
                    ephemeral: true
                });
            }
        }

        // ------------------- FIND -------------------
        if (sub === "find") {
            const id = interaction.options.getString("id");
            const user = await interaction.client.users.fetch(id).catch(() => null);
            if (!user) return interaction.reply({ content: "> `❌` Kein User mit dieser ID gefunden.", ephemeral: true });
            const member = await interaction.guild.members.fetch(id).catch(() => null);
            const embed = new EmbedBuilder()
                .setColor('Blurple')
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
                        inline: false
                    },
                    {
                        name: "`📅` Account erstellt",
                        value: `<t:${Math.floor(user.createdTimestamp / 1000)}>`,
                        inline: false
                    },
                    {
                        name: "`📅` Server beigetreten",
                        value: member?.joinedTimestamp
                            ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>`
                            : "`Nicht auf dem Server`",
                        inline: false
                    }
                )
                .setTimestamp();
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
};

// ------------------- BAN STATUS HELPER -------------------
async function getBanStatus(interaction, userId, member) {
    try {
        const userData = await bandb.findOne({ userId });
        if (userData) return { banned: true, reason: userData.reason?.trim() || 'Keine Angabe' };
        const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);
        if (banInfo) return { banned: true, reason: banInfo.reason?.trim() || 'Keine Angabe' };
        if (member?.roles.cache.has(BANNED_ROLE_ID)) return { banned: true, reason: 'Keine Angabe' };
    } catch (err) {
        console.error('Fehler beim Banncheck:', err);
    }
    return { banned: false, reason: 'Nicht gebannt' };
}
