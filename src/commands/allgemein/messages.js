const { Client, EmbedBuilder, SlashCommandBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('messages')
        .setDescription('» Zeigt an, wieviel jemand gechattet hat. ✍️')
        .addUserOption(option => option.setName('mitglied').setDescription('» Welches Profil möchtest du Abrufen?').setRequired(false)),
        
    async execute(interaction) {
        const member = await interaction.options.getMember('mitglied') || interaction.member

        if (member.user.bot) {
            return interaction.reply({ content: "> \`❌\` » Du kannst keine Statistiken über Bots abrufen!", ephemeral: true });
        }

        const messageCount = await getMessageCount(member.id);

        const MessageEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${member.user.displayName}'s Nachrichten`)
        .setDescription(`<a:Chat1:976129450112593990> » ${member} hat \`${messageCount || 0}\` Nachrichten geschrieben.`)
        .setColor('Blurple')
        .setThumbnail(`${member.user.displayAvatarURL({ dynamic: true })}`)
        .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
        .setTimestamp();

        await interaction.reply({ embeds: [MessageEmbed], ephemeral: true })
    }
}