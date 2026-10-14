import Parser from "rss-parser";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import youtubeDB from "#models/youtubedb.js";
import logger from "#core/logger.js";

const parser = new Parser();

const YOUTUBE_CHANNEL_ID = "UCWp5vSiHFKItdlOH3vmMaOA"; // Red3405
const DISCORD_CHANNEL_ID = "1274833689821319308";
const YOUTUBE_ROLE_ID = "1337362885101359146";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;

// rss-parser returns the id as "yt:video:VIDEOID"
const getVideoId = (item) => item.id.replace("yt:video:", "");

export default {
  name: "youtube",
  cron: "*/5 * * * *",

  async execute(client) {
    const feed = await parser.parseURL(FEED_URL);
    if (!feed.items?.length) {return;}

    const newestVideoId = getVideoId(feed.items[0]);
    const dbEntry = await youtubeDB.findOne({ channelId: YOUTUBE_CHANNEL_ID });

    // first run: remember the newest video so old uploads are not posted
    if (!dbEntry) {
      await youtubeDB.create({ channelId: YOUTUBE_CHANNEL_ID, lastVideoId: newestVideoId });
      return;
    }

    if (dbEntry.lastVideoId === newestVideoId) {return;}

    const lastKnownIndex = feed.items.findIndex((item) => getVideoId(item) === dbEntry.lastVideoId);
    const newVideos = lastKnownIndex === -1 ? [feed.items[0]] : feed.items.slice(0, lastKnownIndex);

    const channel = client.channels.cache.get(DISCORD_CHANNEL_ID);
    if (!channel) {
      logger.error(`YouTube channel ${DISCORD_CHANNEL_ID} not found`);
      return;
    }

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
        new ButtonBuilder().setLabel("Jetzt ansehen").setStyle(ButtonStyle.Link).setURL(videoUrl),
      );

      await channel.send({
        content: `\`🔴\` » **${video.author}** hat ein neues Video hochgeladen, <@&${YOUTUBE_ROLE_ID}>!`,
        embeds: [embed],
        components: [row],
      });
    }

    await youtubeDB.updateOne({ channelId: YOUTUBE_CHANNEL_ID }, { $set: { lastVideoId: newestVideoId } });
  },
};
