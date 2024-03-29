const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const mongoose = require('mongoose');
const fs = require('fs');
const func = require("../ressources/funktionen");
const messagedb = require("../../Datenbank/messagedb");
const bandb = require("../../Datenbank/bandb");
const internal = require("stream");
const cron = require('node-cron');

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
       //      const channel = await client.channels.fetch(config.willkommen);
       //      const messageData = await messagedb.findOne({ guildID: config.server })

       //      if (!messageData) return;
       //      const messages = messageData.messages
       //      await channel.setTopic(`<a:7523cursorclick:1007272113830383716> **| KLICK MICH FÜR MEHR INFOS**\n\n𑁉 **${await func.tausender(messages)}** Nachrichten wurden bereits versendet! <a:Chat1:976129450112593990> **Unterhalte dich** ein wenig mit uns!\n\n<a:Information:1007267420316106903> **| __WICHTIGE INFORMATION__**\n» Um eine freundliche Atmosphäre beizubehalten, denke bitte immer daran, dich an unsere **Server-Regeln** zu halten: <#815922286502346773>.\n\n:information_source: | __Du möchtest ein Mitglied melden?__\n» Benutze: **/report <user> <grund>**\n» **Das ausnutzen des Report Befehls wird bestraft!**\n\n:pushpin: » Solltest du **Fragen** haben, zögere nicht und Öffne ein Ticket in <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.`)
       //  }, 1000 * 60 * 5)

       // setInterval(async () => {
       //      console.log("🚓 | BanDB | Check wird durchgeführt")
       //      const currentTime = new Date();
       //      const activeBans = await bandb.find({ endTime: null });
       //      if (!activeBans) return;
       //      for (const bans of activeBans) {
       //          const startTime = new Date(bans.startTime);
       //          if (bans.duration === null || bans.duration === undefined) {
       //              console.log(`⛔ | BanDB | ${bans.user} wurde ignoriert`)
       //              continue;
       //          }
       //          if (startTime.getTime() + bans.duration <= currentTime.getTime()) {
       //              if (bans.endTime) return;
       //              bans.endTime = new Date();
       //              await bans.save();

       //              const banneduser = bot.users.cache.get(bans.user)

       //              if (banneduser != null) {
       //                  const embed = new EmbedBuilder()
       //                      .setTitle('`👮` » WILLKOMMEN ZURÜCK!')
       //                      .setDescription(`» Du hast wurdest entbannt, und hast wieder Zugriff zu allen Kanälen\n\n> Wir wünschen dir viel Spaß auf dem ${interaction.guild.name}.`)
       //                      .setFooter({ text: `©️ WOC | Bann-System`, iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
       //                      .setColor('Blurple')
       //                  banneduser.roles.remove(config.banRolle)
       //                  banneduser.roles.add(config.memberRolle)
       //                  await banneduser.send({ embeds: [embed] }).catch(error => console.log(`🔒 | BanDB | ${bans.user} user konnte nicht Kontaktiert werden!`))
       //                  console.log(`🕛 | BanDB | ${bans.user} wurde entbannt.`)
       //                  await banSchema.deleteOne({ user: bans.user });
       //                  console.log(`✅ | BanDB | Eintrag wurde gelöscht`)
       //              } else {
       //                  console.log(`🗑️ | BanDB | ${bans.user}'s Eintrag wurde gelöscht.`)
       //                  await banSchema.deleteOne({ user: bans.user });
       //              }
       //          }
       //      }
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
        cron.schedule('0 0 */1 * *', async() => { // Dieser Cron-Job wird täglich um Mitternacht ausgeführt
            const channel = await client.channels.fetch("896743941813207081");

            const messages = await channel.messages.fetch({ limit: 100 });
            const filteredMessages = messages.filter(message => !message.pinned);
        
            if (filteredMessages.size > 0) {
                await channel.bulkDelete(filteredMessages);
            }
        });
    }
}
