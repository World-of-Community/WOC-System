import { Events } from "discord.js";
import userdb from "#models/User.js";
import logger from "#core/logger.js";
import { updateLeaderboard } from "#systems/leaderboard.js";

export default {
  name: Events.VoiceStateUpdate,

  async execute(client, oldState, newState) {
    const member = newState.member ?? oldState.member;
    if (!member || member.user.bot) {return;}

    const userId = member.user.id;
    const now = Date.now();

    const joined = !oldState.channelId && newState.channelId;
    const left = oldState.channelId && !newState.channelId;

    if (joined) {
      const userData = await userdb.findOne({ userID: userId });
      if (!userData) {
        logger.debug(`No user data for ${userId} on voice join`);
        return;
      }
      userData.giveaway.startTime = now;
      await userData.save();
      return;
    }

    if (!left) {return;}

    const userData = await userdb.findOne({ userID: userId });
    if (!userData) {
      logger.debug(`No user data for ${userId} on voice leave`);
      return;
    }

    const startTime = userData.giveaway.startTime;
    if (!startTime) {return;}

    const duration = now - startTime;
    if (Number.isNaN(duration) || duration < 0) {return;}

    userData.giveaway.voiceTime += duration;
    userData.stats.voiceTime += duration;
    userData.giveaway.startTime = 0;
    await userData.save();

    updateLeaderboard(client).catch((err) => logger.error("Leaderboard update failed:", err));
  },
};
