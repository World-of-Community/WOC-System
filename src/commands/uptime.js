const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uptime')
        .setDescription('» Zeigt dir ein paar nützliche Stats an. 🧮'),
        
    async execute(interaction) {
        function formatUptime(uptime) {
            const minutes = Math.floor((uptime / 60) % 60);
            const hours = Math.floor((uptime / 3600) % 24);
            const days = Math.floor(uptime / 86400);

            return `${days}d ${hours}h ${minutes}m`;
        }
        const uptime = formatUptime(process.uptime());
        const ping = Date.now() - interaction.createdTimestamp;
        const uptimeEmbed = new EmbedBuilder()
            .setTitle('`🤖` × Interessante Bot Statistiken')
            .setDescription(`» Hier siehst du ein paar Interessante Infos, die in speziellen Fällen auch sehr nützlich sein könnten.\n\n\`🔋\` » **Online** seit \`${uptime}\`\n\`📡\` » Meine **Reaktionszeit** liegt bei: \`${ping}\`ms`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1145779055644393592/1151073428099575858/WOC_Orange.png')
            .setColor('Orange')
            .setFooter({ text: `${client.user.displayName} - Bot`, iconURL: `${interaction.client.user.displayAvatarURL()}` });
        await interaction.reply({ embeds: [uptimeEmbed], ephemeral: true });
    }
}