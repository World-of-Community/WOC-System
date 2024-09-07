const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Variables to store game state
let countingChannelId = null;
let currentCount = 0;
let lastUserId = null;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription('» Setzt den Zähl kanal. 🔢')
        .addChannelOption(option => option.setName('kanal').setDescription('» In welchen Kanal soll gezählt werden?').setRequired(true)),

    async execute(interaction, message) {

        const selectedChannel = interaction.options.getChannel('kanal');
        countingChannelId = selectedChannel.id;
        currentCount = 0; // Reset the count when the channel is set
        lastUserId = null;

        // Reply to confirm the channel has been set
        await interaction.reply(`> \`✅\` » Der Zählkanal wurde auf <#${countingChannelId}> eingestellt.`);

        // Ignore messages from the bot and check if it's in the counting channel
        if (message.member.bot || message.channel.id !== countingChannelId) return;

        // Parse the message content to check if it's a number
        const userNumber = parseInt(message.content);

        if (!isNaN(userNumber)) {
            if (userNumber === currentCount + 1) {
                if (message.member.id === lastUserId) {
                    await message.channel.send(`@${message.member.displayName}, hat Die Reihe bei **1** zerstört! Die nächste Zahl ist **1**. **Du darfst nicht zweimal hintereinander zählen.**`);
                    currentCount = 0;
                    lastUserId = null;
                } else {
                    currentCount++;
                    lastUserId = message.member.id;
                    message.react('✅');
                }
            } else {
                message.react('❌');
                await message.channel.send(`@${message.member.displayName}, Falsche Zahl! Das Spiel wird zurückgesetzt. Die nächste Zahl ist 1.`)
            }
        }

        const countingEmbed = new EmbedBuilder()
            .setTitle('Zahlen Spiel Information')
            .setDescription('Hier sind alle Informationen für das Zählspiel:\n\n`1️⃣` Beginne das Zählen mit der Zahl 1.\n`🛑` Wenn du falsch zählst oder zweimal hintereinander zählst, wird das Spiel zurückgesetzt.')
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name} - System Information`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        await interaction.reply({ embeds: [countingEmbed], ephemeral: true });
    },
};