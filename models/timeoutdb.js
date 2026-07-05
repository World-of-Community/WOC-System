import Discord from "discord.js";
import mongoose from "mongoose";

const timeoutSchema = new mongoose.Schema(
  {
    creator: {
      type: String,
      required: false,
    },
    user: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: false,
    },
    duration: {
      type: Number,
      required: false,
    },
    startTime: {
      type: Number,
      required: false,
    },
    endTime: {
      type: Number,
      required: false,
    },
    proof: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("timeout-schema", timeoutSchema);
