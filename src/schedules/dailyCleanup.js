import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";
import logger from "#core/logger.js";
import SeasonPass from "#models/SeasonPass.js";
import { getSeasonPassRole } from "#systems/seasonPass.js";

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
  // Remove the Season-Pass role after the paid season has expired.
  {
    name: "seasonPassRoleRemoval",
    cron: "0 0 * * *",

    async execute(client) {
      const guild = await client.guilds.fetch(GUILD_ID);
      const role = getSeasonPassRole(guild);
      if (!role) {
        logger.error(`Season-Pass role not found in guild ${guild.id}`);
        return;
      }

      const expiredPasses = await SeasonPass.find({
        premium: true,
        expiresAt: { $lte: new Date() },
      }).select("userId");

      for (const pass of expiredPasses) {
        const member = await guild.members.fetch(pass.userId).catch(() => null);
        if (member?.roles.cache.has(role.id)) {
          await member.roles.remove(role, "Season-Pass abgelaufen").catch((error) => {
            logger.error(`Could not remove Season-Pass role from ${pass.userId}:`, error?.message ?? error);
          });
        }
        await SeasonPass.updateOne({ _id: pass._id }, { $set: { premium: false, premiumStages: 0 } });
      }
    },
  },
];
