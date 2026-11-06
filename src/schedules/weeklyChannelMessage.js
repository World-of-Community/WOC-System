import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

const log = logger.child("WeeklyChannelMessage");

export default {
  name: "weeklyChannelMessage",
  interval: 7 * 24 * 60 * 60 * 1000,
  runOnReady: true,

  async execute(client) {
    const channelIds = settings.get("channels.weeklyMessage");
    const content = settings.get("system.weeklyChannelMessage");

    if (channelIds.length === 0 || typeof content !== "string" || !content.trim()) { return; }

    for (const channelId of channelIds) {
      const channel = await client.channels.fetch(channelId).catch((error) => {
        log.warn(`Channel ${channelId} konnte nicht geladen werden:`, error?.message ?? error);
        return null;
      });

      if (!channel?.isTextBased()) {
        log.warn(`Channel ${channelId} ist nicht vorhanden oder kein Textkanal`);
        continue;
      }

      try {
        await channel.send(content);
      } catch (error) {
        log.error(`Nachricht konnte in Channel ${channelId} nicht gesendet werden:`, error);
      }
    }
  },
};
