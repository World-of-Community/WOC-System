import { Events } from "discord.js";
import logger from "#core/logger.js";
import { GUILD_ID } from "#config";
import cron from "node-cron";

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    logger.success(`Logged in as ${client.user.tag}`);

    const GUILD_ID = "815919809379172354";
    
    function getBotNickname() {
      const month = new Date().getMonth() + 1;
    
      if (month === 10) {
        return "WOC🎃System";
      }
    
      if (month === 12) {
        return "WOC🎄System";
      }
    
      return "WOC🌍System";
    }
    
    async function updateBotNickname(client) {
      try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const botMember = await guild.members.fetchMe();
        const nickname = getBotNickname();
    
        if (botMember.nickname !== nickname) {
          await botMember.setNickname(nickname);
          console.log(`Bot-Nickname geändert zu: ${nickname}`);
        }
      } catch (error) {
        console.error("Fehler beim Ändern des Bot-Nicknames:", error);
      }
    }
    
    // Beim Bot-Start aktualisieren
    client.once("ready", async () => {
      await updateBotNickname(client);
    });
    
    // Täglich um 00:00 Uhr deutscher Zeit prüfen
    cron.schedule(
      "0 0 * * *",
      () => updateBotNickname(client),
      { timezone: "Europe/Berlin" },
    );

    const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
    if (!guild) {
      logger.error(`Main guild ${GUILD_ID} not found – is the bot on the server?`);
      return;
    }

    logger.info(`Guild: ${guild.name} (${guild.memberCount.toLocaleString("de-DE")} members)`);
  },
};
