const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const countingdb = require("../../../Datenbank/countingdb"); // Make sure this exports the model/schema

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription('» Setzt den Zählkanal. 🔢')
        .addChannelOption(option => option.setName('kanal').setDescription('» In welchen Kanal soll gezählt werden?').setRequired(true)),

    async execute(interaction) {
        const selectedChannel = interaction.options.getChannel('kanal');
        const guildId = interaction.guild.id;
        
        let countingData = await countingdb.findOne({ guildId });
        console.log('Counting Data:', countingData);

        if (!countingData) {
            countingData = await countingdb.create({
                guildId,
                channelId: selectedChannel.id,
                highestCount: 0,
                currentCount: 0,
                lastUserId: null
            });
        }

        countingData.channelId = selectedChannel.id;
        countingData.currentCount = 0;
        countingData.lastUserId = null;
        await countingData.save();

        await interaction.reply({ content: `> \`✅\` » Der Zählkanal wurde auf <#${selectedChannel.id}> eingestellt.`, ephemeral: true });

        const countingEmbed = new EmbedBuilder()
            .setTitle('`🔢` » Zahlen Spiel Information')
            .setDescription(`Hier sind alle Informationen für das Zählspiel:\n\n\`1️⃣\` » Beginne das Zählen mit der Zahl **1**.\n\`🛑\` » Wenn du **falsch** zählst oder **zweimal hintereinander** zählst, wird das Spiel **zurückgesetzt**.\n\n\`🏆\` » **Bisheriger Zähl Rekord:** **\`${countingData.highestCount}\`**`)
            .setColor('Blurple')
            .setFooter({ text: `» ${interaction.guild.name} - System Information`, iconURL: interaction.guild.iconURL() })
            .setTimestamp();

        const countingEmbedMessage = await selectedChannel.send({ embeds: [countingEmbed] });
        await countingEmbedMessage.pin();

        const filter = (m) => m.channel.id === selectedChannel.id && !m.author.bot;
        const collector = selectedChannel.createMessageCollector({ filter });

        collector.on('collect', async (message) => {
            const userNumber = parseInt(message.content);

            if (!isNaN(userNumber)) {
                if (userNumber === countingData.currentCount + 1) {
                    if (message.author.id === countingData.lastUserId) {
                        await selectedChannel.send(`> \`❗\` » ${message.member} hat die Reihe bei **1** zerstört! Die nächste Zahl ist **1**. **Du darfst nicht zweimal hintereinander zählen!**`);
                        countingData.currentCount = 0;
                        countingData.lastUserId = null;
                    } else {
                        countingData.currentCount++;
                        countingData.lastUserId = message.author.id;
                        await message.react('✅');

                        if (countingData.currentCount > countingData.highestCount) {
                            countingData.highestCount = countingData.currentCount;
                            await selectedChannel.send(`> \`🎉\` » **Neuer Rekord!** ${message.member} hat die höchste Zahl **${countingData.highestCount}** erreicht!`);
                        }
                    }
                } else {
                    await message.react('❌');
                    await selectedChannel.send(`> \`❗\` » ${message.member}, falsche Zahl! Das Spiel wird zurückgesetzt. Die nächste Zahl ist **1**.`);
                    countingData.currentCount = 0;
                    countingData.lastUserId = null;
                }

                await countingData.save();
            }
        });
    }
};
