import { defineModel } from "../defineModel.js";

// users who opted in to YouTube upload notifications
export default defineModel("YoutubeNotify", {
  userId: { type: String, required: true, unique: true },
}, { collection: "youtube_notify" });
