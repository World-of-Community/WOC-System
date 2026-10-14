import { Events } from "discord.js";
import { trackFirstMessage } from "#systems/erfolge.js";

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    await trackFirstMessage(message);
  },
};
