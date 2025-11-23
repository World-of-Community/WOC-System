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

        // /userinfo info <user>
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

        // /userinfo find <id>
        .addSubcommand(sub =>
            sub
                .setName("find")
                .setDescription("» Suche einen User über eine ID.")
                .addStringOption(option =>
                    option.setName("id")
                        .setDescription("» Die ID des Users.")
                        .setRequired(true)
                )
        ),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // ---------------------------------------------------
        // /userinfo info <user> — dein alter Code unverändert
        // ---------------------------------------------------
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

                const components = banData.banned ? [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`editBanReason_${user.id}`)
                            .setLabel('📝 Ban-Grund ändern')
                            .setStyle(ButtonStyle.Secondary)
                    )
                ] : [];

                return interaction.reply({ embeds: [embed], components, ephemeral: true });

            } catch (error) {
                console.error('Fehler beim Abrufen der Benutzerdaten:', error);
                return interaction.reply({
                    content: '> `❌` » Ein Fehler ist beim Abrufen der Benutzerdaten aufgetreten.',
                    ephemeral: true
                });
            }
        }

        // -----------------------------------------------
        // /userinfo find <id> — dein alter userfind Code
        // -----------------------------------------------
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
                            ? `\`✅\` Auf dem Server\nNickname: \`${member.displayName}\``
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
                .setFooter({ text: "Userfind" })
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
        if (userData) {
            return { banned: true, reason: userData.reason?.trim() || 'Keine Angabe' };
        }

        const banInfo = await interaction.guild.bans.fetch(userId).catch(() => null);
        if (banInfo) {
            return { banned: true, reason: banInfo.reason?.trim() || 'Keine Angabe' };
        }

        if (member?.roles.cache.has(BANNED_ROLE_ID)) {
            return { banned: true, reason: 'Keine Angabe' };
        }
    } catch (err) {
        console.error('Fehler beim Banncheck:', err);
    }

    return { banned: false, reason: 'Nicht gebannt' };
}
