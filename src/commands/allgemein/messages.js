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

        let messageCount;
        try {
            messageCount = await getMessageCount(member.id);  // Make sure to await the result of getMessageCount
        } catch (error) {
            console.error(error); // Log any potential errors for debugging
            return interaction.reply({ content: "> `❌` » Fehler beim Abrufen der Nachrichtenanzahl!", ephemeral: true });
        }

        // If no message count is found, default to 0
        messageCount = messageCount || 0;

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

// Function to simulate fetching the message count from a database or other source
async function getMessageCount(memberId) {
    // Replace this mock logic with actual code to fetch data from your database or logging system
    return 123; // Returning a mock number for demonstration
}