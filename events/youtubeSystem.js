import cron from "node-cron";
import Parser from "rss-parser";
import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";
import client from "../index.js";
import youtubeDB from "../models/youtubedb.js";
import logger from "../functions/logger.js";

const parser = new Parser();

const YOUTUBE_CHANNEL_ID = "UCWp5vSiHFKItdlOH3vmMaOA"; // Red3405
const DISCORD_CHANNEL_ID = "1274833689821319308";
const YOUTUBE_ROLE_ID = "1337362885101359146";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

// Checkt alle 5 Minuten, ob ein neues Vidoe hochgeladen wurde
cron.schedule("*/5 * * * *", async () => {
  try {
    const feed = await parser.parseURL(FEED_URL);
    if (!feed.items || feed.items.length === 0) {return;}

    const dbEntry = await youtubeDB.findOne({ channelId: YOUTUBE_CHANNEL_ID });
    const newestVideoId = getVideoId(feed.items[0]);

    // Erster Lauf: nur das neueste Video speichern, damit keine alten Videos gepostet werden
    if (!dbEntry) {
      await youtubeDB.create({ channelId: YOUTUBE_CHANNEL_ID, lastVideoId: newestVideoId });
      return;
    }

    if (dbEntry.lastVideoId === newestVideoId) {return;}

    // Alle Videos ermitteln, die seit dem letzten bekannten Video hochgeladen wurden
    const lastKnownIndex = feed.items.findIndex(item => getVideoId(item) === dbEntry.lastVideoId);
    const newVideos = lastKnownIndex === -1 ? [feed.items[0]] : feed.items.slice(0, lastKnownIndex);

    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
    if (!channel) {
      logger.error(`YouTube System: Channel mit der ID ${DISCORD_CHANNEL_ID} wurde nicht gefunden.`);
      return;
    }

    // Älteste zuerst posten, damit die Reihenfolge stimmt
    for (const video of newVideos.reverse()) {
      const videoId = getVideoId(video);
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      const embed = new EmbedBuilder()
        .setAuthor({ name: video.author || "YouTube" })
        .setTitle(video.title || "Neues Video")
        .setURL(videoUrl)
        .setImage(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)
        .setColor("Red")
        .setFooter({ text: "» World Of Community - YouTube Benachrichtigung" })
        .setTimestamp(video.pubDate ? new Date(video.pubDate) : new Date());

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("Jetzt ansehen")
          .setStyle(ButtonStyle.Link)
          .setURL(videoUrl),
      );

      await channel.send({
        content: `\`🔴\` » **${video.author}** hat ein neues Video hochgeladen, <@&${YOUTUBE_ROLE_ID}>!`,
        embeds: [embed],
        components: [row],
      });
    }

    await youtubeDB.updateOne(
      { channelId: YOUTUBE_CHANNEL_ID },
      { $set: { lastVideoId: newestVideoId } },
    );
  } catch (error) {
    logger.error("YouTube System: Fehler beim Prüfen auf neue Videos:", error);
  }
});

// rss-parser liefert die Video-ID als "yt:video:VIDEOID" im id-Feld
function getVideoId(item) {
  return item.id.replace("yt:video:", "");
}
