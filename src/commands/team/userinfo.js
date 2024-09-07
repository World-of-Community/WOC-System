const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require("discord.js");
const Timeout = require('../../../Datenbank/timeoutdb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .addUserOption(option => option.setName("user").setDescription("» Wähle einen User aus").setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        const createdAt = `<t:${Math.round(user.createdTimestamp / 1000)}>`;
        const joinedAt = member.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : 'N/A';

        // Check if the user is banned
        const bans = await interaction.guild.bans.fetch();
        const banned = bans.has(user.id);
        let banReason = 'Nicht gebannt'; // Fallback für nicht gebannte Nutzer

        if (banned) {
            const banData = await bandb.findOne({ user: member.id });
            banReason = banData ? banData.reason || 'Keine Angabe' : 'Keine Angabe';
        }

        // Fetch the number of timeouts
        const timeouts = await Timeout.find({ userId: user.id, guildId: interaction.guild.id });
        const timeoutCount = timeouts.length;

        const userEmbed = new EmbedBuilder()
            .setTitle(`\`👤\` | Informationen über \`${member.displayName}\``)
            .setDescription(`**Account Informationen**\n> \`📌\` » Benutzername: ${user.username} (\`${user.id}\`)\n> \`📌\` » Anzeigename: ${member.displayName}\n\n> \`⏰\` » Account erstellt am: ${createdAt}\n> \`⏰\` » Beigetreten am: ${joinedAt}\n\n**Server Informationen**\n> \`⛔\` » Gebannt: ${banned ? '**Ja** (`❗`)' : '**Nein** (`✅`)'} (Grund: \`${banReason}\`)\n> \`🔇\` » Timeouts: \`${timeoutCount}\``)
            .setColor('Blurple')
            .setThumbnail(user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
            .setFooter({ text: `${interaction.guild.name} | User Information`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        interaction.reply({ embeds: [userEmbed], ephemeral: true });
    }
}