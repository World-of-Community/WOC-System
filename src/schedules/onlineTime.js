import userdb from "#models/User.js";
import { GUILD_ID } from "#config";

// +1 online hour for every member that is "online" at the full hour (used by /profil)
export default {
  name: "onlineTime",
  interval: 60 * 60 * 1000,

  async execute(client) {
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {return;}

    const members = await guild.members.fetch();
    const onlineIds = [...members.values()]
      .filter((m) => !m.user.bot && m.presence?.status === "online")
      .map((m) => m.id);

    if (onlineIds.length === 0) {return;}

    await userdb.bulkWrite(onlineIds.map((userID) => ({
      updateOne: { filter: { userID }, update: { $inc: { onlineTime: 1 } }, upsert: true },
    })));
  },
};
