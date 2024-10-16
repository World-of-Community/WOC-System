const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const Timeout = require('../../../Datenbank/timeoutdb');
const Warn = require('../../../Datenbank/warndb');
const bandb = require('../../../Datenbank/bandb'); // Stelle sicher, dass dies korrekt importiert ist

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .addUserOption(option => option.setName("user").setDescription("» Wähle einen User aus").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        
        const user = interaction.options.getUser('user');

        try {
            const member = await interaction.guild.members.fetch(user.id).catch(() => null); // Handle if the user is not in the guild
            const createdAt = `<t:${Math.round(user.createdTimestamp / 1000)}>`;
            const joinedAt = member?.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : 'N/A';

            // Check if the user is banned
            let banned = false;
            let banReason = 'Nicht gebannt';

            try {
                const banInfo = await interaction.guild.bans.fetch(user.id);
                if (banInfo) {
                    banned = true;
                    banReason = banInfo.reason || 'Keine Angabe';
                }
            } catch (err) {
                console.log('Benutzer nicht gebannt oder kein Bann gefunden.');
            }

            const timeouts = await Timeout.find({ userId: user.id, guildId: interaction.guild.id });
            const timeoutCount = timeouts.length || 0;

            const warns = await Warn.find({ userId: user.id, guildId: interaction.guild.id });
            const warnCount = warns.length || 0;

            const userEmbed = new EmbedBuilder()
                .setTitle(`\`👤\` | Informationen über \`${member.displayName}\``)
                .setDescription(`**Account Informationen**\n> \`📌\` » Benutzername: ${user.username} (\`${user.id}\`)\n> \`📌\` » Anzeigename: ${member?.displayName || 'N/A'}\n\n> \`⏰\` » Account erstellt am: ${createdAt}\n> \`⏰\` » Beigetreten am: ${joinedAt}\n\n**Server Informationen**\n> \`⛔\` » Gebannt: ${banned ? '**Ja** (`❗`)' : '**Nein** (`✅`)'}${banned ? ` (Grund: \`${banReason}\`)` : ''}\n> \`🔇\` » Timeouts: \`${timeoutCount}\`\n> \`❗\` » Warnungen: \`${warnCount}\``)
                .setColor('Blurple')
                .setThumbnail(user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
                .setFooter({ text: `${interaction.guild.name} | User Information`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [userEmbed], ephemeral: true });
        } catch (err) {
            console.error(err);
            await interaction.reply({ content: 'Ein Fehler ist aufgetreten beim Abrufen der Benutzerdaten.', ephemeral: true });
        }
    }
}