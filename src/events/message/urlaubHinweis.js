import { Events } from "discord.js";
import { handleUrlaubMention } from "#systems/teammanager.js";

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    await handleUrlaubMention(message);
  },
};
