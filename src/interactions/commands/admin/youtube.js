import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, ComponentType } from "discord.js";
import YoutubeNotify from "#models/YoutubeNotify.js";
import YoutubeChannel from "#models/YoutubeChannel.js";
import axios from "axios";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";
import { env } from "#config";
const PLACEHOLDER_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/d/d6/KeinBildVorhanden.jpg";


export default {
  name: "youtube",
  description: "» Schickt das YouTube-Embed. 🔴",
  type: 1,
  default_member_permissions: "8",
  options: [],

  async run(client, interaction) {
    try {
      const { embed, videoUrl } = await getYouTubeEmbed();

      const row = createActionRow(videoUrl);

      const embedMessage = await interaction.channel.send({
        content: "https://www.youtube.com/@Red3405YT",
        embeds: [embed],
        components: [row],
      });

      await interaction.reply({ content: "> Das **YouTube**-Embed wurde erfolgreich gesendet.", ephemeral: true });

      // Component collector für Notification-Toggle
      const collector = embedMessage.createMessageComponentCollector({ componentType: ComponentType.Button });

      collector.on("collect", async i => {
        if (i.customId === "toggle_notify") {
          const userId = i.user.id;

          const existing = await YoutubeNotify.findOne({ userId });

          if (existing) {
            await YoutubeNotify.deleteOne({ userId });
            await i.reply({ content: "> `🔕` Du hast YouTube-Benachrichtigungen **deaktiviert**.", ephemeral: true });
          } else {
            await YoutubeNotify.create({ userId });
            await i.reply({ content: "> `🔔` Du hast YouTube-Benachrichtigungen **aktiviert**.", ephemeral: true });
          }
        }
      });

      // Embed alle 60 Sekunden aktualisieren
      setInterval(async () => {
        try {
          const { embed: updatedEmbed, videoUrl: updatedVideoUrl, channelName: updatedChannelName, isNewVideo, previousVideo } = await getYouTubeEmbed();

          const updatedRow = createActionRow(updatedVideoUrl);

          if (isNewVideo) {
            // Sende Nachricht für das neue Video
            await interaction.channel.send({
              content: `> <@&${settings.get("pingRoles.youtube")}> Ein neues Video von **${updatedChannelName}** ist verfügbar!`,
              embeds: [updatedEmbed],
              components: [updatedRow],
            });

            // Erstelle Thread für das vorherige Video
            if (previousVideo) {
              const threadName = `Diskussion: ${previousVideo.title}`;
              const thread = await interaction.channel.threads.create({
                name: threadName,
                autoArchiveDuration: 60,
                reason: "Diskussion zum vorherigen Video",
              });

              const previousEmbed = new EmbedBuilder()
                .setAuthor({ name: previousVideo.channelName || "YouTube" })
                .setTitle(previousVideo.title || "Vorheriges Video")
                .setDescription(previousVideo.description || "Beschreibung nicht verfügbar.")
                .setColor("Red")
                .setImage(previousVideo.thumbnail || PLACEHOLDER_IMAGE)
                .setURL(previousVideo.url || "https://www.youtube.com");

              await thread.send({ embeds: [previousEmbed] });
            }
          }

          await embedMessage.edit({
            content: "https://www.youtube.com/@Red3405YT",
            embeds: [
              updatedEmbed.setFooter({ text: "Zuletzt aktualisiert:" }).setTimestamp(),
            ],
            components: [updatedRow],
          });
        } catch (error) {
          logger.error("Fehler beim Aktualisieren des Embeds:", error);
        }
      }, 60000);

    } catch (error) {
      logger.error("Fehler beim Senden des YouTube-Embeds:", error);
      await interaction.reply({ content: `> \`❌\` » Fehler beim Laden des YouTube-Embeds.\n\n**${error.message}**`, ephemeral: true });
    }
  },
};

async function getYouTubeEmbed() {
  const channels = await YoutubeChannel.find().lean();

  const latestVideos = [];

  for (const { channelId, lastVideoId } of channels) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${env.youtube.apiKey}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=1`;

    try {
      const searchResponse = await axios.get(searchUrl);
      const latestVideo = searchResponse.data.items[0];

      if (!latestVideo) {continue;}

      const videoId = latestVideo.id.videoId;

      // Hole zusätzliche Video-Details
      const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${env.youtube.apiKey}&id=${videoId}&part=contentDetails,snippet`;
      const videoDetailsResponse = await axios.get(videoDetailsUrl);
      const videoDetails = videoDetailsResponse.data.items[0];

      const publishedAt = videoDetails.snippet.publishedAt;
      const durationISO = videoDetails.contentDetails.duration;

      const publishedAtUnix = Math.floor(new Date(publishedAt).getTime() / 1000);
      const durationSeconds = parseISODuration(durationISO);

      const videoData = {
        title: videoDetails.snippet.title,
        description: videoDetails.snippet.description,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail: videoDetails.snippet.thumbnails.medium.url,
        channelName: videoDetails.snippet.channelTitle,
        videoId,
        publishedAtUnix,
        durationSeconds,
      };

      let isNewVideo = false;
      let previousVideo = null;

      if (videoId !== lastVideoId) {
        isNewVideo = true;

        // Hole Daten des vorherigen Videos
        if (lastVideoId) {
          const previousUrl = `https://www.googleapis.com/youtube/v3/videos?key=${env.youtube.apiKey}&id=${lastVideoId}&part=snippet`;
          const previousResponse = await axios.get(previousUrl);
          const previousVideoData = previousResponse.data.items[0];

          if (previousVideoData) {
            previousVideo = {
              title: previousVideoData.snippet.title,
              description: previousVideoData.snippet.description,
              url: `https://www.youtube.com/watch?v=${lastVideoId}`,
              thumbnail: previousVideoData.snippet.thumbnails.medium.url,
              channelName: previousVideoData.snippet.channelTitle,
            };
          }
        }

        await YoutubeChannel.updateOne({ channelId }, { $set: { lastVideoId: videoId } });
      }

      latestVideos.push({ ...videoData, isNewVideo, previousVideo });
    } catch (error) {
      logger.error(`Fehler beim Abrufen der Videos von Kanal ${channelId}:`, error);
    }
  }

  if (latestVideos.length === 0) {
    return {
      embed: new EmbedBuilder()
        .setTitle("Noch kein Video verfügbar")
        .setDescription("Sobald ein neues Video hochgeladen wird, erscheint es hier!")
        .setColor("Red")
        .setImage(PLACEHOLDER_IMAGE)
        .setURL("https://www.youtube.com"),
      videoUrl: "https://www.youtube.com",
      videoId: null,
      channelName: null,
      isNewVideo: false,
      previousVideo: null,
    };
  }

  const video = latestVideos[0];

  const embed = new EmbedBuilder()
    .setAuthor({ name: video.channelName || "YouTube" })
    .setTitle(video.title || "Noch kein Video verfügbar")
    .setDescription(video.description || "Sobald ein neues Video hochgeladen wird, erscheint es hier!")
    .addFields(
      { name: "Veröffentlicht am", value: `<t:${video.publishedAtUnix}:f>`, inline: true },
      { name: "Dauer", value: `<t:${video.durationSeconds}:t>`, inline: true },
    )
    .setColor("Red")
    .setImage(video.thumbnail || PLACEHOLDER_IMAGE)
    .setURL(video.url || "https://www.youtube.com");

  return {
    embed,
    videoUrl: video.url,
    videoId: video.videoId,
    channelName: video.channelName,
    isNewVideo: video.isNewVideo,
    previousVideo: video.previousVideo,
  };
}

function createActionRow(videoUrl) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("toggle_notify")
      .setLabel("Benachrichtigung an/aus")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setLabel("Jetzt ansehen")
      .setStyle(ButtonStyle.Link)
      .setURL(videoUrl || "https://www.youtube.com"),
  );
}

// Funktion zum Parsen der ISO 8601-Dauer in Sekunden
function parseISODuration(duration) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  const hours = parseInt(matches[1]) || 0;
  const minutes = parseInt(matches[2]) || 0;
  const seconds = parseInt(matches[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

