const { SlashCommandBuilder, EmbedBuilder, PermissionBitField } = require('discord.js');

// Variables to store game state
let countingChannelId = null;
let currentCount = 0;
let lastUserId = null;
let highestCount = 0; // Track the highest count so far

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

        // Send the initial embed
        const countingEmbed = new EmbedBuilder()
            .setTitle('`🔢` » Zahlen Spiel Information')
            .setDescription(`Hier sind alle Informationen für das Zählspiel:\n\n\`1️⃣\` » Beginne das Zählen mit der Zahl **1**.\n\`🛑\` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.\n\n\`🏆\` » **Bisheriger Zähl Rekord:** **\`${highestCount}\`**`)
            .setColor('Blurple')
            .setFooter({ text: `» ${interaction.guild.name} - System Information`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        countingEmbedMessage = await selectedChannel.send({ embeds: [countingEmbed] });
        await countingEmbedMessage.pin(); // Pin the embed message

        // Update the embed every 30 minutes (1800000 milliseconds)
        setInterval(async () => {
            const updatedEmbed = new EmbedBuilder()
                .setTitle('`🔢` » Zahlen Spiel Information')
                .setDescription(`Hier sind alle Informationen für das Zählspiel:\n\n\`1️⃣\` » Beginne das Zählen mit der Zahl **1**.\n\`🛑\` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.\n\n\`🏆\` » **Bisheriger Zähl Rekord:** **\`${highestCount}\`**`)
                .setColor('Blurple')
                .setFooter({ text: `» ${interaction.guild.name} - System Information`, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await countingEmbedMessage.edit({ embeds: [updatedEmbed] });
        }, 1800000); // 30 minutes interval

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

                        // Check if the current count is a new record
                        if (currentCount > highestCount) {
                            highestCount = currentCount;
                            await selectedChannel.send(`> \`🎉\` » **Neuer Rekord!** ${message.member} hat die höchste Zahl **${highestCount}** erreicht!`);
                        }
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
