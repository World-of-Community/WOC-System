const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('user-info')
        .setDescription('» Rufe Informationen über einen User ab. 👤')
        .addUserOption(option => option.setName("user").setDescription("» Wähle einen User aus").setRequired(true)),

    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        const createdAt = `<t:${Math.round(user.createdTimestamp / 1000)}>`;
        const joinedAt = member.joinedTimestamp ? `<t:${Math.round(member.joinedTimestamp / 1000)}>` : 'N/A';

        const userEmbed = new EmbedBuilder()
            .setTitle(`\`👤\` | Informationen über \`${member.displayName}\``)
            .setDescription(`> - » Benutzername: ${user.username} (\`${user.id}\`)\n> - » Anzeigename: ${member.displayName}\n> - » Account erstellt am: ${createdAt}\n> - » Beigetreten am: ${joinedAt}`)
            .setColor('Blurple')
            .setThumbnail(user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
            .setFooter({ text: `${interaction.guild.name} | User Information`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        interaction.reply({ embeds: [userEmbed], ephemeral: true });
    }
}