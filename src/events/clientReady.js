const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const mongoose = require('mongoose');
const fs = require('fs');
const func = require("../ressources/funktionen");
const messagedb = require("../../Datenbank/messagedb");
const userDB = require("../../Datenbank/userdb");
const bandb = require("../../Datenbank/bandb");
const internal = require("stream");
const cron = require('node-cron');
const Parser = require('rss-parser');
const parser = new Parser();
const FeedManager = require('../FeedManager');
const { Giga, Tagesschau } = FeedManager;
module.exports = {
    name: Events.ClientReady,
    async execute(client) {
    let lastEntries = {};
        try {
            const data = fs.readFileSync('src/json/lastEntries.json');
            lastEntries = JSON.parse(data);
        } catch (error) {
            console.error('Error loading lastEntries:', error);
        }
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        const guild = await client.guilds.fetch(config.server);
        if (!guild) {
            console.log("Server wurde nicht gefunden");
            return;
        }
        console.log('Verbunden mit Discord')
        //RSS Feed
        setInterval(async () => {
            Giga(client, lastEntries);
            Tagesschau(client, lastEntries);
        }, 60000);
        const ageRoles = {
            '-18': '1199786765666500710',
            '18': '1199786814051979344',
        };
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth() + 1;
        const currentYear = today.getFullYear();
    
        try {
            const birthdayUsers = await userDB.find({ 'birthday.tag': 3, 'birthday.monat': 11 });
    
            if (birthdayUsers.length > 0) {
                const birthdayChannel = client.channels.cache.get('1243964646449483788');
                const birthdayUsersList = [];
                
                for (const user of birthdayUsers) {
                    const member = await guild.members.fetch(user.userID);
                    if (user.birthday.jahr) {
                        let age = '';
                        age = ` (${currentYear - user.birthday.jahr})`;
                    let roleId; ageRoles[(currentYear - user.birthday.jahr).toString()];
    
                    if(currentYear - user.birthday.jahr <= "18") ageRoles["-18"];
                    else if(currentYear - user.birthday.jahr >= "18") ageRoles["18"];
    
                    if (roleId) {
                        const role = guild.roles.cache.get(roleId);
                        await member.roles.add(role);
                    }
                        birthdayUsersList.push(`${member} (**${age}**)`);
                    } else {
                        birthdayUsersList.push(`${member}`);
                    }
                }
    
                let birthdayMessage = '';
    
                if (birthdayUsersList.length === 1) {
                    birthdayMessage = `${birthdayUsersList[0]} hat **heute Geburtstag**`;
                } else {
                    const lastUser = birthdayUsersList.pop(); 
                    birthdayMessage = `${birthdayUsersList.join(', ')} und ${lastUser} haben **heute Geburtstag**`;
                }
    
                const birthdayword = [
                    'Genieße die kleinen Dinge. Sie machen das Leben großartig!',
                    'Durch dich wird die Welt ein besserer Ort, bleib wie du bist!',
                    'Heute sollst Du Dich einfach entspannen und alle Deine Sorgen verbannen.',
                    'Lass dich drücken, knuddeln und umarmen. Sollen alle deine Ziele, Wünsche und Träume in Erfüllung gehen. Du hast es verdient.'
                ];
                const randomIndex = Math.floor(Math.random() * birthdayword.length);
                const selectedBirthdayWord = birthdayword[randomIndex];

                await birthdayChannel.send({ content: 
                    `🎂 𑁉 ${birthdayMessage}\nWünscht den **${birthdayUsersList.length === 1 ? 'Mitglied' : 'Mitgliedern'}** alles gute!\nTragt auch euren Geburtstag ein mit \`/birthday set\` (**MIT JAHR** für eine Altersrolle!).\n*${selectedBirthdayWord}*`
                });
            } else {
                const birthdayChannel = client.channels.cache.get('1243964646449483788');
                const noBirthdayEmbed = new EmbedBuilder()
                    .setDescription('<a:crying:1243854160160358470> 𑁉 Heute hat **keiner** Geburtstag... Oder vielleicht doch?\nTrage auch deinen Geburtstag ein mit `/birthday set` (**MIT JAHR** für eine Altersrolle!)\n*damit du zusammen mit **der Community** deinen Geburtstag feiern kannst!*')
                    .setColor('Blurple');
                await birthdayChannel.send({ content: 
                '<a:crying:1243854160160358470> 𑁉 Heute hat **keiner** Geburtstag... Oder vielleicht doch?\nTrage auch deinen Geburtstag ein mit `/birthday set` (**MIT JAHR** für eine Altersrolle!)\n*damit du zusammen mit **der Community** deinen Geburtstag feiern kannst!*'
                });
            }
        } catch (error) {
            console.error('Fehler beim Verarbeiten der Geburtstage:', error);
        }

        // Wechsel Status
        setInterval(async () => {
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
            await channel.setTopic(`<a:7523cursorclick:1007272113830383716> **| KLICK MICH FÜR MEHR INFOS**\n\n𑁉 **${await func.tausender(messages)}** Nachrichten wurden bereits versendet! <a:Chat1:976129450112593990> **Unterhalte dich** ein wenig mit uns!\n\n<a:Information:1007267420316106903> **| __WICHTIGE INFORMATION__**\n» Um eine freundliche Atmosphäre beizubehalten, denke bitte immer daran, dich an unsere **Server-Regeln** zu halten: <#815922286502346773>.\n\n:information_source: | __Du möchtest ein Mitglied melden?__\n» Benutze: **/report <user> <grund>**\n» **Das ausnutzen des Report Befehls wird bestraft!**\n\n:pushpin: » Solltest du **Fragen** haben, zögere nicht und Öffne ein Ticket in <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.`)
        }, 1000 * 60 * 5)

       setInterval(async () => {
            const server = await client.guilds.fetch("815919809379172354")
            async function getMemberList(server, roleID) {
                var list = [];
                const role = await server.roles.cache.find((r) => r.id === roleID);
                const rolemember = role.members
    
                rolemember.forEach(async member => {
                    try {
                        const banData = await bandb.findOne({ user: member.id })
                        list.push(`${member} (\`${banData.reason}\`)`)
                    } catch (error) {
                    }
    
                });
                return list;
            }
    
            const gebannt = await server.roles.cache.get('886989738244964362')
            const roleCountg = gebannt.members.size
    
            const bans = await getMemberList(server, gebannt.id)
            const channel = await server.channels.fetch("1217020305671983205")
            const messages = await channel.messages.fetch()
            const message = await messages.first()
            const bannembed = new EmbedBuilder()
                .setTitle('Information zu den Gebannten Nutzern')
                .setDescription(`Hier ist eine Liste der gebannten Nutzer\n> \`⛔\` 𑁉 <@&886989738244964362> (\`${bans.length}👥\`)\n\n ${bans.length > 0 ? bans.join("\n") : "> Aktuell sind keine Bann-Einträge vorhanden."}`)
                .setColor('Red')
    
            await message.edit({ embeds: [bannembed] })
        }, 30000);


    //Auto Delete | Spieler Suche
    cron.schedule('0 0 * * *', async () => {
            const channel = await client.channels.fetch("896743941813207081");

            channel.messages.fetch({ limit: 100 }).then(messages => {
                messages.forEach(message => {
                    if (!message.pinned) {
                        message.delete().catch(console.error);
                    }
                });
            }).catch(console.error);
        });

    }
}
