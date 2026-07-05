import client from "../index.js";
import userdb from "../models/userdb.js";

// Onlinezeit (Profil.js)
setInterval(async () => {
  const guild = client.guilds.cache.get("815919809379172354");
  const members = await guild.members.fetch();

  for (const member of members.values()) {
    if (member.user.bot) {continue;}
    if (!member.presence || member.presence.status !== "online") {continue;}

    await userdb.updateOne(
      { userID: member.id },
      { $inc: { onlineTime: 1 } },
      { upsert: true },
    );
  }
}, 1000 * 60 * 60); // alle 60 Minuten
