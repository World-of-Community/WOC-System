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
            .setTitle('🤖 × Interessante Bot Statistiken')
            .setDescription(`» Hier siehst du ein paar Interessante Infos, die in speziellen Fällen auch sehr nützlich sein könnten.\n\n\`🔋\` » **Online** seit \`${uptime}\`\n\`📡\` » Meine **Reaktionszeit** liegt bei: \`${ping}\`ms`)
            .setThumbnail('https://cdn.discordapp.com/attachments/1269339586568388670/1269341245730459749/WOC_Orange.png?ex=66b4fba8&is=66b3aa28&hm=0c61d77ee96136f6dfe2a1b717736edc59d09666f4cea2948d3ddb13c1378ec1&')
            .setColor('Orange')
            .setFooter({ text: `${client.user.displayName} - Bot`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();
        await interaction.reply({ embeds: [uptimeEmbed], ephemeral: true });
    }
}