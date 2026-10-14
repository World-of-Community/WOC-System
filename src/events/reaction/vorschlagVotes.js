import { Events } from "discord.js";
import { handleVoteChange } from "#systems/vorschlag.js";

export default [
  {
    name: Events.MessageReactionAdd,
    async execute(client, reaction, user) {
      await handleVoteChange(reaction, user);
    },
  },
  {
    name: Events.MessageReactionRemove,
    async execute(client, reaction, user) {
      await handleVoteChange(reaction, user);
    },
  },
];
