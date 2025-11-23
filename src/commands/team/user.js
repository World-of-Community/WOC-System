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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user')
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)

        // /user info <user>
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

        // /user find <id>
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

        // /user list
        .addSubcommand(sub =>
            sub
                .setName("list")
                .setDescription("» Zeigt alle Server-Mitglieder an (20 pro Seite).")
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // -------------------------------------------------------------
        // /user list — LISTE ALLE USER MIT PAGINATION
        // -------------------------------------------------------------
        if (sub === "list") {
            const members = await interaction.guild.members.fetch();
            const allUsers = [...members.values()];

            if (allUsers.length === 0) {
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
                        users
                            .map(
                                (m, i) =>
                                    `**${start + i + 1}.** ${m.user.username} — \`${m.user.id}\``
                            )
                            .join("\n")
                    )
                    .setFooter({ text: `${allUsers.length} Mitglieder insgesamt` })
                    .setTimestamp();
            };

            const row = (page) =>
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("prevPage")
                        .setLabel("⬅️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === 0),

                    new ButtonBuilder()
                        .setCustomId("nextPage")
                        .setLabel("➡️")
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page === maxPage - 1)
                );

            const msg = await interaction.reply({
                embeds: [generateEmbed(page)],
                components: [row(page)],
                ephemeral: true,
                fetchReply: true,
            });

            // Collector für Buttons
            const collector = msg.createMessageComponentCollector({
                time: 1000 * 60 * 2, // 2 Minuten
            });

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
                if (msg.editable) {
                    msg.edit({ components: [] }).catch(() => {});
                }
            });

            return;
        }

        // -------------------------------------------------------------
        // /user info — Dein alter Code
        // -------------------------------------------------------------
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

                return interaction.reply({ embeds: [embed], ephemeral: true });

            } catch (error) {
                console.error('Fehler:', error);
                return interaction.reply({
                    content: '> `❌` Fehler beim Abrufen der Benutzerdaten.',
                    ephemeral: true
                });
            }
        }

        // -------------------------------------------------------------
        // /user find — Dein alter Code
        // -------------------------------------------------------------
        if (sub === "find") {
            const id = interaction.options.getString("id");

            const user = await interaction.client.users.fetch(id).catch(() => null);

            if (!user) {
                return interaction.reply({
                    content: "> `❌` Kein User mit dieser ID gefunden.",
                    ephemeral: true
                });
            }

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
                            ? `\`✅\` Auf dem Server\nNickname: ${user.displayName}`
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

/**
 * Bann-Check
 */
async function getBanStatus(interaction, userId, member) {
    try {
        const userData = await bandb.findOne({ userId });
        if (userData) return { banned: true, reason: userData.reason?.trim() || 'Keine Angabe' };

        const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);
        if (banInfo) return { banned: true, reason: banInfo.reason?.trim() || 'Keine Angabe' };

        if (member?.roles.cache.has(BANNED_ROLE_ID)) {
            return { banned: true, reason: 'Keine Angabe' };
        }
    } catch (err) {
        console.error('Fehler beim Banncheck:', err);
    }

    return { banned: false, reason: 'Nicht gebannt' };
}
