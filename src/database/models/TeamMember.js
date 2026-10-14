import { defineModel } from "../defineModel.js";

export default defineModel("TeamMember", {
  userID: { type: String, required: true, index: true },
  messages: { type: Number, default: 0 },
  counter: {
    urlaub: { type: Number, default: 0 },
    tasks: { type: Number, default: 0 },
    besprechung: { type: Number, default: 0 },
  },
  urlaub: {
    beginn: String,
    ende: String,
    grund: { type: String, default: "Kein Grund angegeben" },
    messageID: String,
  },
}, { collection: "team-datas" });
