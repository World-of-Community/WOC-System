const onlineMap = require("../Maps/onlinemap");

module.exports = (client) => {
  setInterval(async () => {
    const guild = client.guilds.cache.get("815919809379172354");
    if (!guild) return;

    const members = await guild.members.fetch();

    members.forEach(member => {
      const status = member.presence?.status;
      if (["online", "idle", "dnd"].includes(status)) {
        const currentHours = onlineMap.get(member.id) || 0;
        onlineMap.set(member.id, currentHours + 1); // +1h (jede Stunde aufrufen)
      }
    });
  }, 60 * 60 * 1000); // alle 1 Stunde
};