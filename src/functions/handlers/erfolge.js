const { EmbedBuilder, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, Permissions } = require('discord.js');
const erfolgDB = require("../../../Datenbank/erfolgdb")

module.exports = (client) => {
    client.handleErfolg = async () => {

        client.on('messageCreate', async message => {
            if (!message.guild || message.author.bot) return;

            try {
                let userAchievements = await erfolgDB.findOne({ userID: message.author.id });

                if (!userAchievements || !userAchievements.firstMessage) {
                    await Erfolge.findOneAndUpdate(
                        { userID: message.author.id },
                        { firstMessage: true },
                        { upsert: true }
                    );
                

                    const button = new ButtonBuilder()
                        .setCustomId('first_messag_' + message.author.id)
                        .setLabel('Belohnung abholen')
                        .setStyle(ButtonStyle.Success);
                    
                    const actionRow = new ActionRowBuilder.addComponents(button)
                    await message.reply({ content: 
                        `Du hast so eben deine **erste Nachricht** geschrieben, Glückwunsch!\n> Du hast eine Belohung verdient :D`,

                        compoments: [actionRow]
                     });
                }
            } catch (err) {
                console.error('Error handling first message achievement:', err);
            }
        });
    }
}