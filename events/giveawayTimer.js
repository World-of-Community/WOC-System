import { EmbedBuilder } from "discord.js";
import client from "../index.js";
import giveawaydb from "../models/giveawaydb.js";
import userdb from "../models/userdb.js";
import logger from "../functions/logger.js";

// Prüft alle 30 Sekunden, ob Gewinnspiele abgelaufen sind, und lost die Gewinner aus
setInterval(async () => {
  const currentTime = new Date();
  const activeGiveaways = await giveawaydb.find({ endTime: null });
  if (!activeGiveaways || activeGiveaways.length === 0) return;

  for (const giveaway of activeGiveaways) {
    const startTime = new Date(giveaway.startTime);
    if (startTime.getTime() + giveaway.duration <= currentTime.getTime()) {
      if (giveaway.endTime) continue;

      giveaway.endTime = new Date();
      await giveaway.save();

      let channel, giveawayMessage;
      try {
        channel = await client.channels.fetch(giveaway.channelID);
        giveawayMessage = await channel.messages.fetch(giveaway.msgID);
      } catch (err) {
        logger.error(`Kanal oder Nachricht nicht gefunden: ${err.message}`);
        continue;
      }

      if (!giveawayMessage) continue;

      if (giveaway.teilnehmer.length < giveaway.gewinnerAnzahl) {
        const oldEmbed = giveawayMessage.embeds[0];
        const giveawayTitle = oldEmbed?.title || "Gewinnspiel Abgebrochen";

        const cancelledEmbed = new EmbedBuilder()
          .setTitle(giveawayTitle)
          .setDescription(
            `<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Abgebrochen__**\n` +
            `<:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**\n` +
            `<:PfeilBlau:1147248395837247613> Status: **` + "`Zu wenig Teilnehmer`" + `**\n` +
            `<:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`
          )
          .setColor("Red")
          .setFooter({ text: `${client.user.displayName} - Bot`, iconURL: `${client.user.displayAvatarURL()}` })
          .setTimestamp();

        // Ursprüngliche Nachricht bearbeiten (Buttons entfernen & Embed ersetzen)
        await giveawayMessage.edit({
          content: "⛔ **GEWINNSPIEL ABGEBROCHEN!** ⛔",
          embeds: [cancelledEmbed],
          components: []
        });

        // Öffentliche Benachrichtigung im Channel
        await giveawayMessage.reply({
          content: `\`⛔\` » **Gewinnspiel abgebrochen:** Es fehlten \`${giveaway.gewinnerAnzahl - giveaway.teilnehmer.length}👥\` Teilnehmer!`
        });

        continue; // Sauber zum nächsten Gewinnspiel springen
      }


      const winnerIds = [];
      const pool = [...giveaway.teilnehmer];

      while (winnerIds.length < giveaway.gewinnerAnzahl && pool.length > 0) {
        const winnerIndex = Math.floor(Math.random() * pool.length);
        const [winnerId] = pool.splice(winnerIndex, 1);
        winnerIds.push(winnerId);
      }

      logger.info(winnerIds);

      const priceInput = giveaway.price;
      const emoji = determineEmoji(priceInput);
      const winnersMentions = winnerIds.map(id => `<@${id}>`).join(", ");

      await giveawayMessage.reply({
        content: `<a:bier:1196502621427601498> **Herzlichen Glückwunsch**, ${winnersMentions} ${winnerIds.length === 1 ? "hat" : "haben"} ${emoji} **${priceInput}** ${emoji} gewonnen! <a:2herzen:1196502635465932984>`
      });

      for (const winnerId of winnerIds) {
        const userData = await userdb.findOne({ userID: winnerId });
        if (userData) {
          if (!userData.giveaway) userData.giveaway = { eventWins: 0 };
          userData.giveaway.eventWins += 1;
          await userData.save();
        }

        try {
          const winner = await client.users.fetch(winnerId);
          if (winner) {
            const embed = new EmbedBuilder()
              .setTitle("<a:Cool:915211628755169301> » GEWINNSPIEL GEWONNEN! <a:Cool:915211628755169301>")
              .setDescription("» Du hast bei dem Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** gewonnen!\n» Ein Teammitglied wird sich **demnächst** bei dir melden.")
              .setColor("Blurple");
            await winner.send({ content: "Du hast bei einem Gewinnspiel **GEWONNEN!!!**", embeds: [embed] });
          }
        } catch {
          logger.info(`Nachricht konnte nicht an Gewinner ${winnerId} gesendet werden.`);
        }
      }

      const oldEmbed = giveawayMessage.embeds[0];
      const giveawayTitle = oldEmbed?.title || "Gewinnspiel Beendet";

      const giveawayEndEmbed = new EmbedBuilder()
        .setTitle(giveawayTitle)
        .setDescription(`<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Gewinner__**\n<:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**\n<:PfeilBlau:1147248395837247613> Gewinner: ${winnersMentions}\n<:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`)
        .setColor("Red")
        .setThumbnail("https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif")
        .setFooter({ text: `${client.user.displayName} - Bot`, iconURL: `${client.user.displayAvatarURL()}` })
        .setTimestamp();

      await giveawayMessage.edit({ content: "⛔ **GEWINNSPIEL VORBEI!** ⛔", embeds: [giveawayEndEmbed], components: [] });

      try {
        const creator = await client.users.fetch(giveaway.creator);
        if (creator) {
          const creatorEmbed = new EmbedBuilder()
            .setTitle("<a:Information:1007267420316106903> » GEWINNSPIEL VORBEI!")
            .setDescription("`✅` » Das Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** ist vorbei!\n`📌` » Da du das Event gestartet hast, habe ich **dich informiert.**\n\n`💸` » **Zahle das Gewinnspiel** selbst aus, oder kümmere dich\n`💸` » darum, dass es die zuständige Person erledigt.")
            .setColor("Orange");
          await creator.send({ embeds: [creatorEmbed] });
        }
      } catch {
        logger.info("Nachricht konnte nicht an den Giveaway Ersteller gesendet werden.");
      }
    }
  }
}, 30000);

function determineEmoji(priceInput) {
  if (!priceInput) return "<a:Diamond:1018911546430210128>";
  const input = priceInput.toLowerCase();
  if (input.includes("nitro") && !input.includes("basic")) {
    return "<a:nitro:1186636151335944283>";
  } else if (input.includes("nitro") && input.includes("basic")) {
    return "<a:basic:1186636165567229972>";
  } else if (input.includes("guthaben")) {
    return "<a:guthaben:1186636139281530970>";
  } else {
    return "<a:Diamond:1018911546430210128>";
  }
}