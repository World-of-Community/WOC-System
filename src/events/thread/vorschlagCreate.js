import { Events } from "discord.js";
import { handleThreadCreate } from "#systems/vorschlag.js";

export default {
  name: Events.ThreadCreate,

  async execute(client, thread) {
    await handleThreadCreate(thread);
  },
};
