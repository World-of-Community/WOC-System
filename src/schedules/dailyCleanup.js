import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";

export default [
  // purge unpinned messages in the player-search channel
  {
    name: "spielersuchePurge",
    cron: "0 0 * * *",

    async execute(client) {
      const channel = await client.channels.fetch(settings.get("channels.playerSearch"));
      const messages = await channel.messages.fetch({ limit: 100 });
      for (const message of messages.values()) {
        if (!message.pinned) {
          await message.delete().catch(() => {});
        }
      }
    },
  },
  // "Neues Mitglied" role is only meant for the first day
  {
    name: "newMemberRoleRemoval",
    cron: "0 0 * * *",

    async execute(client) {
      const guild = await client.guilds.fetch(GUILD_ID);
      const role = guild.roles.cache.get(settings.get("roles.newMember"));
      if (!role) {throw new Error(`role ${settings.get("roles.newMember")} not found`);}

      for (const member of role.members.values()) {
        await member.roles.remove(role).catch(() => {});
      }
    },
  },
];
