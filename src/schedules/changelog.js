import { EmbedBuilder } from "discord.js";
import serverdb from "#models/serverdb.js";
import { config } from "#config";

const CATEGORIES = [
  { key: "support", name: "> <:Moderator:873823260507262996> - **WOC`👮`SUPPORT (BOT)** - UPDATE" },
  { key: "system", name: "> <a:System:915211580805881876> - **WOC`⚙️`SYSTEM (BOT)** - UPDATE" },
  { key: "minecraft", name: "> <a:MinecraftGrassBlock:872034424181637171> - **MINECRAFT SERVER** - UPDATE" },
  { key: "dc", name: "> <:Discord:912007935616516098> - **DISCORD SERVER** - UPDATE" },
  { key: "webseite", name: "> <a:wocbook:1178664700469317692> - **WEBSEITE** - UPDATE" },
];

const ddmm = (d) => `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;

async function isDeactivated() {
  return Boolean(await serverdb.findOne({ guildID: config.server, deactivated: { $in: ["changelog"] } }));
}

export default [
  // Monday 00:00 – post the weekly changelog embed
  {
    name: "changelogWeekly",
    cron: "0 0 * * 1",

    async execute(client) {
      const channel = client.channels.cache.get(config.changelog);
      if (!channel) {return;}

      let serverData = await serverdb.findOne({ guildID: config.server });
      if (!serverData) {
        serverData = new serverdb({ guildID: config.server });
      }
      for (const { key } of CATEGORIES) {
        if (!serverData[key]) {serverData[key] = [];}
      }
      await serverData.save();

      if (await isDeactivated()) {
        await channel.send({ content: "> `⛔` » Das Changelog System ist momentan deaktiviert." });
        return;
      }

      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 6);
      const week = `${ddmm(today)} - ${ddmm(nextWeek)}`;

      const embed = new EmbedBuilder()
        .setTitle(`<a:Neuigkeiten:1018910061348798564> » UPDATE-WOCHENRÜCKBLICK [${week}]`)
        .setDescription("<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n> In dieser Woche gab es keine Änderung.\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀")
        .setColor("#ff7b00")
        .setImage("https://cdn.discordapp.com/attachments/1539321113010765924/1539321721322999940/image.png?ex=6a8e7651&is=6a8d24d1&hm=792559fcdab06110df061689420a64cc56130f6d70f69be54d4c2f60298dce78&")
        .setFooter({ text: `» Wir wünschen euch viel Spaß mit dem neuen Update! - ${ddmm(today)}.${today.getFullYear()}`, iconURL: client.user.displayAvatarURL() });

      for (const { key, name } of CATEGORIES) {
        const entries = serverData[key] ?? [];
        if (entries.length > 0) {
          embed.addFields({ name, value: entries.join("\n") });
        }
      }

      const msg = await channel.send({ content: "Eine neue Woche, ein neues Glück <a:discordbloblove:855482395325890570>", embeds: [embed] });
      serverData.updateMessage = msg.id;
      serverData.updateWeek = week;
      await serverData.save();
    },
  },
  // Sunday 18:00 – ping the changelog role and reset the week
  {
    name: "changelogPing",
    cron: "0 18 * * 0",

    async execute(client) {
      const channel = client.channels.cache.get(config.changelog);
      const serverData = await serverdb.findOne({ guildID: config.server });
      if (!channel || !serverData) {return;}
      if (await isDeactivated()) {return;}

      if (serverData.updateMessage) {
        const msg = await channel.messages.fetch(serverData.updateMessage).catch(() => null);
        await msg?.reply({ content: `Hier seht ihr die Änderungen **aus dieser Woche**, <@&${config.changelogRole}>!` });
      }

      serverData.updateMessage = "";
      for (const { key } of CATEGORIES) {
        serverData[key] = [];
      }
      await serverData.save();
    },
  },
];
