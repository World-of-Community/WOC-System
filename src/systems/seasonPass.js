import { randomUUID } from "node:crypto";
import SeasonPass from "../database/models/SeasonPass.js";
import Coin from "../database/models/Coin.js";
import Creator from "../database/models/Creator.js";
import { UserError } from "#core/errors.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

export const PREMIUM_PRICE = 20_000;
export const PREMIUM_PLUS_PRICE = 50_000;
export const SEASON_LENGTH_DAYS = 30;
export const XP_PER_DAY = 100;
export const XP_PER_STREAK_DAY = 150;
export const MAX_STAGE = 100;
const SEASON_PASS_ROLE_NAME = "│🎟️ Season-Pass Besitzer";

export const REWARDS = [
  { stage: 1, type: "coins", amount: 20, premium: false, requiredXp: 150 },
  { stage: 2, type: "xp", amount: 1_000, premium: true, requiredXp: 300 },
  { stage: 3, type: "coins", amount: 45, premium: false, requiredXp: 450 },
  { stage: 4, type: "xp", amount: 1_500, premium: true, requiredXp: 600 },
  { stage: 5, type: "coins", amount: 70, premium: false, requiredXp: 750 },
  { stage: 6, type: "xp", amount: 90, premium: false, requiredXp: 900 },
  { stage: 7, type: "coins", amount: 1_000, premium: true, requiredXp: 1_050 },
  { stage: 8, type: "coins", amount: 110, premium: false, requiredXp: 1_200 },
  { stage: 9, type: "xp", amount: 140, premium: false, requiredXp: 1_350 },
  { stage: 10, type: "xp", amount: 2_000, premium: true, requiredXp: 1_500 },
  { stage: 11, type: "coins", amount: 150, premium: false, requiredXp: 1_650 },
  { stage: 12, type: "xp", amount: 180, premium: false, requiredXp: 1_800 },
  { stage: 13, type: "coins", amount: 220, premium: false, requiredXp: 1_950 },
  { stage: 14, type: "xp", amount: 3_000, premium: true, requiredXp: 2_100 },
  { stage: 15, type: "coins", amount: 260, premium: false, requiredXp: 2_250 },
  { stage: 16, type: "xp", amount: 300, premium: false, requiredXp: 2_400 },
  { stage: 17, type: "coins", amount: 1_500, premium: true, requiredXp: 2_550 },
  { stage: 18, type: "coins", amount: 320, premium: false, requiredXp: 2_700 },
  { stage: 19, type: "xp", amount: 400, premium: false, requiredXp: 2_850 },
  { stage: 20, type: "xp", amount: 5_000, premium: true, requiredXp: 3_000 },
  { stage: 21, type: "coins", amount: 350, premium: false, requiredXp: 3_150 },
  { stage: 22, type: "xp", amount: 450, premium: false, requiredXp: 3_300 },
  { stage: 23, type: "coins", amount: 400, premium: false, requiredXp: 3_450 },
  { stage: 24, type: "xp", amount: 5_500, premium: true, requiredXp: 3_600 },
  { stage: 25, type: "coins", amount: 450, premium: false, requiredXp: 3_750 },
  { stage: 26, type: "xp", amount: 550, premium: false, requiredXp: 3_900 },
  { stage: 27, type: "coins", amount: 2_000, premium: true, requiredXp: 4_050 },
  { stage: 28, type: "coins", amount: 500, premium: false, requiredXp: 4_200 },
  { stage: 29, type: "xp", amount: 650, premium: false, requiredXp: 4_350 },
  { stage: 30, type: "xp", amount: 6_000, premium: true, requiredXp: 4_500 },
  { stage: 31, type: "coins", amount: 550, premium: false, requiredXp: 4_650 },
  { stage: 32, type: "xp", amount: 700, premium: false, requiredXp: 4_800 },
  { stage: 33, type: "coins", amount: 600, premium: false, requiredXp: 4_950 },
  { stage: 34, type: "xp", amount: 7_000, premium: true, requiredXp: 5_100 },
  { stage: 35, type: "coins", amount: 650, premium: false, requiredXp: 5_250 },
  { stage: 36, type: "xp", amount: 800, premium: false, requiredXp: 5_400 },
  { stage: 37, type: "coins", amount: 2_500, premium: true, requiredXp: 5_550 },
  { stage: 38, type: "coins", amount: 700, premium: false, requiredXp: 5_700 },
  { stage: 39, type: "xp", amount: 900, premium: false, requiredXp: 5_850 },
  { stage: 40, type: "xp", amount: 8_000, premium: true, requiredXp: 6_000 },
  { stage: 41, type: "coins", amount: 750, premium: false, requiredXp: 6_150 },
  { stage: 42, type: "xp", amount: 1_000, premium: false, requiredXp: 6_300 },
  { stage: 43, type: "coins", amount: 800, premium: false, requiredXp: 6_450 },
  { stage: 44, type: "xp", amount: 9_000, premium: true, requiredXp: 6_600 },
  { stage: 45, type: "coins", amount: 850, premium: false, requiredXp: 6_750 },
  { stage: 46, type: "xp", amount: 1_100, premium: false, requiredXp: 6_900 },
  { stage: 47, type: "coins", amount: 3_000, premium: true, requiredXp: 7_050 },
  { stage: 48, type: "coins", amount: 900, premium: false, requiredXp: 7_200 },
  { stage: 49, type: "xp", amount: 1_200, premium: false, requiredXp: 7_350 },
  { stage: 50, type: "xp", amount: 10_000, premium: true, requiredXp: 7_500 },
  { stage: 51, type: "coins", amount: 950, premium: false, requiredXp: 7_650 },
  { stage: 52, type: "xp", amount: 1_300, premium: false, requiredXp: 7_800 },
  { stage: 53, type: "coins", amount: 1_000, premium: false, requiredXp: 7_950 },
  { stage: 54, type: "xp", amount: 11_000, premium: true, requiredXp: 8_100 },
  { stage: 55, type: "coins", amount: 1_050, premium: false, requiredXp: 8_250 },
  { stage: 56, type: "xp", amount: 1_400, premium: false, requiredXp: 8_400 },
  { stage: 57, type: "coins", amount: 3_500, premium: true, requiredXp: 8_550 },
  { stage: 58, type: "coins", amount: 1_100, premium: false, requiredXp: 8_700 },
  { stage: 59, type: "xp", amount: 1_500, premium: false, requiredXp: 8_850 },
  { stage: 60, type: "xp", amount: 12_000, premium: true, requiredXp: 9_000 },
  { stage: 61, type: "coins", amount: 1_150, premium: false, requiredXp: 9_150 },
  { stage: 62, type: "xp", amount: 1_600, premium: false, requiredXp: 9_300 },
  { stage: 63, type: "coins", amount: 1_200, premium: false, requiredXp: 9_450 },
  { stage: 64, type: "xp", amount: 13_000, premium: true, requiredXp: 9_600 },
  { stage: 65, type: "coins", amount: 1_250, premium: false, requiredXp: 9_750 },
  { stage: 66, type: "xp", amount: 1_700, premium: false, requiredXp: 9_900 },
  { stage: 67, type: "coins", amount: 4_000, premium: true, requiredXp: 10_050 },
  { stage: 68, type: "coins", amount: 1_300, premium: false, requiredXp: 10_200 },
  { stage: 69, type: "xp", amount: 1_800, premium: false, requiredXp: 10_350 },
  { stage: 70, type: "xp", amount: 14_000, premium: true, requiredXp: 10_500 },
  { stage: 71, type: "coins", amount: 1_350, premium: false, requiredXp: 10_650 },
  { stage: 72, type: "xp", amount: 1_900, premium: false, requiredXp: 10_800 },
  { stage: 73, type: "coins", amount: 1_400, premium: false, requiredXp: 10_950 },
  { stage: 74, type: "xp", amount: 15_000, premium: true, requiredXp: 11_100 },
  { stage: 75, type: "coins", amount: 1_450, premium: false, requiredXp: 11_250 },
  { stage: 76, type: "xp", amount: 2_000, premium: false, requiredXp: 11_400 },
  { stage: 77, type: "coins", amount: 4_500, premium: true, requiredXp: 11_550 },
  { stage: 78, type: "coins", amount: 1_500, premium: false, requiredXp: 11_700 },
  { stage: 79, type: "xp", amount: 2_100, premium: false, requiredXp: 11_850 },
  { stage: 80, type: "xp", amount: 16_000, premium: true, requiredXp: 12_000 },
  { stage: 81, type: "coins", amount: 1_550, premium: false, requiredXp: 12_150 },
  { stage: 82, type: "xp", amount: 2_200, premium: false, requiredXp: 12_300 },
  { stage: 83, type: "coins", amount: 1_600, premium: false, requiredXp: 12_450 },
  { stage: 84, type: "xp", amount: 17_000, premium: true, requiredXp: 12_600 },
  { stage: 85, type: "coins", amount: 1_650, premium: false, requiredXp: 12_750 },
  { stage: 86, type: "xp", amount: 2_300, premium: false, requiredXp: 12_900 },
  { stage: 87, type: "coins", amount: 5_000, premium: true, requiredXp: 13_050 },
  { stage: 88, type: "coins", amount: 1_700, premium: false, requiredXp: 13_200 },
  { stage: 89, type: "xp", amount: 2_400, premium: false, requiredXp: 13_350 },
  { stage: 90, type: "xp", amount: 18_000, premium: true, requiredXp: 13_500 },
  { stage: 91, type: "coins", amount: 1_750, premium: false, requiredXp: 13_650 },
  { stage: 92, type: "xp", amount: 2_500, premium: false, requiredXp: 13_800 },
  { stage: 93, type: "coins", amount: 1_800, premium: false, requiredXp: 13_950 },
  { stage: 94, type: "xp", amount: 19_000, premium: true, requiredXp: 14_100 },
  { stage: 95, type: "coins", amount: 1_850, premium: false, requiredXp: 14_250 },
  { stage: 96, type: "xp", amount: 2_600, premium: false, requiredXp: 14_400 },
  { stage: 97, type: "coins", amount: 5_500, premium: true, requiredXp: 14_550 },
  { stage: 98, type: "coins", amount: 1_900, premium: false, requiredXp: 14_700 },
  { stage: 99, type: "xp", amount: 2_700, premium: false, requiredXp: 14_850 },
  { stage: 100, type: "xp", amount: 20_000, premium: true, requiredXp: 15_000 },
];

export async function getActiveSeasonPass(userId, guild = null) {
  const now = new Date();
  let pass = await SeasonPass.findOne({ userId });
  if (!pass || pass.expiresAt <= now) {
    if (pass?.premium && guild) {
      await removeSeasonPassRole(guild, userId);
    }
    const startedAt = now;
    pass = await SeasonPass.findOneAndUpdate(
      { userId },
      {
        $set: {
          seasonId: randomUUID(),
          startedAt,
          expiresAt: new Date(startedAt.getTime() + SEASON_LENGTH_DAYS * 86400000),
          xp: 0,
          lastActiveDay: null,
          premium: false,
          premiumStages: 0,
          redeemedStages: [],
          creatorCode: null,
        },
        $setOnInsert: { userId },
      },
      { upsert: true, returnDocument: "after" },
    );
  }
  return pass;
}

export async function addDailyXp(userId, date = new Date(), discordUser = null, client = null, guild = null) {
  const pass = await getActiveSeasonPass(userId, guild);
  const day = date.toISOString().slice(0, 10);
  if (pass.lastActiveDay === day) {
    return pass;
  }

  const previous = new Date(date);
  previous.setUTCDate(previous.getUTCDate() - 1);
  const amount = pass.lastActiveDay === previous.toISOString().slice(0, 10)
    ? XP_PER_STREAK_DAY
    : XP_PER_DAY;

  const updated = await SeasonPass.findOneAndUpdate(
    { _id: pass._id, lastActiveDay: { $ne: day } },
    { $inc: { xp: amount }, $set: { lastActiveDay: day } },
    { returnDocument: "after" },
  );

  if (updated && updated.xp > pass.xp && discordUser) {
    await notifySeasonPassLevelUps(client ?? discordUser.client, discordUser, pass.xp, updated.xp);
  }

  return updated ?? pass;
}

async function notifySeasonPassLevelUps(client, user, previousXp, currentXp) {
  const reachedStages = REWARDS.filter(({ requiredXp }) =>
    requiredXp > previousXp && requiredXp <= currentXp,
  );
  if (!reachedStages.length) { return; }

  const stages = reachedStages
    .map(({ stage }) => `**${stage}**`)
    .join(", ");

  try {
    const channelId = settings.get("channels.levelLog");
    const channel = await client?.channels.fetch(channelId).catch(() => null);

    if (!channel) {
      logger.warn(`SeasonPass-Benachrichtigungskanal ${channelId} wurde nicht gefunden.`);
      return;
    }

    await channel.send(
      `<a:cheers:1375558102098776214> **LEVEL-UP!** ${user} hat SeasonPass-Stufe ${stages} erreicht! 🚀 Weiter so! <a:Chat1:976129450112593990>`,
    );
  } catch (error) {
    logger.error(`SeasonPass-Level-Nachricht für ${user.id} im Channel konnte nicht gesendet werden:`, error?.message ?? error);
  }
}

export async function buyPremium(userId, tier, guild) {
  const pass = await getActiveSeasonPass(userId, guild);
  const isPlus = tier === "plus";
  const price = isPlus ? PREMIUM_PLUS_PRICE : PREMIUM_PRICE;
  const stages = 20;

  if (pass.premium && (!isPlus || pass.premiumStages >= 10)) {
    throw new UserError("> `❗` » Du besitzt diese Premium-Erweiterung bereits.");
  }

  const coins = await Coin.findOneAndUpdate(
    { userId, coins: { $gte: price } },
    { $inc: { coins: -price } },
    { returnDocument: "after" },
  );
  if (!coins) {
    throw new UserError(`> \`❗\` » Du benötigst ${price.toLocaleString("de-DE")} Coins.`);
  }

  const creatorRedemption = await import("../database/models/CreatorRedemption.js")
    .then(({ default: CreatorRedemption }) => CreatorRedemption.findOne({ userId }));

  const updated = await SeasonPass.findOneAndUpdate(
    { _id: pass._id },
    {
      $set: {
        premium: true,
        creatorCode: creatorRedemption?.code ?? pass.creatorCode,
        premiumStages: isPlus ? stages / 2 : pass.premiumStages,
      },
      ...(isPlus ? { $inc: { xp: 1_500 } } : {}),
    },
    { returnDocument: "after" },
  );

  if (creatorRedemption) {
    const creator = await Creator.findOneAndUpdate(
      { code: creatorRedemption.code, active: true },
      {
        $inc: {
          sales: 1,
          earned: Math.floor(price * 0.1),
        },
      },
      { returnDocument: "after" },
    );
    if (creator) {
      const commission = Math.max(0, Math.min(100, creator.commission));
      if (commission !== 10) {
        await Creator.findByIdAndUpdate(creator._id, {
          $inc: { earned: Math.floor(price * (commission / 100)) - Math.floor(price * 0.1) },
        });
      }
    }
  }

  const roleAssigned = await assignSeasonPassRole(guild, userId);
  return { pass: updated, roleAssigned };
}

export async function giftPremium(senderId, recipientId, tier, guild) {
  if (senderId === recipientId) {
    throw new UserError("> `❌` » Du kannst den SeasonPass nicht an dich selbst verschenken.");
  }

  const recipientPass = await getActiveSeasonPass(recipientId, guild);
  const isPlus = tier === "plus";
  const price = isPlus ? PREMIUM_PLUS_PRICE : PREMIUM_PRICE;
  const stages = 20;

  if (recipientPass.premium && (!isPlus || recipientPass.premiumStages >= 10)) {
    throw new UserError("> `❗` » Dieser Nutzer besitzt diese Premium-Erweiterung bereits.");
  }

  const coins = await Coin.findOneAndUpdate(
    { userId: senderId, coins: { $gte: price } },
    { $inc: { coins: -price } },
    { returnDocument: "after" },
  );
  if (!coins) {
    throw new UserError(`> \`❗\` » Du benötigst ${price.toLocaleString("de-DE")} Coins.`);
  }

  const updated = await SeasonPass.findOneAndUpdate(
    { _id: recipientPass._id },
    {
      $set: {
        premium: true,
        premiumStages: isPlus ? stages / 2 : recipientPass.premiumStages,
      },
      ...(isPlus ? { $inc: { xp: 1_500 } } : {}),
    },
    { returnDocument: "after" },
  );

  if (!updated) {
    await Coin.findOneAndUpdate({ userId: senderId }, { $inc: { coins: price } });
    throw new UserError("> `❌` » Das Geschenk konnte nicht angewendet werden. Deine Coins wurden zurückerstattet.");
  }

  const roleAssigned = await assignSeasonPassRole(guild, recipientId);
  return { pass: updated, roleAssigned, price };
}

export async function assignSeasonPassRole(guild, userId) {
  if (!guild) {
    logger.error(`Cannot assign Season-Pass role: guild missing for user ${userId}`);
    return false;
  }

  const role = getSeasonPassRole(guild);
  if (!role) {
    logger.error(`Season-Pass role not found in guild ${guild.id}: ${SEASON_PASS_ROLE_NAME}`);
    return false;
  }

  const member = await guild.members.fetch(userId).catch((error) => {
    logger.error(`Could not fetch member ${userId} for Season-Pass role:`, error?.message ?? error);
    return null;
  });
  if (!member) { return false; }

  try {
    await member.roles.add(role, "Season-Pass Premium gekauft");
    return true;
  } catch (error) {
    logger.error(`Could not assign Season-Pass role to ${userId}:`, error?.message ?? error);
    return false;
  }
}

async function removeSeasonPassRole(guild, userId) {
  const role = getSeasonPassRole(guild);
  if (!role) {
    logger.error(`Season-Pass role not found in guild ${guild.id}: ${SEASON_PASS_ROLE_NAME}`);
    return;
  }

  const member = await guild.members.fetch(userId).catch((error) => {
    logger.error(`Could not fetch member ${userId} for Season-Pass role removal:`, error?.message ?? error);
    return null;
  });
  if (!member?.roles.cache.has(role.id)) { return; }

  await member.roles.remove(role, "Season-Pass abgelaufen").catch((error) => {
    logger.error(`Could not remove Season-Pass role from ${userId}:`, error?.message ?? error);
  });
}

export function getSeasonPassRole(guild) {
  const configuredRoleId = settings.get("roles.season-pass");
  return (configuredRoleId && guild.roles.cache.get(configuredRoleId)) ??
    guild.roles.cache.find((candidate) => candidate.name === SEASON_PASS_ROLE_NAME);
}

export async function redeemReward(userId, stage, guild = null) {
  const reward = REWARDS.find((entry) => entry.stage === stage);
  if (!reward) {
    throw new UserError("> `❌` » Diese SeasonPass-Stufe existiert nicht.");
  }

  const pass = await getActiveSeasonPass(userId, guild);
  if (pass.xp < reward.requiredXp) {
    throw new UserError("> `❌` » Diese Belohnung ist noch nicht freigeschaltet.");
  }
  if (reward.premium && !pass.premium) {
    throw new UserError("> `❌` » Für diese Belohnung benötigst du den Premium Pass.");
  }

  const claimed = await SeasonPass.findOneAndUpdate(
    { _id: pass._id, redeemedStages: { $ne: stage } },
    { $push: { redeemedStages: stage } },
    { returnDocument: "after" },
  );
  if (!claimed) {
    throw new UserError("> `❗` » Diese Belohnung wurde bereits eingesammelt.");
  }

  try {
    if (reward.type === "coins") {
      await Coin.findOneAndUpdate({ userId }, { $inc: { coins: reward.amount } }, { upsert: true });
    } else {
      await SeasonPass.findByIdAndUpdate(pass._id, { $inc: { xp: reward.amount } });
    }
  } catch (error) {
    await SeasonPass.findByIdAndUpdate(pass._id, { $pull: { redeemedStages: stage } });
    throw error;
  }
  return reward;
}
