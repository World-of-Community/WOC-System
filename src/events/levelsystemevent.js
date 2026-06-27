import { Events } from "discord.js";
export default {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild) return
        const channel = message.guild.channels.cache.get("815922756918181898");
        if (message.author.id === "339254240012664832" && message.channelId === "1221819093100007465") {
            const debugUser = await message.client.users.fetch("531896089096486922");

            await debugUser.send("**[1] Bot hat eine Nachricht von AmariBot erkannt.**");

            let mention = message.mentions.users.first();
            if (!mention) {
                await debugUser.send("**[2] Kein Mention gefunden – Abbruch.**");
                return;
            }
            await debugUser.send(`**[2] Mention gefunden:** ${mention.id} (${mention.username})`);

            const embed = message.embeds[0];
            if (!embed) {
                await debugUser.send("**[3] Kein Embed gefunden – Abbruch.**");
                return;
            }
            await debugUser.send("**[3] Embed gefunden.**");

            await debugUser.send("**[4] Embed JSON:**\n```json\n" + JSON.stringify(embed, null, 2) + "\n```");

            await debugUser.send(`**[5] embed.title:** \`${embed.title ?? "null"}\``);
            await debugUser.send(`**[6] embed.description:** \`${embed.description ?? "null"}\``);
            await debugUser.send(`**[7] embed.fields:** \`${JSON.stringify(embed.fields ?? [])}\``);

            // // const textToSearch = [
            // //     embed.description,
            // //     embed.title,
            // //     ...( embed.fields?.map(f => f.value) ?? [] )
            // // ].filter(Boolean).join(" ");
            // // console.log("Embed-Text gefunden:", textToSearch);
            // // const regex = /\*\*([\d]+)\*\*|level\s+\*\*(\d+)\*\*/i;
            // // const match = textToSearch.match(regex);
            // // if (match) {
            // //     const level = parseInt(match[1] ?? match[2]);
            // //     let newRankAchieved = false;
            // //     const levelList = [
            // //         { level: 5 },
            // //         { level: 10 },
            // //         { level: 20 },
            // //         { level: 30 },
            // //         { level: 40 },
            // //         { level: 50 },
            // //         { level: 75 },
            // //         { level: 100 }
            // //     ];
            // //     for (const levelL of levelList) {
            // //         if (level == levelL.level) {
            // //             channel.send(`<a:trophy:1375557481434189934> **LEVEL-UP!** ${mention} hat das Level **${level}.** erreicht - und einen **neuen Rang** erhalten! <a:Cool:1033461188299858001>`);
            // //             newRankAchieved = true;
            // //             break;
            // //         }
            // //     }
            // //     if (!newRankAchieved) {
            // //         for (const levelL of levelList) {
            // //             if (level < levelL.level) {
            // //                 channel.send(`<a:cheers:1375558102098776214> **LEVEL-UP!** ${mention} hat das Level **${level}.** erreicht - noch **${levelL.level - level}** Level bis zu einem **neuen Rang** - Weiter so! <a:Chat1:976129450112593990>`);
            // //                 break;
            // //             }
            // //         }
            // //     }
            // //     if (level >= 100 && !newRankAchieved) {
            // //         channel.send(`<a:trophy:1375557481434189934> **LEVEL-UP!** ${mention} hat das Level **${level}.** erreicht - danke für deine weitere Treue für die Community! <a:2herzen:1196502635465932984>`);
            // //     }
            // // }
        }
    }
}
