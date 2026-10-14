import { Events } from "discord.js";
import logger from "#core/logger.js";
import { GUILD_ID } from "#config";

export default {
  name: Events.ClientReady,
  once: true,

  async execute(client) {
    logger.success(`Logged in as ${client.user.tag}`);

    const guild = await client.guilds.fetch(GUILD_ID).catch(() => null);
    if (!guild) {
      logger.error(`Main guild ${GUILD_ID} not found – is the bot on the server?`);
      return;
    }

    logger.info(`Guild: ${guild.name} (${guild.memberCount.toLocaleString("de-DE")} members)`);
  },
};
