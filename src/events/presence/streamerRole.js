import { Events } from "discord.js";
import { handlePresenceUpdate, syncStreamerStateOnStartup } from "#systems/streamerRole.js";

export default [
  {
    name: Events.PresenceUpdate,
    async execute(client, oldPresence, newPresence) {
      await handlePresenceUpdate(oldPresence, newPresence);
    },
  },
  {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
      await syncStreamerStateOnStartup(client);
    },
  },
];
