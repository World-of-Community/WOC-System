import { EmbedBuilder } from "discord.js";
import { Coin, CoinConfig } from "../../models/coindb.js";
import logger from "../../functions/logger.js";

export default {
  name: "coin",
  description: "» Starte den Coin-Generator für 1 Minute mit Live-Anzeige. 🪙",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      "name": "user",
      "description": "Benutzer, der Coins erhalten soll",
      "required": true,
      "type": 6,
    },
  ],

  async run(client, interaction) {
    try {
      const targetUser = interaction.options.getUser("user");
      const targetMember = await interaction.guild.members.fetch(targetUser.id);

      const totalMs = 60_000; // 1 Minute
      const intervalMs = 3_000; // alle 3 Sekunden
      const maxTicks = totalMs / intervalMs;
      const endTimeUnix = Math.floor((Date.now() + totalMs) / 1000);

      let collectedCoins = 0;
      let tickCount = 0;

      const config = await CoinConfig.findOne({ guildId: interaction.guild.id });
      const min = config?.minCoins ?? 1;
      const max = config?.maxCoins ?? 5;

      if (min > max || min < 0 || max < 1) {
        return interaction.reply({
          content: "> `⛔` » Ungültige Coin-Konfiguration. Bitte überprüfe die Einstellungen mit `/coin-manage`.",
          ephemeral: true,
        });
      }

      await interaction.reply({
        content: `> \`⏳\` » Starte Coin-Generator für <@${targetMember.id}> für **1 Minute**...`,
        ephemeral: true,
      });

      const interval = setInterval(async () => {
        const coins = Math.floor(Math.random() * (max - min + 1)) + min;
        collectedCoins += coins;
        tickCount++;

        const currentUnix = Math.floor(Date.now() / 1000);
        const remainingUnix = Math.max(endTimeUnix - currentUnix, 0);

        await interaction.editReply({
          content:
            `> \`⏳\` » Coin-Generator läuft für <@${targetMember.id}>...\n` +
            `> \`🪙\` » Coins gesammelt: **${collectedCoins.toLocaleString("de-DE")}**\n` +
            `> \`⌛\` » Verbleibende Zeit: <t:${currentUnix + remainingUnix}:R>`,
        });

        if (tickCount >= maxTicks) {
          clearInterval(interval);

          let user = await Coin.findOne({ userId: targetUser.id });
          if (!user) {user = new Coin({ userId: targetUser.id, coins: 0 });}
          user.coins += collectedCoins;
          await user.save();

          const embed = new EmbedBuilder()
            .setTitle("`🪙` Coin-Ergebnis")
            .setColor("Gold")
            .setDescription(`> <@${targetUser.id}> hat in **1 Minute** insgesamt **${collectedCoins.toLocaleString("de-DE")} Coins** gesammelt.`)
            .setFooter({ text: `Coin-Bereich: ${min}–${max} Coins pro Tick` })
            .setTimestamp();

          await interaction.editReply({
            content: "> `✅` » Coin-Generator abgeschlossen.",
            embeds: [embed],
          });
        }
      }, intervalMs);

    } catch (error) {
      logger.error("Fehler im Coin-Generator:", error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: "> `❌` » Ein unerwarteter Fehler ist aufgetreten.", ephemeral: true });
      }
    }
  },
};
