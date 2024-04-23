const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('» Erhalte paar Informationen über den Server. ❓'),
        
    async execute(interaction) {
        const serverEmbed = new EmbedBuilder()
            .setTitle('Unsere Server Information')
            .setDescription(`Information zum Discord Server\n> \`⏰\` » Server Erstellt: \`01.03.2021\`\n> \`👥\` » **Mitglieder:** \`${interaction.guild.memberCount}\`\n\n> <a:nitro:1186636151335944283> » **Server Boosts:** ${interaction.guild.premiumSubscriptionCount}`)
            .setColor('Grey')
            .setFooter({ text: `${interaction.guild.name} | Server Information`, iconURL: interaction.guild.iconURL({ dynamic: true }) });

        interaction.reply({ embeds: [serverEmbed], ephemeral: true });
    }
}