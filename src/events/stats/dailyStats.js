import { Events } from "discord.js";
import { DateTime } from "luxon";
import DailyStat from "#models/DailyStat.js";
import { env } from "#config";

const ZONE = "Europe/Berlin";

// userId -> join timestamp of the current voice session (rebuilt on ready, lost on restart)
const voiceSessions = new Map();

async function bump(inc, guild, max = null) {
  const now = DateTime.now().setZone(ZONE);
  await DailyStat.updateOne(
    { _id: now.toFormat("yyyy-MM-dd") },
    { $inc: inc, $set: { members: guild.memberCount }, ...(max && { $max: max }) },
    { upsert: true },
  );
}

const inVoice = (guild) => guild.voiceStates.cache.filter((v) => v.channelId && !v.member?.user.bot).size;

export default [
  {
    name: Events.GuildMemberAdd,
    async execute(client, member) {
      if (member.guild.id !== env.discord.guildId) {return;}
      await bump({ joins: 1 }, member.guild);
    },
  },
  {
    name: Events.GuildMemberRemove,
    async execute(client, member) {
      if (member.guild.id !== env.discord.guildId) {return;}
      await bump({ leaves: 1 }, member.guild);
    },
  },
  {
    name: Events.MessageCreate,
    async execute(client, message) {
      if (!message.guild || message.author.bot || message.guild.id !== env.discord.guildId) {return;}
      const hour = DateTime.now().setZone(ZONE).hour;
      await bump({ messages: 1, [`hours.${hour}`]: 1 }, message.guild);
    },
  },
  {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
      const guild = client.guilds.cache.get(env.discord.guildId);
      for (const state of guild?.voiceStates.cache.values() ?? []) {
        if (state.channelId && !state.member?.user.bot) {voiceSessions.set(state.id, Date.now());}
      }
    },
  },
  {
    name: Events.VoiceStateUpdate,
    async execute(client, oldState, newState) {
      const member = newState.member ?? oldState.member;
      if (!member || member.user.bot || member.guild.id !== env.discord.guildId) {return;}

      const joined = !oldState.channelId && newState.channelId;
      const left = oldState.channelId && !newState.channelId;

      if (joined) {
        voiceSessions.set(member.id, Date.now());
        await bump({ voiceSessions: 1 }, member.guild, { voicePeak: inVoice(member.guild) });
      } else if (left) {
        const start = voiceSessions.get(member.id);
        voiceSessions.delete(member.id);
        if (!start) {return;}
        await bump({ voiceMinutes: Math.round(((Date.now() - start) / 60_000) * 100) / 100 }, member.guild);
      }
    },
  },
];
