const { EmbedBuilder, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder, Permissions, interaction } = require('discord.js');
const erfolgDB = require("../../../Datenbank/erfolgdb")
const vorschlagEmitter = require('../events/vorschlag');

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

                    //Todo: Economy System einbinden. ~ @vxnsin
                    const button = new ButtonBuilder()
                        .setCustomId('first_message_reward' + message.author.id)
                        .setLabel('» Belohnung abholen')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('968876390982234202');
                
                    const actionRow = new ActionRowBuilder().addComponents(button);
                    //await message.reply({ content: `Du hast so eben deine **erste Nachricht** geschrieben, Glückwunsch!`, components: [actionRow] });
                }
            } catch (err) {
                console.error('Fehler bei der Verarbeitung der ersten Nachricht:', err);
            }
        });

        vorschlagEmitter.on('accept', async (inter) => {
            const channel = inter.channel;
            const message = await inter.channel.fetchStarterMessage();
            const vorschlagsembed = message.embeds[0];
            
            const footerText = vorschlagsembed.footer.text;
            const regex = /»\s[^\d]*\s(\d+)\s/;
            const userIDMatch = footerText.match(regex); 
            const userID = userIDMatch ? userIDMatch[1] : null;
        
            if (!userID) {
                await inter.reply({ content: "`❌` » User ID konnte nicht gefunden werden", ephemeral: true });
                return;
            }

            let userErfolge = await erfolgDB.findOne({ userID: userID });
        
            userErfolge.idee += 1;
            await userErfolge.save();

            if (userErfolge.idee === 10) {
                const user = await inter.client.users.fetch(userID);
                if (user) {
                    user.send('> `✅` Glückwunsch! Du hast 10 akzeptierte Vorschläge erreicht!');
                }
            }
        })        

    }
}