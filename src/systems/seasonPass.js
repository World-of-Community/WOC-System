import { randomUUID } from "node:crypto";
import SeasonPass from "../database/models/SeasonPass.js";
import Coin from "../database/models/Coin.js";
import Creator from "../database/models/Creator.js";
import { UserError } from "#core/errors.js";

export const PREMIUM_PRICE = 20_000;
export const PREMIUM_PLUS_PRICE = 50_000;
export const SEASON_LENGTH_DAYS = 30;
export const XP_PER_DAY = 100;
export const XP_PER_STREAK_DAY = 150;
export const MAX_STAGE = 20;

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
];

export async function getActiveSeasonPass(userId) {
  const now = new Date();
  let pass = await SeasonPass.findOne({ userId });
  if (!pass || pass.expiresAt <= now) {
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

export async function addDailyXp(userId, date = new Date()) {
  const pass = await getActiveSeasonPass(userId);
  const day = date.toISOString().slice(0, 10);
  if (pass.lastActiveDay === day) {
    return pass;
  }

  const previous = new Date(date);
  previous.setUTCDate(previous.getUTCDate() - 1);
  const amount = pass.lastActiveDay === previous.toISOString().slice(0, 10)
    ? XP_PER_STREAK_DAY
    : XP_PER_DAY;

  return SeasonPass.findOneAndUpdate(
    { _id: pass._id, lastActiveDay: { $ne: day } },
    { $inc: { xp: amount }, $set: { lastActiveDay: day } },
    { returnDocument: "after" },
  );
}

export async function buyPremium(userId, tier) {
  const pass = await getActiveSeasonPass(userId);
  const isPlus = tier === "plus";
  const price = isPlus ? PREMIUM_PLUS_PRICE : PREMIUM_PRICE;
  const stages = 20;

  if (pass.premium && (!isPlus || pass.premiumStages >= 10)) {
    throw new UserError("Du besitzt diese Premium-Erweiterung bereits.");
  }

  const coins = await Coin.findOneAndUpdate(
    { userId, coins: { $gte: price } },
    { $inc: { coins: -price } },
    { returnDocument: "after" },
  );
  if (!coins) {
    throw new UserError(`Du benötigst ${price.toLocaleString("de-DE")} Coins.`);
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

  return updated;
}

export async function redeemReward(userId, stage) {
  const reward = REWARDS.find((entry) => entry.stage === stage);
  if (!reward) {
    throw new UserError("Diese SeasonPass-Stufe existiert nicht.");
  }

  const pass = await getActiveSeasonPass(userId);
  if (pass.xp < reward.requiredXp) {
    throw new UserError("Diese Belohnung ist noch nicht freigeschaltet.");
  }
  if (reward.premium && !pass.premium) {
    throw new UserError("Für diese Belohnung benötigst du den Premium Pass.");
  }

  const claimed = await SeasonPass.findOneAndUpdate(
    { _id: pass._id, redeemedStages: { $ne: stage } },
    { $push: { redeemedStages: stage } },
    { returnDocument: "after" },
  );
  if (!claimed) {
    throw new UserError("Diese Belohnung wurde bereits eingesammelt.");
  }

  if (reward.type === "coins") {
    await Coin.findOneAndUpdate({ userId }, { $inc: { coins: reward.amount } }, { upsert: true });
  } else {
    await SeasonPass.findByIdAndUpdate(pass._id, { $inc: { xp: reward.amount } });
  }
  return reward;
}
