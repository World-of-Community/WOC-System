const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const mongoose = require("mongoose");
const fs = require("fs");
const func = require("../ressources/funktionen");
const messagedb = require("../../Datenbank/messagedb");
const userDB = require("../../Datenbank/userdb");
const serverDB = require("../../Datenbank/serverdb")
const bandb = require("../../Datenbank/bandb");
const internal = require("stream");
const cron = require("node-cron");
const Parser = require("rss-parser");
const parser = new Parser();
const FeedManager = require("../FeedManager");
const { processRSSFeed } = FeedManager;
const cronitor = require('cronitor')('bbfc3034eaee49229dc7d1cfb4b65935');
module.exports = {
  name: Events.ClientReady,
  async execute(client) {
    const monitor = new cronitor.Monitor('System Bot');

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

    // Server Ideen Embed Information Platz

    // Server Feedback Embed Information Platz
    const FeedbackEmbed1 = new EmbedBuilder()
    .setTitle('`💕`-LICH WILLKOMMEN IM FEEDBACK SYSTEM!')
    .setColor("Aqua")
    .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1280172685694996572/WOC_Banner_Information_Feedback.jpg?ex=66d71d38&is=66d5cbb8&hm=e670d89d8ce71bd233967e0227bdeab1c0e63ac97ecff220a8513de0047c4160&');

    const FeedbackEmbed2 = new EmbedBuilder()
    .setTitle('<a:pin:1119708768326914100> - FEEDBACK (FAQ)')
    .setColor("Aqua")
    .setDescription('» In diesem Kanal kannst du **eigene Posts** für **dein Feedback** erstellen, um World Of Community zu unterstützen. Wir bedanken uns bei jedem Feedback - ihr helft uns damit enorm! `💕`\n\n> `❓` - **__WIE REICHE ICH EIN FEEDBACK EIN?__**\n» Du kannst **zuerst nach deinem Feedback suchen**, um zu überprüfen ob Sie jemand schon mal Eingereicht hat. Tippe oben bei der Suche **dein Feedback** ein. Wenn du nichts dazu finden kannst, dann füge eine **Beschreibung** hinzu und klicke anschließend auf \"Post\".\n\n> `❓` - **__WELCHEN TAG MUSS ICH WÄHLEN?__**\n» Du musst von deinem Feedback **einen Tag wählen**. Wähle den Tag, der **dein Feedback am besten beschreibt**.\n\n> `📌` - **__SONST NOCH FRAGEN?__**\n» Solltest du noch **Fragen** haben, zögere nicht und Öffne ein Ticket in ⁠<#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.')
    .setFooter({ text: '» Wir danken jeden für seinen Feedback!', iconURL: 'https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=66a8b123&is=66a75fa3&hm=c1153e75f4971748e8ff2acb4d7f4e86572a2c976bc4661723af16163c0984a6&' })
    .setThumbnail('https://cdn.discordapp.com/attachments/1269339586568388670/1269341245730459749/WOC_Orange.png?ex=66b5a468&is=66b452e8&hm=6849696a3f0e4fe5c35349cbe5d38f6a17c4d83ab03eeabe704f274ede9c7220&');

    const channel = client.channels.cache.get("1275350879054200943")
    channel.threads.create({
      name: 'Einführung & Feedback (FAQ)', message: {  embeds: [FeedbackEmbed1, FeedbackEmbed2] }, reason: 'Feedback System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    // RSS Feed
    setInterval(async () => {
      monitor.ping({message: 'Alive'});
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


            await guild.channels.cache.get(config.category1).setName(`(🌍) - [INFOS] - (USER: ${memberCount})`)
            await guild.channels.cache.get(config.category2).setName(`(👥) - [UNITY] - (ONLINE: ${onlineMembers})`)
            await guild.channels.cache.get(config.category3).setName(`(⚡) - [ADS] - (PARTNER: ${count})`)
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