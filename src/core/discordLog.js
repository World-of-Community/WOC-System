import client from "#client";
import logger from "./logger.js";
import { GUILD_ID, CHANNELS, LOG_THREADS } from "#config";

export const ThreadIDs = LOG_THREADS;

// Never throws – logging must not break the caller.
export async function sendLog(threadID, embed) {
  try {
    if (!client.isReady()) {return false;}

    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {throw new Error("guild not in cache");}

    const thread =
      guild.channels.cache.get(CHANNELS.SERVER_LOGS)?.threads.cache.get(threadID)
      ?? guild.channels.cache.get(CHANNELS.BOT_STATUS)?.threads.cache.get(threadID)
      ?? await guild.channels.fetch(threadID).catch(() => null);

    if (!thread || !thread.isThread()) {throw new Error(`log thread ${threadID} not found`);}

    await thread.send({ embeds: [embed] });
    return true;
  } catch (error) {
    logger.error(`sendLog(${threadID}) failed:`, error?.message ?? error);
    return false;
  }
}
