const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Variables to store game state
let countingChannelId = null;
let currentCount = 0;
let lastUserId = null;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription('» Setzt den Zählkanal. 🔢')
        .addChannelOption(option => option.setName('kanal').setDescription('» In welchen Kanal soll gezählt werden?').setRequired(true)),

    async execute(interaction) {
        const selectedChannel = interaction.options.getChannel('kanal');
        countingChannelId = selectedChannel.id;
        currentCount = 0; // Reset the count when the channel is set
        lastUserId = null;

        // Reply to confirm the channel has been set
        await interaction.reply({ content: `> \`✅\` » Der Zählkanal wurde auf <#${countingChannelId}> eingestellt.`, ephemeral: true });

        // Inform the user about the counting game
        const countingEmbed = new EmbedBuilder()
            .setTitle('Zahlen Spiel Information')
            .setDescription('Hier sind alle Informationen für das Zählspiel:\n\n`1️⃣` » Beginne das Zählen mit der Zahl **1**.\n`🛑` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.')
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name} - System Information`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        // Send the embed message and pin it
        const embedMessage = await selectedChannel.send({ embeds: [countingEmbed] });
        await embedMessage.pin(); // Pin the embed message

        // Create a message collector for the counting channel
        const filter = (m) => m.channel.id === countingChannelId && !m.author.bot;
        const collector = selectedChannel.createMessageCollector({ filter });

        collector.on('collect', async (message) => {
            const userNumber = parseInt(message.content);

            if (!isNaN(userNumber)) {
                if (userNumber === currentCount + 1) {
                    if (message.author.id === lastUserId) {
                        await selectedChannel.send(`> \`❗\` » ${message.member} hat die Reihe bei **1** zerstört! Die nächste Zahl ist **1**. **Du darfst nicht zweimal hintereinander zählen!**`);
                        currentCount = 0; // Reset count
                        lastUserId = null;
                    } else {
                        currentCount++;
                        lastUserId = message.author.id;
                        await message.react('✅');
                    }
                } else {
                    await message.react('❌');
                    await selectedChannel.send(`> \`❗\` » ${message.member}, falsche Zahl! Das Spiel wird zurückgesetzt. Die nächste Zahl ist **1**.`);
                    currentCount = 0; // Reset count
                    lastUserId = null;
                }
            }
        });
    }
};
