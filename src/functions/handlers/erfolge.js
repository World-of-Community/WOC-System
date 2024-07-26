const { EmbedBuilder, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, Permissions, interaction } = require('discord.js');
const erfolgDB = require("../../../Datenbank/erfolgdb")

module.exports = (client) => {
    client.handleErfolg = async () => {

        client.on('messageCreate', async message => {
            if (!message.guild || message.author.bot) return;

            try {
                let userAchievements = await erfolgDB.findOne({ userID: message.author.id });

                if (!userAchievements || !userAchievements.firstMessage) {
                    await erfolgDB.findOneAndUpdate(
                        { userID: message.author.id },
                        { firstMessage: true },
                        { upsert: true }
                    );

                    const rewards = [
                        { text: '1 Level', probability: 0.40 },
                        { text: '2 Level', probability: 0.25 },
                        { text: '3 Level', probability: 0.20 },
                        { text: '4 Level', probability: 0.10 },
                        { text: '5 Level', probability: 0.05 },
                    ];

                    function selectReward() {
                        const rand = Math.random();
                        let sum = 0;
                        for (const reward of rewards) {
                            sum += reward.probability;
                            if (rand < sum) {
                                return reward;
                            }
                        }
                        return rewards[0]; // Fallback in case of rounding errors
                    }

                    const button = new ButtonBuilder()
                        .setCustomId('first_message_reward' + message.author.id)
                        .setLabel('» Belohnung abholen')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('968876390982234202');
                
                    const actionRow = new ActionRowBuilder().addComponents(button);
                    await message.reply({ content: `Du hast so eben deine **erste Nachricht** geschrieben, Glückwunsch!`, components: [actionRow] });
                }
            } catch (err) {
                console.error('Fehler bei der Verarbeitung der ersten Nachricht:', err);
            }
        });
    }
}