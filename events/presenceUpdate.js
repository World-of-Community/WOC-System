import client from "../index.js";
import { Events } from "discord.js";
import {
  handlePresenceUpdate,
  syncStreamerStateOnStartup,
} from "../functions/streamerRole.js";

client.on(Events.PresenceUpdate, async (oldPresence, newPresence) => {
  await handlePresenceUpdate(oldPresence, newPresence);
});

client.once(Events.ClientReady, async () => {
  await syncStreamerStateOnStartup(client);
});
