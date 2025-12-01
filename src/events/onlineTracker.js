const userDB = require("../../Datenbank/userdb");

const TRACK_INTERVAL = 1000 * 60 * 60; // 1 Stunde

async function trackOnlineTime(client) {
  setInterval(async () => {
    const guild = await client.guilds.fetch("DEINE_GUILD_ID");
    const members = await guild.members.fetch();

    for (const member of members.values()) {
      if (member.user.bot) {continue;}

      const status = member.presence?.status ?? "offline";
      const isOnline =
        status === "online" || status === "dnd" || status === "idle";

      if (isOnline) {
        await userDB.updateOne(
          { userId: member.id },
          { $inc: { onlineTime: 1 } },
          { upsert: true },
        );
      }
    }
  }, TRACK_INTERVAL);
}

module.exports = trackOnlineTime;
