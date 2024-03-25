const { Events } = require("discord.js");

// Definiere die Rollen und ihre entsprechenden Level und IDs
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        const channel = message.guild.channels.cache.get("870645033232130098");
        if (message.author.id === "339254240012664832" && message.channelId === "815922756918181898") {
            let mention = message.mentions.users.first();
            if (!mention) return;

            const embed = message.embeds[0];
            if (embed.description) {
                const regex = /\*\*([\d]+)\*\*/;
                const match = embed.description.match(regex);
                if (match && match[1]) {
                    const level = parseInt(match[1]);
                    let messageText;
                    let newRankAchieved = false
                    const roles = [
                        { id: "835775597446955048", name: "Episch", level: 10 },
                        { id: "835775627721179167", name: "Diamond", level: 20 },
                        { id: "835775556611997697", name: "Emerald", level: 40 },
                        { id: "815920452337139733", name: "Legende", level: 50 },
                        { id: "815921105407574056", name: "Supreme", level: 100 }
                    ];
                    
                    for (const role of roles) {
                        if (level == role.level) {
                            const member = mention.member;
                                    channel.send(`<a:trophe1:1221802325056950303> **LEVEL-UP!** ${mention} hat das Level ${level} erreicht - und einen **neuen Rang** erhalten! <a:Cool:1033461188299858001>`);
                                    newRankAchieved = true;
                                    break;
                        }
                    }
                    if (!newRankAchieved) {
                        for (const role of roles) {
                            if (level < role.level) {
                                channel.send(`<a:bier:1196502621427601498>**LEVEL-UP!** ${mention} hat das Level ${level} erreicht - noch ${role.level - level} Level bis zu einem **neuen Rang** - Weiter so! <a:Chat1:976129450112593990>`);
                                break;
                            }
                        }
                    }
                    if (level >= 100 && !newRankAchieved) {
                        channel.send(`<a:trophe1:1221802325056950303> **LEVEL-UP!** ${mention} hat das Level ${level} erreicht - danke für deine weitere Treue für die Community! <a:2herzen:1196502635465932984>`);
                    }
                }
            }
        }
     }
}
