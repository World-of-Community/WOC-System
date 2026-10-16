import { ActivityType } from "discord.js";
import serverDB from "#models/Guild.js";
import { reportError } from "#core/errors.js";
import { GUILD_ID } from "#config";
import { settings } from "#core/settings.js";

// slower at night (22:00–08:00) to save rate limit
function nextDelay() {
  const hour = new Date().getHours();
  return hour >= 22 || hour < 8 ? 300_000 : 150_000;
}

async function updateStatus(client) {
  const guild = client.guilds.cache.get(GUILD_ID);
  const members = guild?.members.cache.filter((m) => !m.user.bot);
  if (!members?.size) {return;}

  const username = members.random().displayName;
  await client.user.setActivity(`Spielt 💖 | mit ${username}`, { type: ActivityType.Playing });
}

async function updateChannels(client) {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {return;}

  const onlineCount = guild.members.cache
    .filter((m) => ["online", "idle", "dnd"].includes(m.presence?.status) && !m.user.bot)
    .size.toLocaleString("de-DE");
  const memberCount = guild.memberCount.toLocaleString("de-DE");

  const serverData = await serverDB.findOne({ guildID: GUILD_ID });
  const partnerCount = serverData?.partner?.partners?.length ?? 0;

  const gameChannels = guild.channels.cache.filter((c) => c.parentId === settings.get("categories.minigames")).size;

  const december = new Date().getMonth() === 11;
  const emoji1 = december ? "🎄" : "🌍";
  const emoji2 = december ? "⛄" : "👥";

  await guild.channels.cache.get(settings.get("categories.info"))?.setName(`(${emoji1}) - [INFOS] - (USER: ${memberCount})`);
  await guild.channels.cache.get(settings.get("categories.unity"))?.setName(`(${emoji2}) - [UNITY] - (ONLINE: ${onlineCount})`);
  await guild.channels.cache.get(settings.get("categories.ads"))?.setName(`(⚡) - [ADS] - (PARTNER: ${partnerCount})`);
  await guild.channels.cache.get(settings.get("categories.minigames"))?.setName(`(🎮) - [MINIGAMES] - (SPIELE: ${gameChannels})`);
}

function loop(client, name, fn) {
  let timer;
  const tick = async () => {
    try {
      await fn(client);
    } catch (error) {
      reportError(error, { source: `schedule:${name}` });
    }
    timer = setTimeout(tick, nextDelay());
  };
  timer = setTimeout(tick, nextDelay());
  return () => clearTimeout(timer);
}

export default [
  {
    name: "statusRotation",
    start: (client) => loop(client, "statusRotation", updateStatus),
  },
  {
    name: "channelStats",
    start: (client) => loop(client, "channelStats", updateChannels),
  },
];
