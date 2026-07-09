import { EmbedBuilder } from "discord.js";
import client from "../index.js";
import giveawaydb from "../models/giveawaydb.js";
import userdb from "../models/userdb.js";
import logger from "../functions/logger.js";

// Prüft alle 30 Sekunden, ob Gewinnspiele abgelaufen sind, und lost die Gewinner aus
setInterval(async () => {
  const currentTime = new Date();
  const activeGiveaways = await giveawaydb.find({ endTime: null });
  if (!activeGiveaways) {return;}

  for (const giveaway of activeGiveaways) {
    const startTime = new Date(giveaway.startTime);
    if (startTime.getTime() + giveaway.duration <= currentTime.getTime()) {
      if (giveaway.endTime) {continue;}
      giveaway.endTime = new Date();
      await giveaway.save();

      if (giveaway.teilnehmer.length < giveaway.gewinnerAnzahl) {
        const channel = await client.channels.fetch(giveaway.channelID);
        const giveawayMessage = await channel.messages.fetch(giveaway.msgID);
        await giveawayMessage.reply({ content: `\`⛔\` » **Zu wenig Teilnehmer:** Es fehlen \`${giveaway.gewinnerAnzahl - giveaway.teilnehmer.length}👥\` Teilnehmer um genug Gewinner auszulosen!`, ephemeral: true });
        continue;
      }

      const winnerIds = [];
      while (winnerIds.length < giveaway.gewinnerAnzahl) {
        const winnerIndex = Math.floor(Math.random() * giveaway.teilnehmer.length);
        const winnerId = giveaway.teilnehmer[winnerIndex];
        if (!winnerIds.includes(winnerId)) {
          winnerIds.push(winnerId);
        }
      }

      logger.info(winnerIds);

      const channel = await client.channels.fetch(giveaway.channelID);
      const giveawayMessage = await channel.messages.fetch(giveaway.msgID);
      if (!giveawayMessage) {continue;}

      const priceInput = await giveaway.price;
      const emoji = determineEmoji(priceInput);
      const winnersMentions = winnerIds.map(id => `<@${id}>`).join(", ");

      await giveawayMessage.reply({ content: `<a:bier:1196502621427601498> **Herzlichen Glückwunsch**, ${winnersMentions} ${winnerIds.length === 1 ? "hat" : "haben"} ${emoji} **${priceInput}** ${emoji} gewonnen! <a:2herzen:1196502635465932984>` });

      for (const winnerId of winnerIds) {
        const userData = await userdb.findOne({ userID: winnerId });
        if (userData) {
          userData.giveaway.eventWins += 1;
          await userData.save();
        }

        const winner = await client.users.fetch(winnerId);
        if (winner) {
          const embed = new EmbedBuilder()
            .setTitle("<a:Cool:915211628755169301> » GEWINNSPIEL GEWONNEN! <a:Cool:915211628755169301>")
            .setDescription("» Du hast bei dem Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** gewonnen!\n» Ein Teammitglied wird sich **demnächst** bei dir melden.")
            .setColor("Blurple");
          await winner.send({ content: "Du hast bei einem Gewinnspiel **GEWONNEN!!!**", embeds: [embed] }).catch(() => logger.info("Nachricht konnte nicht an den Gewinner gesendet werden."));
        }
      }

      const embed = giveawayMessage.embeds[0];
      const giveawayEndEmbed = new EmbedBuilder()
        .setTitle(`${embed.title}`)
        .setDescription(`<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Gewinner__**\n<:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**\n<:PfeilBlau:1147248395837247613> Gewinner: ${winnerIds.length > 0 ? winnersMentions : "**`Zu wenig Teilnehmer`**"}\n<:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`)
        .setColor("Red")
        .setThumbnail("https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66b647bd&is=66b4f63d&hm=53e18bea4e53fcfa6bef3450c65670ac3d7d1d57e3dd66a18e23d9660dfdfc6d&")
        .setFooter({ text: `${client.user.displayName} - Bot`, iconURL: `${client.user.displayAvatarURL()}` })
        .setTimestamp();
      await giveawayMessage.edit({ content: "⛔ **GEWINNSPIEL VORBEI!** ⛔", embeds: [giveawayEndEmbed], components: [] });

      const creator = client.users.cache.get(giveaway.creator);
      if (creator) {
        const creatorEmbed = new EmbedBuilder()
          .setTitle("<a:Information:1007267420316106903> » GEWINNSPIEL VORBEI!")
          .setDescription("`✅` » Das Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** ist vorbei!\n`📌` » Da du das Event gestartet hast, habe ich **dich informiert.**\n\n`💸` » **Zahle das Gewinnspiel** selbst aus, oder kümmere dich\n`💸` » darum, dass es die zuständige Person erledigt.")
          .setColor("Orange");
        await creator.send({ embeds: [creatorEmbed] }).catch(() => logger.info("Nachricht konnte nicht an den Giveaway Ersteller gesendet werden."));
      }
    }
  }
}, 30000);

function determineEmoji(priceInput) {
  if (priceInput.toLowerCase().includes("nitro") && !priceInput.toLowerCase().includes("basic")) {
    return "<a:nitro:1186636151335944283>";
  } else if (priceInput.toLowerCase().includes("nitro") && priceInput.toLowerCase().includes("basic")) {
    return "<a:basic:1186636165567229972>";
  } else if (priceInput.toLowerCase().includes("guthaben")) {
    return "<a:guthaben:1186636139281530970>";
  } else {
    return "<a:Diamond:1018911546430210128>";
  }
}
