import { defineModel } from "../defineModel.js";

export default defineModel("Thread", {
  threadID: { type: String, required: true },
  creator: { type: String, required: true },
  createdAt: { type: Date, required: true },
}, { collection: "thread-datas" });
