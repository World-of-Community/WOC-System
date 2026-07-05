import mongoose from 'mongoose';

// Schema für YouTube-Kanäle und deren Video-Daten
const youtubeChannelSchema = new mongoose.Schema({
  channelId: { type: String, required: true, unique: true }, // Kanal-ID
  lastVideoId: { type: String, required: true }, // ID des letzten Videos
  videos: [
    {
      title: { type: String, required: true }, // Titel des Videos
      description: { type: String, required: true }, // Beschreibung des Videos
      url: { type: String, required: true }, // URL des Videos
      thumbnail: { type: String, required: true }, // Thumbnail-URL
      channelName: { type: String, required: true }, // Kanalname
    },
  ],
});

export default mongoose.model('YouTubeChannel', youtubeChannelSchema);
