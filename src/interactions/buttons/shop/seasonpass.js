import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import {
  MAX_STAGE,
  PREMIUM_PLUS_PRICE,
  PREMIUM_PRICE,
  REWARDS,
  buyPremium,
  getActiveSeasonPass,
  redeemReward,
} from "../../../systems/seasonPass.js";

export default {
  id: "seasonpass:",
  prefix: true,

  async run(client, interaction) {
    const [, action, value] = interaction.customId.split(":");
    if (action === "show" || action === "prev" || action === "next") {
      let page;

      if (action === "show") {
        const pass = await getActiveSeasonPass(interaction.user.id);

        page = REWARDS.findLast(
          (reward) => pass.xp >= reward.requiredXp
        )?.stage ?? 1;
      } else {
        page = action === "prev"
          ? Number(value) - 1
          : Number(value) + 1;
      }

      const pageData = await buildPage(
        interaction.user.id,
        Math.max(1, Math.min(MAX_STAGE, page))
      );
      if (action === "show") {
        await interaction.reply({
          ...pageData,
          flags: MessageFlags.Ephemeral,
        });
      } else {
        await interaction.update(pageData);
      }
      return;
    }

    if (action === "redeem") {
      const reward = await redeemReward(interaction.user.id, Number(value));
      await interaction.update(await buildPage(interaction.user.id, Number(value)));
      await interaction.followUp({
        content: `> \`✅\` » Stufe ${reward.stage} eingesammelt: **${reward.amount.toLocaleString("de-DE")} ${reward.type === "coins" ? "Coins" : "XP"}**.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (action === "shop") {
      await interaction.reply({
        ...await buildShop(),
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (action === "buy") {
      const { pass, roleAssigned } = await buyPremium(interaction.user.id, value, interaction.guild);
      await interaction.reply({
        content: `> \`✅\` » Premium aktiviert. Preis: **${value === "plus" ? PREMIUM_PLUS_PRICE : PREMIUM_PRICE}` +
          ` Coins**. ${pass.premiumStages ? `Zusätzliche Stufen: **${pass.premiumStages}**.` : ""}` +
          `${roleAssigned ? " Die Rolle wurde vergeben." : " Die Rolle konnte nicht vergeben werden. Bitte melde dich beim Team."}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};

async function buildPage(userId, page) {
  const pass = await getActiveSeasonPass(userId);
  const reward = REWARDS[page - 1];
  const unlocked = pass.xp >= reward.requiredXp;
  const redeemed = pass.redeemedStages.includes(page);
  const premiumLocked = reward.premium && !pass.premium;
  const status = redeemed
    ? "✅ Bereits eingesammelt"
    : premiumLocked
      ? "💎 Premium erforderlich"
      : unlocked
        ? "🎁 Bereit zum Einsammeln"
        : "🔒 Noch nicht freigeschaltet";

  return {
    embeds: [
      new EmbedBuilder()
        .setColor(reward.premium ? "Gold" : "Blurple")
        .setTitle(`🎟️ SeasonPass – Stufe ${page}/${MAX_STAGE}`)
        .setDescription(
          `**Belohnung:** ${reward.amount.toLocaleString("de-DE")} ${reward.type === "coins" ? "Coins" : "XP"}\n` +
          `**Benötigte XP:** ${reward.requiredXp.toLocaleString("de-DE")}\n` +
          `**Deine XP:** ${pass.xp.toLocaleString("de-DE")}\n\n${status}`,
        )
        .setFooter({
          text: `Season endet ${pass.expiresAt.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}`,
        }),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`seasonpass:prev:${page}`)
          .setEmoji("⬅️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 1),
        new ButtonBuilder()
          .setCustomId(`seasonpass:redeem:${page}`)
          .setLabel("Einsammeln")
          .setStyle(ButtonStyle.Success)
          .setDisabled(!unlocked || premiumLocked || redeemed),
        new ButtonBuilder()
          .setCustomId(`seasonpass:next:${page}`)
          .setEmoji("➡️")
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === MAX_STAGE),
      ),
    ],
  };
}

async function buildShop() {
  return {
    embeds: [
      new EmbedBuilder()
        .setColor("Gold")
        .setTitle("🎟️ SeasonPass Premium")
        .setDescription(
          `**Season Pass Premium**\n${PREMIUM_PRICE.toLocaleString("de-DE")} Coins\n\n` +
          `**Season Pass Premium + 10 Stufen**\n${PREMIUM_PLUS_PRICE.toLocaleString("de-DE")} Coins`,
        ),
    ],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("seasonpass:buy:standard")
          .setLabel(`Premium kaufen (${PREMIUM_PRICE.toLocaleString("de-DE")} Coins)`)
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("seasonpass:buy:plus")
          .setLabel(`Premium + 10 Stufen (${PREMIUM_PLUS_PRICE.toLocaleString("de-DE")} Coins)`)
          .setStyle(ButtonStyle.Primary),
      ),
    ],
  };
}
