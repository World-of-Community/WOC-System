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
        .setName('userinfo')
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .addUserOption(option =>
            option.setName("user")
                .setDescription("» Wähle einen User aus")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const user = interaction.options.getUser('user');

        try {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);

            // Zeitstempel formatieren
            const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}>`;
            const joinedAt = member?.joinedTimestamp
                ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>`
                : '`Nicht auf dem Server`';

            // Ban-Status und Grund ermitteln
            const banData = await getBanStatus(interaction, user.id, member);

            // Anzahl Timeouts und Warnungen (0 als Fallback)
            const [timeoutCount, warnCount] = await Promise.all([
                Timeout.countDocuments({ userId: user.id, guildId: interaction.guild.id }).catch(() => 0),
                Warn.countDocuments({ userId: user.id, guildId: interaction.guild.id }).catch(() => 0)
            ]);

            // Embed-Farben und Emoji je nach Ban-Status
            const banColor = banData.banned ? 0xED4245 : 0x57F287;
            const banEmoji = banData.banned ? '`🔴`' : '`🟢`';

            // Embed bauen
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

            // Button nur wenn gebannt (optional, falls du das möchtest)
            const components = banData.banned ? [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`editBanReason_${user.id}`)
                        .setLabel('📝 Ban-Grund ändern')
                        .setStyle(ButtonStyle.Secondary)
                )
            ] : [];

            await interaction.reply({ embeds: [embed], components, ephemeral: true });

        } catch (error) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', error);
            await interaction.reply({
                content: '> `❌` » Ein Fehler ist beim Abrufen der Benutzerdaten aufgetreten.',
                ephemeral: true
            });
        }
    }
};

// Funktion zur Ermittlung des Ban-Status & Ban-Grunds
async function getBanStatus(interaction, userId, member) {
    try {
        // Datenbank-Check
        const userData = await bandb.findOne({ userId: userId });
        if (userData?.ban) {
            return {
                banned: true,
                reason: userData.ban.reason?.trim() || 'Keine Angabe',
            };
        }

        // Server-Ban-Check
        const banInfo = await interaction.guild.bans.fetch(userId).catch(err => {
            if (err.code !== 10026) console.error('Bann-Fehler:', err);
            return null;
        });
        if (banInfo) {
            return {
                banned: true,
                reason: banInfo.reason?.trim() || 'Keine Angabe',
            };
        }

        // Check ob User Rolle "Banned" hat
        if (member?.roles.cache.has(BANNED_ROLE_ID)) {
            return {
                banned: true,
                reason: 'Keine Angabe',
            };
        }
    } catch (err) {
        console.error('Fehler beim Banncheck:', err);
    }

    return {
        banned: false,
        reason: 'Nicht gebannt',
    };
}
