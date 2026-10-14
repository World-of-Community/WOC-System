import { defineModel } from "../defineModel.js";

export default defineModel("InviteCache", {
  guildID: { type: String, required: true },
  invites: [{
    code: String,
    uses: Number,
  }],
}, { collection: "invitecaches" });
