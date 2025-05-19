const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

const Timeout = require('../../../Datenbank/timeoutdb');
const Warn = require('../../../Datenbank/warndb');
const bandb = require('../../../Datenbank/bandb');

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

            const BANNED_ROLE_ID = "886989738244964362";

            let banned = false;
            let banReason = 'Nicht gebannt';

            const userData = await bandb.findOne({ userId: user.id });

            if (userData?.ban) {
                banned = true;
                banReason = userData.ban.reason || 'Keine Angabe';
            } else {
                try {
                    const banInfo = await interaction.guild.bans.fetch(user.id);
                    if (banInfo) {
                        banned = true;
                        banReason = banInfo.reason || 'Keine Angabe';
                    }
                } catch (err) {
                    if (err.code !== 10026) {
                        console.error('Fehler beim Abrufen der Bann-Informationen:', err);
                    }
                }
            }

            if (member?.roles.cache.has(BANNED_ROLE_ID)) {
                banned = true;
                if (banReason === 'Nicht gebannt') banReason = `${banReason}`;
            }

            const banColor = banned ? 0xED4245 : 0x57F287;
            const banEmoji = banned ? '`🔴`' : '`🟢`';

            const timeoutCount = await Timeout.countDocuments({ userId: user.id, guildId: interaction.guild.id }) || 0;
            const warnCount = await Warn.countDocuments({ userId: user.id, guildId: interaction.guild.id }) || 0;

            const embed = new EmbedBuilder()
                .setTitle(`\`👤\` Informationen über ${member?.displayName || user.username}`)
                .setColor(banColor)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setDescription(`**\`📌\` Benutzerinformationen**\n> \`👤\` » Benutzername: \`${user.username}\`\n> \`🆔\` » Benutzer-ID: \`${user.id}\`\n> \`🏷️\` » Anzeigename: \`${member?.displayName || 'Nicht auf dem Server'}\`\n\n**\`⏰\` Mitglied Seit**\n> \`📅\` » Erstellt: ${createdAt}\n> \`📅\` » Beigetreten: ${joinedAt}\n\n**\`🔒\` Moderation**\n> \`⛔\` » Bannstatus: ${banEmoji} ${banned ? '**Gebannt**' : 'Nicht gebannt'}\n${banned ? `> \`📄\` » Grund: \`${banReason}\`` : ''}\n> \`🔇\` » Timeouts: \`${timeoutCount}\`\n> \`❗\` » Warnungen: \`${warnCount}\``)
                .setFooter({ text: `${interaction.guild.name} | Userinfo`, iconURL: interaction.guild.iconURL() || user.displayAvatarURL() })
                .setTimestamp();

            const components = [];

            if (banned) {
                const button = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`editBanReason_${user.id}`)
                        .setLabel('📝 Ban-Grund ändern')
                        .setStyle(ButtonStyle.Secondary)
                );
                components.push(button);
            }

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
