import { GUILD_ID, config } from "#config";

const NEUES_MITGLIED_ROLE_ID = "1222122625594294272";

export default [
  // purge unpinned messages in the player-search channel
  {
    name: "spielersuchePurge",
    cron: "0 0 * * *",

    async execute(client) {
      const channel = await client.channels.fetch(config.threads);
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
      const role = guild.roles.cache.get(NEUES_MITGLIED_ROLE_ID);
      if (!role) {throw new Error(`role ${NEUES_MITGLIED_ROLE_ID} not found`);}

      for (const member of role.members.values()) {
        await member.roles.remove(role).catch(() => {});
      }
    },
  },
];
