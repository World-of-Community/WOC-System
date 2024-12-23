const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('» Entbanne einen User. 🔓')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('» Welcher User soll entbannt werden?')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('grund')
                .setDescription('» Gebe ein Grund an.')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('grund');

        try {
            await interaction.guild.members.unban(user.id, reason);

            // Embed for unban log
            const unbanLogEmbed = new EmbedBuilder()
                .setTitle(`\`✅\` - ${user.displayName} wurde entbannt.`)
                .setDescription(`${user} wurde von ${interaction.user} entbannt.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n> Entbannungs-Grund: \`${reason}\`\n> Benutzername: **${user.username}** (\`${user.id}\`) (${user})`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, format: 'png' }))
                .setColor('Green')
                .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: interaction.guild.iconURL() });

            const logChannel = interaction.guild.channels.cache.get("1269998219266490538");
            if (logChannel) {
                await logChannel.send({ embeds: [unbanLogEmbed] });
            }

            // Confirm unban to the command issuer
            await interaction.reply({ content: `> \`✅\` » Du hast ${user.displayName} erfolgreich entbannt.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `> \`❌\` » Fehler beim Entbannen von ${user.displayName}.`, ephemeral: true });
        }
    }
};
