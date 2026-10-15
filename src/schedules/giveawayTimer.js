import { EmbedBuilder } from "discord.js";
import giveawaydb from "#models/Giveaway.js";
import userdb from "#models/User.js";
import logger from "#core/logger.js";
import { reportError } from "#core/errors.js";

const GIFT_THUMBNAIL = "https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif";

function prizeEmoji(priceInput) {
  const input = (priceInput ?? "").toLowerCase();
  if (input.includes("nitro") && input.includes("basic")) {return "<a:basic:1186636165567229972>";}
  if (input.includes("nitro")) {return "<a:nitro:1186636151335944283>";}
  if (input.includes("guthaben")) {return "<a:guthaben:1186636139281530970>";}
  if (input.includes("coins")) {return coins < 10000 ? "🪙" : "💰";}
  return "<a:Diamond:1018911546430210128>";
}

function pickWinners(participants, count) {
  const pool = [...participants];
  const winners = [];
  while (winners.length < count && pool.length > 0) {
    const [id] = pool.splice(Math.floor(Math.random() * pool.length), 1);
    winners.push(id);
  }
  return winners;
}

async function endGiveaway(client, giveaway) {
  giveaway.endTime = new Date();
  await giveaway.save();

  const channel = await client.channels.fetch(giveaway.channelID).catch(() => null);
  const giveawayMessage = await channel?.messages.fetch(giveaway.msgID).catch(() => null);
  if (!giveawayMessage) {
    logger.warn(`Giveaway ${giveaway.msgID}: channel or message not found`);
    return;
  }

  const title = giveawayMessage.embeds[0]?.title;
  const footer = { text: `${client.user.displayName} - Bot`, iconURL: client.user.displayAvatarURL() };

  if (giveaway.teilnehmer.length < giveaway.gewinnerAnzahl) {
    const cancelledEmbed = new EmbedBuilder()
      .setTitle(title || "Gewinnspiel Abgebrochen")
      .setDescription(
        "<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Abgebrochen__**\n" +
        `<:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**\n` +
        "<:PfeilBlau:1147248395837247613> Status: **`Zu wenig Teilnehmer`**\n" +
        `<:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`,
      )
      .setColor("Red")
      .setFooter(footer)
      .setTimestamp();

    await giveawayMessage.edit({ content: "⛔ **GEWINNSPIEL ABGEBROCHEN!** ⛔", embeds: [cancelledEmbed], components: [] });
    await giveawayMessage.reply({
      content: `\`⛔\` » **Gewinnspiel abgebrochen:** Es fehlten \`${giveaway.gewinnerAnzahl - giveaway.teilnehmer.length}👥\` Teilnehmer!`,
    });
    return;
  }

  const winnerIds = pickWinners(giveaway.teilnehmer, giveaway.gewinnerAnzahl);
  const emoji = prizeEmoji(giveaway.price);
  const winnersMentions = winnerIds.map((id) => `<@${id}>`).join(", ");

  await giveawayMessage.reply({
    content: `<a:bier:1196502621427601498> **Herzlichen Glückwunsch**, ${winnersMentions} ${winnerIds.length === 1 ? "hat" : "haben"} ${emoji} **${giveaway.price}** ${emoji} gewonnen! <a:2herzen:1196502635465932984>`,
  });

  for (const winnerId of winnerIds) {
    const userData = await userdb.findOne({ userID: winnerId });
    if (userData) {
      if (!userData.giveaway) {userData.giveaway = { eventWins: 0 };}
      userData.giveaway.eventWins += 1;
      await userData.save();
    }

    const winner = await client.users.fetch(winnerId).catch(() => null);
    if (winner) {
      const embed = new EmbedBuilder()
        .setTitle("<a:Cool:915211628755169301> » GEWINNSPIEL GEWONNEN! <a:Cool:915211628755169301>")
        .setDescription("» Du hast bei dem Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** gewonnen!\n» Ein Teammitglied wird sich **demnächst** bei dir melden.")
        .setColor("Blurple");
      await winner.send({ content: "Du hast bei einem Gewinnspiel **GEWONNEN!!!**", embeds: [embed] }).catch(() => {});
    }
  }

  const endEmbed = new EmbedBuilder()
    .setTitle(title || "Gewinnspiel Beendet")
    .setDescription(`<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Gewinner__**\n<:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**\n<:PfeilBlau:1147248395837247613> Gewinner: ${winnersMentions}\n<:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`)
    .setColor("Red")
    .setThumbnail(GIFT_THUMBNAIL)
    .setFooter(footer)
    .setTimestamp();

  await giveawayMessage.edit({ content: "⛔ **GEWINNSPIEL VORBEI!** ⛔", embeds: [endEmbed], components: [] });

  const creator = await client.users.fetch(giveaway.creator).catch(() => null);
  if (creator) {
    const creatorEmbed = new EmbedBuilder()
      .setTitle("<a:Information:1007267420316106903> » GEWINNSPIEL VORBEI!")
      .setDescription("`✅` » Das Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** ist vorbei!\n`📌` » Da du das Event gestartet hast, habe ich **dich informiert.**\n\n`💸` » **Zahle das Gewinnspiel** selbst aus, oder kümmere dich\n`💸` » darum, dass es die zuständige Person erledigt.")
      .setColor("Orange");
    await creator.send({ embeds: [creatorEmbed] }).catch(() => {});
  }
}

export default {
  name: "giveawayTimer",
  interval: 30_000,

  async execute(client) {
    const now = Date.now();
    const activeGiveaways = await giveawaydb.find({ endTime: null });

    for (const giveaway of activeGiveaways) {
      if (new Date(giveaway.startTime).getTime() + giveaway.duration > now) {continue;}
      await endGiveaway(client, giveaway).catch((error) => reportError(error, { source: `giveawayTimer:${giveaway.msgID}` }));
    }
  },
};
