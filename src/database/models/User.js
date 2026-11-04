import { defineModel } from "../defineModel.js";

export default defineModel("User", {
  userID: { type: String, required: true, index: true },
  donation: { type: Number, default: 0 },
  birthday: {
    tag: Number,
    monat: Number,
    jahr: Number,
  },
  reactions: { type: [String], default: [] },
  afk: { type: Boolean, default: false },
  afkReason: { type: String, default: "" },
  afkStamp: { type: String, default: "" },
  giveaway: {
    eventWins: { type: Number, default: 0 },
    toggledm: { type: Boolean, default: true },
    messages: { type: Number, default: 0 },
    voiceTime: { type: Number, default: 0 },
    startTime: { type: Number, default: 0 },
  },
  // counters for giveaway requirements, reset by /gw start
  giveawayProgress: {
    messages: { type: Number, default: 0 },
    voiceTime: { type: Number, default: 0 },
  },
  stats: {
    messages: { type: Number, default: 0 },
    voiceTime: { type: Number, default: 0 },
  },
  erfolge: {
    informant: { type: Number, default: 0 },
    umfragen: { type: Number, default: 0 },
    glueckspilz: { type: Number, default: 0 },
  },
  firstMessage: { type: Boolean, default: false },
  invites: {
    joins: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
  },
  invitedBy: { type: String, default: null },
  onlineTime: { type: Number, default: 0 },
  lastOnline: { type: Date, default: null },
}, { collection: "user-datas" });
