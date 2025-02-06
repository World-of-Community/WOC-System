const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const Timeout = require('../../../Datenbank/timeoutdb');
const Warn = require('../../../Datenbank/warndb');
const bandb = require('../../../Datenbank/bandb'); // Stelle sicher, dass dies die richtige Datenbank ist

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .addUserOption(option => option.setName("user").setDescription("» Wähle einen User aus").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const user = interaction.options.getUser('user');

        try {
            //const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            const createdAt = `<t:${Math.round(user.createdTimestamp / 1000)}>`;
            const joinedAt = member?.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : 'N/A';

            // ID der "Gebannt"-Rolle eintragen
            const BANNED_ROLE_ID = "886989738244964362";
            
            // Überprüfung, ob der User in der Datenbank gebannt ist
            const userData = await bandb.findOne({ userId: user.id });
            
            let banned = false;
            let banReason = 'Nicht gebannt';
            
            // Falls Bann in der DB gespeichert ist
            if (userData?.ban) {
                banned = true;
                banReason = userData.ban.reason || 'Keine Angabe';
            } else {
                try {
                    // Überprüfung, ob der User per Discord-Ban gebannt ist
                    const banInfo = await interaction.guild.bans.fetch(user.id);
                    if (banInfo) {
                        banned = true;
                        banReason = banInfo.reason || 'Keine Angabe';
                    }
                } catch (err) {
                    if (err.code !== 10026) { // Fehler 10026 ignorieren (User nicht gebannt)
                        console.error('Fehler beim Abrufen der Bann-Informationen:', err);
                    }
                }
            }
            
            // Überprüfung, ob der User die "Gebannt"-Rolle hat
            const member = await interaction.guild.members.fetch(user.id).catch(() => null);
            if (member?.roles.cache.has(BANNED_ROLE_ID)) {
                banned = true;
                banReason = '';
            }


            const timeoutCount = await Timeout.countDocuments({ userId: user.id, guildId: interaction.guild.id }) || 0;
            const warnCount = await Warn.countDocuments({ userId: user.id, guildId: interaction.guild.id }) || 0;

            const userEmbed = new EmbedBuilder()
                .setTitle(`\`👤\` | Informationen über \`${member?.displayName || user.username}\``)
                .setDescription(`
                    **Account Informationen**
                    > \`📌\` » Benutzername: ${user.username} (\`${user.id}\`)
                    > \`📌\` » Anzeigename: ${member?.displayName || 'N/A'}
                    
                    > \`⏰\` » Account erstellt am: ${createdAt}
                    > \`⏰\` » Beigetreten am: ${joinedAt}

                    **Server Informationen**
                    > \`⛔\` » Gebannt: ${banned ? '**Ja** (`❗`)' : '**Nein** (`✅`)'}${banned ? ` (Grund: \`${banReason}\`)` : ''}
                    > \`🔇\` » Timeouts: \`${timeoutCount}\`
                    > \`❗\` » Warnungen: \`${warnCount}\`
                `)
                .setColor('Blurple')
                .setThumbnail(user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
                .setFooter({ text: `${interaction.guild.name} | User Information`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [userEmbed], ephemeral: true });

        } catch (err) {
            console.error('Fehler beim Abrufen der Benutzerdaten:', err);
            await interaction.reply({ content: 'Ein Fehler ist aufgetreten beim Abrufen der Benutzerdaten.', ephemeral: true });
        }
    }
};
