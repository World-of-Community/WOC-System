const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('» Erhalte paar Informationen über den Server. ❓'),
    async execute(interaction) {
        const serverEmbed = new EmbedBuilder()
            .setTitle('Unsere Server Information')
            .setDescription('Information zum Discord Server\n> `⏰` » Server Erstellt: `01.03.2021`\n\nInformation zum Minecraft Server\n> `🌍` » Server Version: `1.16.5 - 1.20.1`\n> `🔋` » Server Kapazität: `100👥`\n\nBeschreibung:\nWir bieten der Community die Spielmodi KnockbackFFA und Minigames an, es gibt viele Verschiedene und Einzigartige Spieler-Ränge...')
            .setColor('#5385ac')
            .setFooter({ text: 'World Of Community | Server Information', iconURL: interaction.guild.iconURL({ dynamic: true }) });

        interaction.reply({ embeds: [serverEmbed], ephemeral: true });

    }
}