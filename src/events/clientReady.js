const { Events, ActivityType } = require("discord.js");
const fs = require('fs');
const func = require("../ressources/funktionen");
const messagedb = require("../../Datenbank/messagedb");


module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        console.log('Verbunden mit Discord')

        // Wechsel Status
        setInterval(async () => {
            const guild = await client.guilds.fetch(config.server);
            if (!guild) {
                console.log("Server wurde nicht gefunden");
                return;
            }

            await guild.members.fetch().then(async (members) => {
                const onlineMembers = await members.filter((member) => !member.user.bot);
                if (onlineMembers.size === 0) return;

                const randomMember = await onlineMembers.random();
                const username = randomMember.user.displayName;

                const customStatus = `💖 | mit ${username}`;
                await client.user.setActivity(customStatus, { type: ActivityType.Playing });
            })
            const onlineMembers = await guild.members.cache.filter(m =>
                m.presence?.status === 'online' ||
                m.presence?.status === 'idle' ||
                m.presence?.status === 'dnd'
            ).filter(member => !member.user.bot).size.toLocaleString() || 0
            const memberCount = await guild.members.cache.size.toLocaleString()

            await guild.channels.cache.get(config.category1).setName(`(🌍) - [INFOS] - (USER: ${memberCount})`)
            await guild.channels.cache.get(config.category2).setName(`(👥) - [UNITY] - (ONLINE: ${onlineMembers})`)
        }, 30000);

        setInterval(async () => {
            const channel = await client.channels.fetch(config.willkommen);
            const messageData = await messagedb.findOne({ guildID: config.server })

            if (!messageData) return;
            const messages = messageData.messages
            await channel.setTopic(`<a:7523cursorclick:1007272113830383716> **| KLICK MICH FÜR MEHR INFOS**

    𑁉 **${await func.tausender(messages)}** Nachrichten wurden bereits versendet! <a:Chat1:976129450112593990> **Unterhalte dich** ein wenig mit uns!\n\n<a:Information:1007267420316106903> **| __WICHTIGE INFORMATION__**
    » Um eine freundliche Atmosphäre beizubehalten, denke bitte immer daran, dich an unsere **Server-Regeln** zu halten: <#815922286502346773>.\n\n:information_source: | __Du möchtest ein Mitglied melden?__\n» Benutze: **/report <user> <grund>**\n» **Das ausnutzen des Report Befehls wird bestraft!**\n\n:pushpin: » Solltest du **Fragen** haben, zögere nicht und Öffne ein Ticket in <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.`)
        }, 1000 * 60 * 5)

    }
}