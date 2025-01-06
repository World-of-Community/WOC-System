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
            // Check if the user is banned
            const banList = await interaction.guild.bans.fetch();
            const isBanned = banList.has(user.id);

            if (!isBanned) {
                return interaction.reply({ content: `> \`❌\` » ${user} (${user.username} - ${user.displayName}) ist nicht gebannt.`, ephemeral: true });
            }

            // Unban the user
            await interaction.guild.members.unban(user.id, reason);

            // Embed for unban log
            const unbanLogEmbed = new EmbedBuilder()
                .setTitle(`\`✅\` - ${user.tag} wurde entbannt.`)
                .setDescription(`${user} wurde von ${interaction.user} entbannt.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n> Entbannungs-Grund: \`${reason}\`\n> Benutzername: **${user.username}** (\`${user.id}\`) (${user})`)
                .setThumbnail(user.displayAvatarURL({ dynamic: true, format: 'png' }))
                .setColor('Green')
                .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: interaction.guild.iconURL() });

            // Log to channel
            const logChannel = interaction.guild.channels.cache.get("1263436406655680513");
            const thread = logChannel.threads.cache.get("1269998219266490538");
            if (thread) {
                await thread.send({ embeds: [unbanLogEmbed] });
            }

            // Confirm unban to the command issuer
            await interaction.reply({ content: `> \`✅\` » Du hast ${user.displayName} erfolgreich entbannt.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: `> \`❌\` » Fehler beim Entbannen von ${user.displayName}.`, ephemeral: true });
        }
    }
};
