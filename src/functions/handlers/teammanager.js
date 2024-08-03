const {
    EmbedBuilder,
    Events,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Permissions,
    interaction,
  } = require("discord.js");
  const teamDB = require("../../../Datenbank/teamdb");
  const serverDB = require("../../../Datenbank/serverdb");
  const cron = require("node-cron");
  
  module.exports = (client) => {
    client.manageTeam = async () => {
        

        client.on('messageCreate', async (message) => {
            // Ignoriere Nachrichten vom Bot selbst
            if (message.author.bot) return;
        
            // Überprüfe, ob die Nachricht einen Ping enthält
            const mentionedUsers = message.mentions.users;
            for (const user of mentionedUsers.values()) {
                // Finde die Team-Daten des Benutzers
                const teamData = await teamDB.findOne({ userID: user.id });
        
                if (teamData && teamData.urlaub) {
                    const now = new Date();
                    const urlaubBeginn = parseDate(teamData.urlaub.beginn);
                    const urlaubEnde = parseDate(teamData.urlaub.ende);
                    const urlaubMessageUrl = `https://discord.com/channels/${message.guild.id}/877446081036836884/${teamData.urlaub.messageId}`;
        
                    if (now >= urlaubBeginn && now <= urlaubEnde) {
                        await message.reply({
                            content: `> ${user} ist derzeit im Urlaub und daher nicht erreichbar. [Mehr Infos](${urlaubMessageUrl})`
                        });
                    }
                }
            }
        });
        function parseDate(dateStr) {
            const [day, month, year] = dateStr.split('.').map(Number);
            return new Date(year, month - 1, day);
        }
        
        const cron = require('node-cron');
        
        cron.schedule('0 0 * * *', async () => {
            const now = new Date();
            
            const expiredUrlaubs = await teamDB.find({
                'urlaub.ende': { $lte: formatDate(now) } 
            });
        
            for (const data of expiredUrlaubs) {
                const channel = client.channels.cache.get('877446081036836884'); 
                if (channel && data.urlaub.messageId) {
                    try {
                        const message = await channel.messages.fetch(data.urlaub.messageId);
                        if (message) {
                            await message.delete();
                        }
                    } catch (err) {
                        console.error('Fehler beim Löschen der Nachricht:', err);
                    }
                }
                
                await teamDB.updateOne(
                    { userID: data.userID },
                    { $unset: { urlaub: '' } }
                );
            }
        
            console.log('Abgelaufene Urlaubs-Einträge wurden entfernt und Nachrichten gelöscht.');
        });
        
        function formatDate(date) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}.${month}.${year}`;
        }
    }
}