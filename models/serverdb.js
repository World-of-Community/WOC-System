import Discord from "discord.js";
import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
  },
  adventskalender: {
    messageId: {
      type: String,
    },
    channelId: {
      type: String,
    },
  },
  partner: {
    msg: {
      type: String,
      required: false,
    },
    channel: {
      type: String,
      required: false,
    },
    partners: [{
      name: String,
      category: String,
      ownerID: String,
      invite: String,

    }],
  },
  roleBypass: {
    type: Object,
    required: false,
  },
  deactivated: {
    type: Object,
    required: false,
  },

  updateMessage: {
    type: String,
    required: false,
  },

  updateWeek: {
    type: String,
    required: false,
  },

  support: {
    type: Object,
    required: false,
  },

  system: {
    type: Object,
    required: false,
  },

  gift: {
    type: Object,
    required: false,
  },

  verify: {
    type: Object,
    required: false,
  },

  minecraft: {
    type: Object,
    required: false,
  },
  webseite: {
    type: Object,
    required: false,
  },
  dc: {
    type: Object,
    required: false,
  },
  service: {
    type: Object,
    required: false,
  },
  meetings: [{
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      default: "Keine Beschreibung",
    },
    messageID: {
      type: String,
    },
    reminders: {
      type: [String],
      default: [],
    },
    attendees: {
      type: [String],
      default: [],
    },
    nonAttendees: {
      type: [String],
      default: [],
    },
  }],
});

export default mongoose.model("server-data", serverSchema);
