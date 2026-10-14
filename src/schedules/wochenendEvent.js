import { EmbedBuilder } from "discord.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

const isFirstFriday = (d) => d.getDay() === 5 && d.getDate() <= 7;

let multiplierActive = false;

export default [
  {
    name: "wochenendEventAnnounce",
    cron: "0 15 * * 5",

    async execute(client) {
      if (!isFirstFriday(new Date())) {return;}

      const channel = await client.channels.fetch(settings.get("channels.events")).catch(() => null);
      if (!channel) {
        logger.warn("Event channel not found");
        return;
      }

      await channel.send({
        embeds: [new EmbedBuilder().setImage("https://cdn.discordapp.com/attachments/1008696596000677998/1337428177487794207/WOC_Banner_Neues_Server_Event.png?ex=690f520d&is=690e008d&hm=62bf01da44ab6d8946820799d984314daee0227eb2ec44c52335b458ba43ac93&")],
      });

      await channel.send(
        "<a:pin:1119708768326914100>  » | **WOCHENEND-EVENT** - <a:Chat1:976129450112593990>\n\n" +
        `Liebe Community, <@&${settings.get("pingRoles.serverEvents")}>\n\n` +
        "Von Freitag bis Sonntag läuft ein **Community-Event**. Schaut vorbei und verbringt gemeinsam eine gute Zeit auf dem Server.\n\n" +
        "Mit freundlichen Grüßen\nEuer **World Of Community**-Team <:pepeheart:974642478055555082>",
      );
    },
  },
  // XP multiplier for the level bot: x2 on the first Friday 15:00, back to x1 Sunday 22:00
  {
    name: "wochenendEventMultiplier",
    interval: 60 * 60 * 1000,

    async execute(client) {
      const now = new Date();
      const hour = now.getHours();

      if (isFirstFriday(now) && hour === 15 && !multiplierActive) {
        multiplierActive = true;
        const channel = await client.channels.fetch(settings.get("channels.levelBotCommands"));
        await channel.send(":?pmulti set 2");
        logger.info("Weekend event: XP multiplier set to 2");
      }

      if (now.getDay() === 0 && hour === 22 && multiplierActive) {
        multiplierActive = false;
        const channel = await client.channels.fetch(settings.get("channels.levelBotCommands"));
        await channel.send(":?pmulti set 1");
        logger.info("Weekend event: XP multiplier reset to 1");
      }
    },
  },
];
