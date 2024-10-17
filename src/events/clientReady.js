const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const func = require("../ressources/funktionen");
const messagedb = require("../../Datenbank/messagedb");
const userDB = require("../../Datenbank/userdb");
const serverDB = require("../../Datenbank/serverdb")
const bandb = require("../../Datenbank/bandb");
const teamdb = require("../../Datenbank/teamdb");
const internal = require("stream");
const cron = require("node-cron");
const Parser = require("rss-parser");
const parser = new Parser();
const FeedManager = require("../FeedManager");
const { processRSSFeed } = FeedManager;

const userdb = require('../../Datenbank/userdb');
const leaderboarddb = require('../../Datenbank/leaderboarddb');
const RoleID = '1150753421339676722';

function getCurrentMonth() {
    const monthNames = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];
    const now = new Date();
    return monthNames[now.getMonth()];
}

const positionEmojis = ['`1️⃣`', '`2️⃣`', '`3️⃣`', '`4️⃣`', '`5️⃣`', '`6️⃣`', '`7️⃣`', '`8️⃣`', '`9️⃣`', '`🔟`'];

module.exports = {
  name: Events.ClientReady,
  async execute(client) {

    let lastEntries = {};
    try {
      const data = fs.readFileSync("src/json/lastEntries.json");
      lastEntries = JSON.parse(data);
    } catch (error) {
      console.error("Error loading lastEntries:", error);
    }
    const file = fs.readFileSync("src/json/config.json", "utf-8");
    const config = JSON.parse(file);

    const guild = await client.guilds.fetch("815919809379172354");
    
    if (!guild) {
      console.log("Server wurde nicht gefunden");
      return;
    }
    console.log("Verbunden mit Discord");

    const leaderboardMessage = await leaderboarddb.findOne({});
    const messageId = leaderboardMessage?.messageId;

    await new Promise(resolve => setTimeout(resolve, 5000)); 

    const updateLeaderboardEmbeds = async () => {
        try {
            const topMessages = await userdb.find().sort({ "stats.messages": -1 }).limit(10);
            const topVoice = await userdb.find().sort({ "stats.voiceTime": -1 }).limit(10);

            const topMessagesMembers = await Promise.all(topMessages.map(async (user) => {
                const member = await guild.members.fetch(user.userID).catch(() => null);
                return { member, messages: user.stats.messages ?? 0 };
            }));

            const topVoiceMembers = await Promise.all(topVoice.map(async (user) => {
                const member = await guild.members.fetch(user.userID).catch(() => null);
                const voiceTime = user.stats.voiceTime ?? 0;
                const days = Math.floor(voiceTime / (24 * 60 * 60 * 1000));
                const hours = Math.floor((voiceTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                const minutes = Math.floor((voiceTime % (60 * 60 * 1000)) / (60 * 1000));
                return { member, timeText: `${days} Tage ${hours} Stunden ${minutes} Minuten` };
            }));

            const messageLeaderboardText = topMessagesMembers
                .filter(user => user.member)
                .map((user, index) => {
                    const memberMention = user.member ? user.member.toString() : 'Unbekannt';
                    return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.globalName}**\n> \`${user.messages} Nachrichten\``;
                })
                .join('\n').slice(0, 1024);

            const voiceLeaderboardText = topVoiceMembers
                .filter(user => user.member)
                .map((user, index) => {
                    const memberMention = user.member ? user.member.toString() : 'Unbekannt';
                    return `${positionEmojis[index]} » ${memberMention} - **${user.member.user.globalName}**\n> \`${user.timeText}\``;
                })
                .join('\n').slice(0, 1024);

            const currentMonth = getCurrentMonth();

            const InfoEmbed = new EmbedBuilder()
                .setDescription('Die Top 3 Mitglieder in Nachrichten & Voice erhalten\ndie <@&1150753421339676722>-Rolle\n\n> `👷‍♂️` » **Vorteile**\n- Bilder senden in <#815922756918181898>\n- Höher gelistet\n- Ping Reaktion (`/emoji`)\n\n> `📌` » Das Leaderboard wird monatlich zurückgesetzt.')
                .setColor('Orange');

            const messageEmbed = new EmbedBuilder()
                .setAuthor({ name: `» ${currentMonth} Leaderboard - Nachrichten`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772658318479423/8280686.png' })
                .setDescription(messageLeaderboardText)
                .setColor('Blurple')
                .setFooter({ text: '» Zuletzt aktualisiert', iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286773637562630154/image.png' })
                .setTimestamp();

            const voiceEmbed = new EmbedBuilder()
                .setAuthor({ name: `» ${currentMonth} Leaderboard - Voice Zeit`, iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286772303455059988/5808970.png' })
                .setDescription(voiceLeaderboardText)
                .setColor('Blue')
                .setFooter({ text: '» Zuletzt aktualisiert', iconURL: 'https://cdn.discordapp.com/attachments/1269339944766144574/1286773912977408011/image.png' })
                .setTimestamp();

            if (topMessagesMembers[0]?.member) {
                messageEmbed.setThumbnail(topMessagesMembers[0].member.displayAvatarURL({ dynamic: true }));
            }

            if (topVoiceMembers[0]?.member) {
                voiceEmbed.setThumbnail(topVoiceMembers[0].member.displayAvatarURL({ dynamic: true }));
            }

            if (messageId) {
                const leaderboardChannel = await guild.channels.fetch("1286655600440115240");
                const fetchedMessage = await leaderboardChannel.messages.fetch(messageId).catch(() => null);
                if (fetchedMessage) {
                    await fetchedMessage.edit({ embeds: [InfoEmbed, messageEmbed, voiceEmbed] });
                }
            }

            const role = await guild.roles.fetch(RoleID);
            if (role) {
                const membersWithRole = await guild.members.fetch({ role: RoleID });
                membersWithRole.forEach(member => {
                    member.roles.remove(role).catch(err => console.error(`Fehler beim Entfernen der Rolle: ${err}`));
                });
            }

            const roleAssignments = [...topMessagesMembers.slice(0, 3), ...topVoiceMembers.slice(0, 3)].map(async user => {
                if (user.member) {
                    await user.member.roles.add(role).catch(err => console.error(`Fehler beim Hinzufügen der Rolle: ${err}`));
                }
            });
            await Promise.all(roleAssignments);
        } catch (error) {
            console.error('Fehler beim Aktualisieren des Leaderboards:', error);
        }
      }

    setInterval(async () => {
      await updateLeaderboardEmbeds();
    }, 60000);

    const logchannel = client.channels.cache.get("1295742887388254278")
    logchannel.threads.create({
        name: '📌 » Online & Offline Logs', message: { content: `» In diesen Log Kanal werden alle \`Online & Offline Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    logchannel.threads.create({
        name: '⚠️ » Error Logs', message: { content: `» In diesen Log Kanal werden alle \`Error Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    // Bot-Status
client.on('ready', async () => {
  const botId = client.user.id; // Bot-ID

  const onlineEmbed = new EmbedBuilder()
      .setTitle('`🟢` | BOT ONLINE')
      .setDescription(`> **${client.user.displayName}** ist jetzt online.`)
      .setColor('Green')
      .setTimestamp();

  try {
      await sendLog(ThreadIDs.ONLINE, onlineEmbed);
  } catch (error) {
      console.error('Fehler beim Senden des Online-Logs:', error);
  }
});

client.on('shardDisconnect', async (event, shardId) => {
  const botId = client.user.id; // Bot-ID

  const offlineEmbed = new EmbedBuilder()
      .setTitle('`🔴` | BOT OFFLINE')
      .setDescription(`> **${client.user.displayName}** ist offline.`)
      .setColor('Red')
      .setTimestamp();

  try {
      await sendLog(ThreadIDs.OFFLINE, offlineEmbed);
  } catch (error) {
      console.error('Fehler beim Senden des Offline-Logs:', error);
  }
});

client.on('error', async (error) => {
  const errorEmbed = new EmbedBuilder()
      .setTitle('`❌` | FEHLER BEI BOT')
      .setDescription(`\`\`\`${error.message}\`\`\``)
      .setColor('Orange')
      .setTimestamp();

  try {
      await sendLog(ThreadIDs.ERROR, errorEmbed);
  } catch (logError) {
      console.error('Fehler beim Senden des Error-Logs:', logError);
  }
});

    cron.schedule('0 0 1 * *', async () => {
        console.log('Zurücksetzen des monatlichen Leaderboards gestartet.');
        await userdb.updateMany({}, { $set: { 'stats.messages': 0, 'stats.voiceTime': 0 } });
        console.log('Leaderboard wurde monatlich zurückgesetzt.');
        await updateLeaderboardEmbeds();
      });

      const channel = client.channel.cache.get("1295742887388254278")
      channel.threads.create({
          name: '📌 » Online & Offline Logs', message: { content: `» In diesen Log Kanal werden alle \`Online & Offline Logs\` gepostet` }, reason: 'System' })
      .then(threadChannel => console.log(threadChannel))
      .catch(console.error);
  
      channel.threads.create({
          name: '⚠️ » Error Logs', message: { content: `» In diesen Log Kanal werden alle \`Error Logs\` gepostet` }, reason: 'System' })
      .then(threadChannel => console.log(threadChannel))
      .catch(console.error);

    // RSS Feed
    setInterval(async () => {
      processRSSFeed(client, lastEntries);
    }, 60000);

    // Wechsel Status
    setInterval(async () => {
      await guild.members.fetch().then(async (members) => {
        const onlineMembers = await members.filter(
          (member) => !member.user.bot
        );
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
            ).filter(member => !member.user.bot).size.toLocaleString('de-DE') || 0;  // 'de-DE' verwendet Punkt als Tausendertrennzeichen
            const memberCount = await guild.members.cache.size.toLocaleString('de-DE'); // 'de-DE' verwendet Punkt als Tausendertrennzeichen
            const serverData = await serverDB.findOne({ guildID: "815919809379172354" });
            if (!serverData || !serverData.partner || !serverData.partner.partners) {
              console.log(`Keine Partner gefunden`);
            }
            const count = serverData.partner.partners.length;

            const channelCount = {
              '1230540716808343592': 0, // "gratis-spiele"
              '1230540230470144073': 0, // "gaming-news"
              '1230540761708105728': 0, // "mediathek"
              '1230540900439031929': 0, // "welt-news"
            };

            const category = guild.channels.cache.get('1230540006439915610');

            const totalChannels = category ? category.children.cache.size : 0;
            const totalGameChannels = guild.channels.cache.filter(channel => channel.parentId === config.category5).size;

            await guild.channels.cache.get(config.category1).setName(`(🌍) - [INFOS] - (USER: ${memberCount})`)
            await guild.channels.cache.get(config.category2).setName(`(👥) - [UNITY] - (ONLINE: ${onlineMembers})`)
            await guild.channels.cache.get(config.category3).setName(`(⚡) - [ADS] - (PARTNER: ${count})`)
            await guild.channels.cache.get(config.category4).setName(`(📰) - [NEWS] - (ABOS: ${totalChannels})`)
            await guild.channels.cache.get(config.category5).setName(`(🎮) - [MINIGAMES] - (SPIELE: ${totalGameChannels})`);
        }, 30000);

    // Hauptchat Beschreibung
    setInterval(async () => {
      const channel = await client.channels.fetch(config.willkommen);
      const messageData = await messagedb.findOne({ guildID: config.server });

      if (!messageData) return;
      const messages = messageData.messages;
      await channel.setTopic(`<a:7523cursorclick:1007272113830383716> **| KLICK MICH FÜR MEHR INFOS**\n\n𑁉 **${await func.tausender(messages)}** Nachrichten wurden bereits versendet! <a:Chat1:976129450112593990> **Unterhalte dich** ein wenig mit uns!\n\n<a:Information:1007267420316106903> **| __WICHTIGE INFORMATION__**\n» Um eine freundliche Atmosphäre beizubehalten, denke bitte immer daran, dich an unsere **Server-Regeln** zu halten: <#815922286502346773>.\n\n:information_source: | __Du möchtest ein Mitglied melden?__\n» Benutze: **/report <user> <grund>**\n» **Das ausnutzen des Report Befehls wird bestraft!**\n\n:pushpin: » Solltest du **Fragen** haben, zögere nicht und Öffne ein Ticket in <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.`
      );
    }, 1000 * 60 * 5);

    // Bann Liste
    setInterval(async () => {
      const server = await client.guilds.fetch("815919809379172354");
      async function getMemberList(server, roleID) {
        var list = [];
        const role = await server.roles.cache.find((r) => r.id === roleID);
        const rolemember = role.members;

        rolemember.forEach(async (member) => {
          try {
            const banData = await bandb.findOne({ user: member.id });
            list.push(`${member} (\`${banData.reason}\`)`);
          } catch (error) {}
        });
        return list;
      }

      const gebannt = await server.roles.cache.get("886989738244964362");
      const roleCountg = gebannt.members.size;

      const bans = await getMemberList(server, gebannt.id);
      const channel = await server.channels.fetch("1217020305671983205");
      const messages = await channel.messages.fetch();
      const message = await messages.first();
      const bannembed = new EmbedBuilder()
        .setTitle("Information zu den Gebannten Nutzern")
        .setDescription(`Hier ist eine Liste der gebannten Nutzer\n> \`⛔\` 𑁉 <@&886989738244964362> (\`${bans.length}👥\`)\n\n ${bans.length > 0 ? bans.join("\n") : "> Aktuell sind keine Bann-Einträge vorhanden."}`)
        .setColor("Red");

      await message.edit({ embeds: [bannembed] });
    }, 30000);

    cron.schedule("0 0 * * *", async () => {
      const channel = await client.channels.fetch("896743941813207081");

      channel.messages
        .fetch({ limit: 100 })
        .then((messages) => {
          messages.forEach((message) => {
            if (!message.pinned) {
              message.delete().catch(console.error);
            }
          });
        })
        .catch(console.error);
    });

    cron.schedule("0 0 * * *", async () => {
      const guild = await client.guilds.fetch("815919809379172354");
      if (!guild) return console.error('Guild wurde nicht gefunden.');
  
      const roleRemove = guild.roles.cache.find(role => role.id === "1222122625594294272");
      if (!roleRemove) return console.error('Rolle "1222122625594294272" wurde nicht gefunden.');
  
      await guild.members.cache.forEach(async (member) => {
          if (member.roles.cache.has(roleRemove.id)) {
              try {
                  await member.roles.remove(roleRemove);
              } catch (err) {
                  console.error('Fehler beim Entfernen der Rolle:', err);
              }
          }
      });
  });
  },
};

function teamAktivitätReset() {
  cron.schedule("0 0 0 1 * *", async () => {
    const teamMitglieder = await teamdb.find()

    teamMitglieder.forEach(async teamMitglied => {
      teamMitglied.messages = 0;
      await teamMitglied.save()
    })
  })
}
