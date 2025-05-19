const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
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
            const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}>`;
            const joinedAt = member?.joinedTimestamp
                ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>`
                : '`Nicht auf dem Server`';

            // ⛔ Bann-Status prüfen
            const banData = await getBanStatus(interaction, user.id, member);

            // 📊 Moderationsdaten abrufen
            const [timeoutCount, warnCount] = await Promise.all([
                Timeout.countDocuments({ userId: user.id, guildId: interaction.guild.id }),
                Warn.countDocuments({ userId: user.id, guildId: interaction.guild.id })
            ]);

            // 🟢 oder 🔴 Statusfarbe + Emoji
            const banColor = banData.banned ? 0xED4245 : 0x57F287;
            const banEmoji = banData.banned ? '`🔴`' : '`🟢`';

            // 📎 Embed aufbauen
            const embed = new EmbedBuilder()
                .setTitle(`\`👤\` Informationen über ${member?.displayName || user.username}`)
                .setColor(banColor)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setDescription(
                    `**\`📌\` Benutzerinformationen**\n` +
                    `> \`👤\` » Benutzername: \`${user.username}\`\n` +
                    `> \`🆔\` » Benutzer-ID: \`${user.id}\`\n` +
                    `> \`🏷️\` » Anzeigename: \`${member?.displayName || 'Nicht auf dem Server'}\`\n\n` +
                    `**\`⏰\` Mitglied Seit**\n` +
                    `> \`📅\` » Erstellt: ${createdAt}\n` +
                    `> \`📅\` » Beigetreten: ${joinedAt}\n\n` +
                    `**\`🔒\` Moderation**\n` +
                    `> \`⛔\` » Bannstatus: ${banEmoji} ${banData.banned ? '**Gebannt**' : 'Nicht gebannt'}\n` +
                    `${banData.banned ? `> \`📄\` » Grund: \`${banData.reason}\`\n` : ''}` +
                    `> \`🔇\` » Timeouts: \`${timeoutCount || 0}\`\n` +
                    `> \`❗\` » Warnungen: \`${warnCount || 0}\``
                )
                .setFooter({ text: `${interaction.guild.name} | Userinfo`, iconURL: interaction.guild.iconURL() || user.displayAvatarURL() })
                .setTimestamp();

            // 🎛️ Komponenten (Button nur bei Bann)
            const components = banData.banned ? [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`editBanReason_${user.id}`)
                        .setLabel('📝 Ban-Grund ändern')
                        .setStyle(ButtonStyle.Secondary)
                )
            ] : [];

            // ✅ Antwort senden
            await interaction.reply({ embeds: [embed], components, ephemeral: true });

        } catch (err) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', err);
            await interaction.reply({
                content: '> `❌` » Ein Fehler ist aufgetreten beim Abrufen der Benutzerdaten.',
                ephemeral: true
            });
        }
    }
};

// 🔍 Bannstatus prüfen (DB & Discord)
async function getBanStatus(interaction, userId, member) {
    try {
        const userData = await bandb.findOne({ userId });

        if (userData?.ban) {
            return {
                banned: true,
                reason: userData.ban.reason || 'Keine Angabe'
            };
        }

        // Prüfen, ob User per Discord-Ban gebannt ist
        const banInfo = await interaction.guild.bans.fetch(userId).catch(err => {
            if (err.code !== 10026) console.error('Bann-Fehler:', err);
            return null;
        });

        if (banInfo) {
            return {
                banned: true,
                reason: banInfo.reason || 'Keine Angabe'
            };
        }

        // Rolle prüfen, wenn keine Ban-Daten gefunden
        if (member?.roles.cache.has(BANNED_ROLE_ID)) {
            return {
                banned: true,
                reason: 'Keine Angabe'
            };
        }

    } catch (err) {
        console.error('Fehler beim Banncheck:', err);
    }

    return {
        banned: false,
        reason: 'Nicht gebannt'
    };
}
