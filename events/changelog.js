import { EmbedBuilder } from "discord.js";
import cron from "node-cron";
import client from "../index.js";
import serverdb from "../models/serverdb.js";
import config from "../json/config.json" with { type: "json" };
import logger from "../functions/logger.js";

// Changelog Embed (jeden Montag um Mitternacht)
cron.schedule("30 20 * * 1", async () => {
  try {
    const channel = await client.channels.cache.get(config.changelog);
    if (!channel) {return;}

    let serverData = await serverdb.findOne({ guildID: config.server });
    if (!serverData) {
      serverData = new serverdb({
        guildID: config.server,
        support: [],
        system: [],
        minecraft: [],
        dc: [],
        webseite: [],
      });
      await serverData.save();
    } else {

      if (!serverData.support) {serverData.support = [];}
      if (!serverData.system) {serverData.system = [];}
      if (!serverData.minecraft) {serverData.minecraft = [];}
      if (!serverData.webseite) {serverData.webseite = [];}
      if (!serverData.dc) {serverData.dc = [];}
      await serverData.save();
    }

    if (await serverdb.findOne({ guildID: config.server, deactivated: { $in: ["changelog"] } })) {
      return channel.send({ content: "> `⛔` » Das Changelog System ist momentan deaktiviert." });
    }

    // Week Date
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 6);

    const todayDate = `${today.getDate().toString().padStart(2, "0")}.${(today.getMonth() + 1).toString().padStart(2, "0")}`;
    const nextWeekDate = `${nextWeek.getDate().toString().padStart(2, "0")}.${(nextWeek.getMonth() + 1).toString().padStart(2, "0")}`;

    const changelogEmbed = new EmbedBuilder()
      .setTitle(`<a:Neuigkeiten:1018910061348798564> » UPDATE-WOCHENRÜCKBLICK [${todayDate} - ${nextWeekDate}]`)
      .setDescription("<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n> In dieser Woche gab es keine Änderung.\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀")
      .setColor("#ff7b00")
      .setImage("https://cdn.discordapp.com/attachments/1269339771420016722/1269340524490260571/WOC_Banner_Update_Wochenruckblick.png")
      .setFooter({ text: `» Wir wünschen euch viel Spaß mit dem neuen Update! - ${todayDate}.${today.getFullYear()}`, iconURL: "https://cdn.discordapp.com/attachments/943859953318371359/1055943224092532846/WOC_Orange.png" });

    // Arrays initialisieren (falls nicht vorhanden) und Daten anzeigen
    const support = serverData.support || [];
    const system = serverData.system || [];
    const minecraft = serverData.minecraft || [];
    const webseite = serverData.webseite || [];
    const discord = serverData.dc || [];

    // Add fields based on serverData
    if (support.length > 0) {
      changelogEmbed.addFields({
        name: "> <:Moderator:873823260507262996> - **WOC`👮`SUPPORT (BOT)** - UPDATE",
        value: `${support.join("\n")}`,
      });
    }

    if (system.length > 0) {
      changelogEmbed.addFields({
        name: "> <a:System:915211580805881876> - **WOC`⚙️`SYSTEM (BOT)** - UPDATE",
        value: `${system.join("\n")}`,
      });
    }

    if (minecraft.length > 0) {
      changelogEmbed.addFields({
        name: "> <a:MinecraftGrassBlock:872034424181637171> - **MINECRAFT SERVER** - UPDATE",
        value: `${minecraft.join("\n")}`,
      });
    }

    if (discord.length > 0) {
      changelogEmbed.addFields({
        name: "> <:Discord:912007935616516098> - **DISCORD SERVER** - UPDATE",
        value: `${discord.join("\n")}`,
      });
    }


    if (webseite.length > 0) {
      changelogEmbed.addFields({
        name: "> <a:wocbook:1178664700469317692> - **WEBSEITE** - UPDATE",
        value: `${webseite.join("\n")}`,
      });
    }

    await channel.send({ content: "Eine neue Woche, ein neues Glück <a:discordbloblove:855482395325890570>", embeds: [changelogEmbed] }).then(async (msg) => {
      serverData.updateMessage = msg.id;
      serverData.updateWeek = `${todayDate} - ${nextWeekDate}`;
      await serverData.save();
    });

  } catch (error) {
    logger.info("Fehler im Cron job:", error);
  }
});


// 18 Uhr Message (Sonntags): Ping zu den Änderungen der Woche
cron.schedule("0 18 * * 0", async () => {
  const channel = client.channels.cache.get(config.changelog);
  const serverData = await serverdb.findOne({ guildID: config.server });

  if (!serverData) {return;}
  if (await serverdb.findOne({ guildID: config.server, deactivated: { $in: ["changelog"] } })) {return;}

  channel.messages.fetch(serverData.updateMessage).then(async (msg) => {
    if (msg) {
      await msg.reply({ content: `Hier seht ihr die Änderungen **aus dieser Woche**, <@&${config.changelogRole}>!` });
    }
  });

  serverData.updateMessage = "";
  serverData.support = [];
  serverData.system = [];
  serverData.minecraft = [];
  serverData.dc = [];
  serverData.webseite = [];

  await serverData.save();

});
