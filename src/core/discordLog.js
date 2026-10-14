import client from "#client";
import logger from "./logger.js";
import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";

// Never throws – logging must not break the caller.
export async function sendLog(threadID, embed) {
  try {
    if (!client.isReady()) {return false;}

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {throw new Error("guild not in cache");}

    const thread =
      guild.channels.cache.get(settings.get("channels.serverLogs"))?.threads.cache.get(threadID)
      ?? guild.channels.cache.get(settings.get("channels.botStatus"))?.threads.cache.get(threadID)
      ?? await guild.channels.fetch(threadID).catch(() => null);

    if (!thread || !thread.isThread()) {throw new Error(`log thread ${threadID} not found`);}

    await thread.send({ embeds: [embed] });
    return true;
  } catch (error) {
    logger.error(`sendLog(${threadID}) failed:`, error?.message ?? error);
    return false;
  }
}
