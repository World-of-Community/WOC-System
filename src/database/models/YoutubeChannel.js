import { defineModel } from "../defineModel.js";

export default defineModel("YoutubeChannel", {
  channelId: { type: String, required: true, unique: true },
  lastVideoId: { type: String, required: true },
}, { collection: "youtubechannels" });
