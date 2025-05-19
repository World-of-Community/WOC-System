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
const { leaderboardSchedules } = require("../../functions/leaderboard");
const { processRSSFeed } = FeedManager;

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

    leaderboardSchedules(client)

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
        }, 60000); // 1 Minute

    // Hauptchat Beschreibung
    setInterval(async () => {
      const channel = await client.channels.fetch(config.willkommen);
      const messageData = await messagedb.findOne({ guildID: config.server });

      if (!messageData) return;
      const messages = messageData.messages;
      await channel.setTopic(`<a:7523cursorclick:1007272113830383716> **| KLICK MICH FÜR MEHR INFOS**\n\n𑁉 **${await func.tausender(messages)}** Nachrichten wurden bereits versendet! <a:Chat1:976129450112593990> **Unterhalte dich** ein wenig mit uns!\n\n<a:Information:1007267420316106903> **| __WICHTIGE INFORMATION__**\n» Um eine freundliche Atmosphäre beizubehalten, denke bitte immer daran, dich an unsere **Server-Regeln** zu halten: <#815922286502346773>.\n\n:information_source: | __Du möchtest ein Mitglied melden?__\n» Benutze: **/report <user> <grund>**\n» **Das ausnutzen des Report Befehls wird bestraft!**\n\n:pushpin: » Solltest du **Fragen** haben, zögere nicht und Öffne ein Ticket in <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.`
      );
    }, 1000 * 60 * 5);


    // Ban Liste
    function scheduleBanUpdate() {
  const now = new Date();
  const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();

  setTimeout(() => {
    runBanUpdate(); // Update einmal direkt zur vollen Minute starten

    // Ab jetzt jede Minute synchron laufen lassen
    setInterval(runBanUpdate, 60 * 1000);
  }, msUntilNextMinute);
}

async function runBanUpdate() {
  try {
    const server = await client.guilds.fetch("815919809379172354");

    async function getMemberList(server, roleID) {
      const list = [];
      const role = server.roles.cache.get(roleID);
      if (!role) return list;

      for (const member of role.members.values()) {
        try {
          const banData = await bandb.findOne({ userId: user });
          if (banData) {
            list.push(`${member} - ${member.user.username} (\`${banData.reason}\`)`);
          } else {
            list.push(`${member} - ${member.user.username} (\`Kein Grund angegeben\`)`);
          }
        } catch (error) {
          console.error(`Fehler bei Ban-Daten für ${member.id}:`, error);
        }
      }
      return list;
    }

    const gebannt = server.roles.cache.get("886989738244964362");
    if (!gebannt) return console.log("Rolle für Gebannte nicht gefunden.");

    const bans = await getMemberList(server, gebannt.id);

    const channel = await server.channels.fetch("1217020305671983205");
    if (!channel) return console.log("Kanal nicht gefunden.");

    const messages = await channel.messages.fetch({ limit: 1 });
    const message = messages.first();
    if (!message) return console.log("Keine Nachricht gefunden zum Bearbeiten.");

    const currentTime = new Date().toLocaleDateString('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const bannembed = new EmbedBuilder()
      .setTitle("Information zu den Gebannten Nutzern")
      .setDescription(
        `Hier ist eine Liste der gebannten Nutzer\n> \`⛔\` 𑁉 <@&886989738244964362> (\`${bans.length}👥\`)\n\n` +
          (bans.length > 0 ? bans.join("\n") : "> Aktuell sind keine Bann-Einträge vorhanden.")
      )
      .setColor("Red")
      .setFooter({ text: `» Bann System - Aktualisiert am: ${currentTime}`, iconURL: server.iconURL() })
      .setTimestamp();

    await message.edit({ embeds: [bannembed] });
  } catch (error) {
    console.error("Fehler im Bann-Update:", error);
  }
}

// Timer starten
scheduleBanUpdate();

    // Globale Variablen zum Speichern von Kanal- und Nachrichten-IDs
    let lastChannelId = null;
    let lastMessageId = null;

    client.once('ready', async () => {
        console.log(`${client.user.tag} ist online!`);

    // Sende die Nachricht, dass der Bot wieder online ist
    if (lastChannelId) {
        try {
            const channel = await client.channels.fetch(lastChannelId);

            if (channel) {
                await channel.send({ text: '> `✅` » Der Bot ist wieder online und einsatzbereit.', ephemeral: true });
            }
        } catch (error) {
            console.error('Fehler beim Senden der Wieder-Online-Nachricht:', error);
        }

        // Variablen zurücksetzen
        lastChannelId = null;
        lastMessageId = null;
    }
});

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
