import client from "../index.js";
import { Events, ActivityType, EmbedBuilder, ChannelType, PermissionsBitField } from "discord.js";
import fs from "fs";
import messagedb from "../models/messagedb.js";
import serverDB from "../models/serverdb.js";
import bandb from "../models/bandb.js";
import cron from "node-cron";
import logger from "../functions/logger.js";
import { leaderboardSchedules } from "../functions/leaderboard.js";

client.on(Events.ClientReady, async (client) => {

  let lastEntries = {};
  try {
    const data = fs.readFileSync("json/lastEntries.json");
    lastEntries = JSON.parse(data);
  } catch (error) {
    logger.error("Error loading lastEntries:", error);
  }
  const file = fs.readFileSync("json/config.json", "utf-8");
  const config = JSON.parse(file);

  const guild = await client.guilds.fetch("815919809379172354");

  if (!guild) {
    logger.info("Server wurde nicht gefunden");
    return;
  }
  logger.info("💙  | Verbunden mit Discord");
  leaderboardSchedules(client);

  function getInterval() {
    const hour = new Date().getHours();
    // Nacht: 22:00–08:00 → 5 Minuten
    if (hour >= 22 || hour < 8) {return 300000;}
    // Tag: 2,5 Minuten
    return 150000;
  }

  // =================== STATUS ROTATION ===================
  async function updateStatus() {
    try {
      const onlineMembers = guild.members.cache.filter(m => !m.user.bot);
      if (onlineMembers.size === 0) {return;}

      const randomMember = onlineMembers.random();
      const username = randomMember.displayName;

      const customStatus = `Spielt 💖 | mit ${username}`;
      await client.user.setActivity(customStatus, { type: ActivityType.Playing });
    } catch (err) {
      logger.error("❗  | Status-Update Fehler:", err);
    }

    // nächstes Update
    setTimeout(updateStatus, getInterval());
  }

  // =================== CHANNEL UPDATES ===================
  async function updateChannels() {
    try {
      // Online-Mitglieder zählen
      const onlineMembersCount = guild.members.cache.filter(m =>
        ["online", "idle", "dnd"].includes(m.presence?.status) && !m.user.bot,
      ).size.toLocaleString("de-DE");

      // Gesamt-Mitglieder
      const memberCount = guild.memberCount.toLocaleString("de-DE");

      // Partner-Daten
      const serverData = await serverDB.findOne({ guildID: "815919809379172354" });
      const count = serverData?.partner?.partners?.length || 0;

      // Kategorie-Channel zählen
      const category = guild.channels.cache.get("1230540006439915610");
      const totalChannels = category ? category.children.cache.size : 0;
      const totalGameChannels = guild.channels.cache.filter(c => c.parentId === config.category5).size;

      // Channel-Namen setzen
      // Aktuellen Monat holen (0 = Januar, 11 = Dezember)
      const month = new Date().getMonth();

      // Standard-Emojis
      let emoji1 = "🌍";
      let emoji2 = "👥";

      // Wenn Dezember → Weihnachts-Emojis setzen
      if (month === 11) {
        emoji1 = "🎄";
        emoji2 = "⛄";
      }

      // Kategorien umbenennen
      await guild.channels.cache.get(config.category1) ?.setName(`(${emoji1}) - [INFOS] - (USER: ${memberCount})`);
      await guild.channels.cache.get(config.category2) ?.setName(`(${emoji2}) - [UNITY] - (ONLINE: ${onlineMembersCount})`);

      await guild.channels.cache.get(config.category3)?.setName(`(⚡) - [ADS] - (PARTNER: ${count})`);
      await guild.channels.cache.get(config.category4)?.setName(`(📰) - [NEWS] - (ABOS: ${totalChannels})`);
      await guild.channels.cache.get(config.category5)?.setName(`(🎮) - [MINIGAMES] - (SPIELE: ${totalGameChannels})`);

    } catch (err) {
      logger.error("❗  | Channel-Update Fehler:", err);
    }

    // nächstes Update
    setTimeout(updateChannels, getInterval());
  }

  // =================== START ===================
  setTimeout(updateStatus, getInterval());
  setTimeout(updateChannels, getInterval());

  // Hauptchat Beschreibung
  setInterval(async () => {
    try {
      const channel = await client.channels.fetch(config.willkommen);
      if (!channel) {
        logger.info("Kanal nicht gefunden!");
        return;
      }

      if (channel.type !== ChannelType.GuildText) {
        logger.info("Kein Textkanal!");
        return;
      }

      const perms = channel.permissionsFor(client.user);
      if (!perms?.has(PermissionsBitField.Flags.ManageChannels)) {
        logger.info("Bot hat keine Berechtigung zum Ändern des Themas!");
        return;
      }

      let messageData = await messagedb.findOne({ guildID: config.server });

      if (!messageData) {
        logger.info("Kein Eintrag gefunden, erstelle neuen...");
        messageData = await messagedb.create({ guildID: config.server, messages: 0 });
      }

      if (typeof messageData.messages !== "number") {
        logger.info("Falscher Datentyp für messages, konvertiere...");
        messageData.messages = Number(messageData.messages) || 0;
        await messageData.save();
      }

      const messages = messageData.messages.toLocaleString("de-DE");

      await channel.setTopic(
        "<a:cursorclick:1007272113830383716> **| KLICK MICH FÜR MEHR INFOS**\n\n" +
          `𑁉 **${messages}** Nachrichten wurden bereits versendet! <a:Chat1:976129450112593990> **Unterhalte dich** ein wenig mit uns! - das macht **garantiert Spaß**!\n\n` +
          "<a:Information:1007267420316106903> **| __WICHTIGE INFORMATION__**\n" +
          "» Um eine friedliche Atmosphäre beizubehalten, denke bitte stets daran, dich an unsere **Regeln** zu halten:\n" +
          "<#815922286502346773>\n\n" +
          "📌 » Solltest du **Fragen** haben, dann öffne ein Ticket in <#819555839362072606> und schreibe eine Nachricht mit deinem Anliegen.",
      );

    } catch (err) {
      logger.error("Fehler beim Setzen der Kanalbeschreibung:", err);
    }
  }, 1000 * 60 * 5); // alle 5 Minuten

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
        if (!role) {return list;}

        for (const member of role.members.values()) {
          try {
            const banData = await bandb.findOne({ userId: member.id });
            if (banData) {
              list.push(`${member} - ${member.user.username} (\`${banData.reason}\`)`);
            } else {
              list.push(`${member} - ${member.user.username} (\`Kein Grund angegeben\`)`);
            }
          } catch (error) {
            logger.error(`Fehler bei Ban-Daten für ${member.id}:`, error);
          }
        }
        return list;
      }

      const gebannt = server.roles.cache.get("886989738244964362");
      if (!gebannt) {return logger.info("Rolle für Gebannte nicht gefunden.");}

      const bans = await getMemberList(server, gebannt.id);

      const channel = await server.channels.fetch("1217020305671983205");
      if (!channel) {return logger.info("Kanal nicht gefunden.");}

      const messages = await channel.messages.fetch({ limit: 1 });
      const message = messages.first();
      if (!message) {return logger.info("Keine Nachricht gefunden zum Bearbeiten.");}

      const currentTime = new Date().toLocaleDateString("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

      const bannembed = new EmbedBuilder()
        .setTitle("Information zu den Gebannten Nutzern")
        .setDescription(
          `Hier ist eine Liste der gebannten Nutzer\n> \`⛔\` 𑁉 <@&886989738244964362> (\`${bans.length}👥\`)\n\n` +
              (bans.length > 0 ? bans.join("\n") : "> Aktuell sind keine Bann-Einträge vorhanden."),
        )
        .setColor("Red")
        .setFooter({ text: `» Bann System - Aktualisiert am: ${currentTime}`, iconURL: server.iconURL() })
        .setTimestamp();

      await message.edit({ embeds: [bannembed] });
    } catch (error) {
      logger.error("Fehler im Bann-Update:", error);
    }
  }

  // Timer starten
  scheduleBanUpdate();

  // Globale Variablen zum Speichern von Kanal- und Nachrichten-IDs
  let lastChannelId = null;

  client.once("clientReady", async () => {
    logger.info(`${client.user.tag} ist online!`);

    // Sende die Nachricht, dass der Bot wieder online ist
    if (lastChannelId) {
      try {
        const channel = await client.channels.fetch(lastChannelId);

        if (channel) {
          await channel.send({ text: "> `✅` » Der Bot ist wieder online und einsatzbereit.", ephemeral: true });
        }
      } catch (error) {
        logger.error("Fehler beim Senden der Wieder-Online-Nachricht:", error);
      }

      // Variablen zurücksetzen
      lastChannelId = null;
    }
  });

  cron.schedule("0 0 * * *", async () => {
    const channel = await client.channels.fetch("896743941813207081");

    channel.messages
      .fetch({ limit: 100 })
      .then((messages) => {
        messages.forEach((message) => {
          if (!message.pinned) {
            message.delete().catch(logger.error);
          }
        });
      })
      .catch(logger.error);
  });

  cron.schedule("0 0 * * *", async () => {
    const guild = await client.guilds.fetch("815919809379172354");
    if (!guild) {return logger.error("Guild wurde nicht gefunden.");}

    const roleRemove = guild.roles.cache.find(role => role.id === "1222122625594294272");
    if (!roleRemove) {return logger.error('Rolle "1222122625594294272" wurde nicht gefunden.');}

    await guild.members.cache.forEach(async (member) => {
      if (member.roles.cache.has(roleRemove.id)) {
        try {
          await member.roles.remove(roleRemove);
        } catch (err) {
          logger.error("Fehler beim Entfernen der Rolle:", err);
        }
      }
    });
  });
});
