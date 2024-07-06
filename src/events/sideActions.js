const { Events } = require("discord.js");
const serverdb = require("../../Datenbank/serverdb");
const userdb = require("../../Datenbank/userdb");
const messagedb = require("../../Datenbank/messagedb");
const config = require("../../config.json"); 

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        try {
            if (message.author.bot) return;


            if (message.channelId === config.autoDelete) {
                setTimeout(async () => {
                    try {
                        await message.delete();
                    } catch (error) {
                        console.error('Fehler beim Löschen der Nachricht:', error);
                    }
                }, 30000);
            }

            if (message.mentions.users.size > 0) {
                for (const mentionedUser of message.mentions.users.values()) {
                    const mentionData = await userdb.findOne({ userID: mentionedUser.id });

                    if (mentionData && mentionData.reactions && mentionData.reactions.length > 0) {
                        await Promise.all(mentionData.reactions.map(reaction => message.react(reaction).catch(() => {})));
                    }

                    if (mentionData && mentionData.afk && mentionedUser.id !== message.author.id) {
                        const m = await message.reply(`<:AFK:1021086267557023775> | ${mentionedUser} **ist aktuell abwesend!**\n${mentionData.afkReason.replace("*", "")}`);
                        setTimeout(async () => {
                            try {
                                await m.delete();
                            } catch (error) {
                                console.error('Fehler beim Löschen der AFK-Nachricht:', error);
                            }
                        }, 5000);
                    }
                }
            }

            // Reaktions basierend auf den Channel ID'S
            switch (message.channel.id) {
                case '896743941813207081':
                    await message.react('🔍');
                    break;
                case '1172920281526960238':
                    const customEmoji = message.guild.emojis.cache.get("1236232439022616658");
                    if (customEmoji) {
                        await message.react(customEmoji);
                    }
                    break;
                case '1243964646449483788':
                    await message.react('<a:herzen:974633994840854608>');
                    await message.react('<a:Cool:915211628755169301>');
                    break;
                case '1250047970116636756':
                    if (message.author.id !== "1020023299448786955") {
                        await message.react('<a:wocheartbeat:1250054562912538724>');
                    }
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Fehler bei der Ausführung des Eventhandlers:', error);
        }
    }
};
