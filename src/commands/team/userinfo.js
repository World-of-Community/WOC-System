const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .addUserOption(option => option.setName("user").setDescription("» Wähle einen User aus").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        const createdAt = `<t:${Math.round(user.createdTimestamp / 1000)}>`;
        const joinedAt = member.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : 'N/A';

        // Check if the user is banned
        const bans = await interaction.guild.bans.fetch();
        const banned = bans.has(user.id);
        const banReason = banned ? (await interaction.guild.bans.fetch(user.id)).reason || 'Keine Angabe' : 'Nicht gebannt';

        // Fetch the number of timeouts (if applicable)
        // This is a placeholder as Discord.js doesn't track timeouts natively
        // You would need to implement your own tracking mechanism for this
        const timeouts = 0;  // Placeholder for actual timeout fetching logic

        // Placeholder for rule violations
        // You would need to implement your own tracking mechanism for rule violations
        const ruleViolations = 'Keine Regelverstöße';  // Placeholder for actual rule violation data

        const userEmbed = new EmbedBuilder()
            .setTitle(`\`👤\` | Informationen über \`${member.displayName}\``)
            .setDescription(`**Account Informationen**\n> » Benutzername: ${user.username} (\`${user.id}\`)\n> » Anzeigename: ${member.displayName}\n\n> » Account erstellt am: ${createdAt}\n> » Beigetreten am: ${joinedAt}\n\n**Server Informationen**\n> Gebannt: ${banned ? 'Ja' : 'Nein'}\n> Grund: \`${banReason}\`\n> Timeouts: \`${timeouts}\`\n> Regelverstöße: \`${ruleViolations}\``)
            .setColor('Blurple')
            .setThumbnail(user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
            .setFooter({ text: `${interaction.guild.name} | User Information`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        interaction.reply({ embeds: [userEmbed], ephemeral: true });
    }
}