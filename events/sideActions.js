import client from "../index.js";
import { Events } from "discord.js";
import serverdb from "../models/serverdb.js";
import userdb from "../models/userdb.js";
import messagedb from "../models/messagedb.js";
import fs from "fs";

client.on(Events.MessageCreate, async (message) => {
        try {
            if(!message.guild) return

            const file = fs.readFileSync('json/config.json', 'utf-8');
            const config = JSON.parse(file);

            if (message.channelId === config.autoDelete) {
                setTimeout(async () => {
                    try {
                        await message.delete();
                    } catch (error) {
                    }
                }, 30000);
            }

            if (message.mentions.users.size > 0) {
                if(message.author.bot) return
                for (const mentionedUser of message.mentions.users.values()) {
                    const mentionData = await userdb.findOne({ userID: mentionedUser.id });

                    if (mentionData && mentionData.reactions && mentionData.reactions.length > 0) {
                        await Promise.all(mentionData.reactions.map(reaction => message.react(reaction).catch(() => {})));
                    }

                    if (mentionData && mentionData.afk && mentionedUser.id !== message.author.id) {
                        const m = await message.reply(
                            `<:AFK:1021086267557023775> | ${mentionedUser} **ist aktuell abwesend!**\n` +
                            `${mentionData.afkReason.replace("*", "")}`
                        );
                        setTimeout(async () => {
                            try {
                                await m.delete();
                            } catch (error) {
                                console.error('❗  | Fehler beim Löschen der AFK-Nachricht:', error);
                            }
                        }, 5000);
                    }
                }
            }

            // Reaktions basierend auf den Channel ID'S
            switch (message.channel.id) {
                case '896743941813207081': // Spielersuche
                    await message.react('🔍');

                    break;

                case '1172920281526960238':
                    await message.react('<a:link:1369954893380718672>'); // Werbung für alle

                    break;

                case '1243964646449483788':
                    await message.react('<a:herzen:1394561549602914386>'); // Geburtstage
                    await message.react('<a:Cool:915211628755169301>'); // Geburtstage

                    break;

                case '1250047970116636756':
                    if (message.author.id !== "1020023299448786955") {
                        await message.react('<:wocheartbeat:1376452184748855338>'); // Vorstellung
                    }
                    break;

                default:
                    break;
            }
        } catch (error) {
            console.error('❗  | Fehler bei der Ausführung des Eventhandlers:', error);
        }
    });
