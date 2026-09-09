import { EmbedBuilder } from "discord.js";
import { Coin } from "../../models/coindb.js";

export default {
  name: "coins-manage",
  description: "» Verwalte Coins eines Benutzers.",
  type: 1,
  default_member_permissions: "268435456",

  options: [
    {
      type: 1,
      name: "add",
      description: "» Füge einem Benutzer Coins hinzu. 🪙",
      options: [
        {
          name: "user",
          description: "Der Benutzer, dem Coins hinzugefügt werden sollen",
          required: true,
          type: 6,
        },
        {
          type: 4,
          name: "amount",
          description: "Die Anzahl der Coins, die hinzugefügt werden sollen",
          required: true,
          min_value: 1,
        },
      ],
    },

    {
      type: 1,
      name: "remove",
      description: "» Entfernt Coins von einem Benutzer. 🪙",
      options: [
        {
          type: 4,
          name: "amount",
          description: "Die Anzahl der Coins, die entfernt werden sollen",
          required: true,
          min_value: 1,
        },
        {
          name: "user",
          description: "Der Benutzer",
          required: false,
          type: 6,
        },
        {
          type: 3,
          name: "userid",
          description: "Die Benutzer-ID",
          required: false,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    // =========================================================
    // ADD
    // =========================================================

    if (subcommand === "add") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      if (!user) {
        return interaction.reply({
          content: "> `❗` » Es wurde kein Benutzer angegeben.",
          ephemeral: true,
        });
      }

      if (user.bot) {
        return interaction.reply({
          content: "> `❌` » Bots können keine Coins erhalten.",
          ephemeral: true,
        });
      }

      if (!amount || amount <= 0) {
        return interaction.reply({
          content:
            "> `❗` » Die Anzahl der Coins muss eine positive Zahl sein.",
          ephemeral: true,
        });
      }

      let userCoins = await Coin.findOne({
        userId: user.id,
      });

      if (!userCoins) {
        userCoins = new Coin({
          userId: user.id,
          coins: 0,
        });
      }

      const oldCoins = userCoins.coins;

      userCoins.coins += amount;

      await userCoins.save();

      const formattedOldCoins = oldCoins.toLocaleString("de-DE");
      const formattedAmount = amount.toLocaleString("de-DE");
      const formattedNewCoins = userCoins.coins.toLocaleString("de-DE");

      const CoinEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${user.displayName}'s Coins wurden aktualisiert`)
        .setDescription(
          `» ${user} hat **${formattedAmount} Coins** erhalten.\n\n` +
          `» Vorher: **${formattedOldCoins} Coins**\n` +
          `» Nachher: **${formattedNewCoins} Coins**`
        )
        .setColor("Green")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `» ${interaction.guild.name} | Coin-System`,
          iconURL: interaction.guild.iconURL(),
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [CoinEmbed],
        ephemeral: true,
      });
    }

    // =========================================================
    // REMOVE
    // =========================================================

    if (subcommand === "remove") {
      const userPing = interaction.options.getUser("user");
      const userIdInput = interaction.options.getString("userid");
      const amount = interaction.options.getInteger("amount");

      if (!amount || amount <= 0) {
        return interaction.reply({
          content:
            "> `❗` » Die Anzahl der Coins muss größer als **0** sein.",
          ephemeral: true,
        });
      }

      // Prüfen, ob mindestens eine Möglichkeit angegeben wurde
      if (!userPing && !userIdInput) {
        return interaction.reply({
          content:
            "> `❗` » Du musst entweder einen Benutzer **pingen** oder eine **ID angeben**.",
          ephemeral: true,
        });
      }

      // Falls beide angegeben wurden, darf der Ping Vorrang haben
      const userId = userPing?.id || userIdInput;

      // Discord User ID validieren
      if (!/^\d{17,20}$/.test(userId)) {
        return interaction.reply({
          content:
            "> `❗` » Die angegebene Benutzer-ID ist keine gültige Discord-ID.",
          ephemeral: true,
        });
      }

      let user = userPing;

      // Wenn keine Erwähnung vorhanden ist, Benutzer über ID laden
      if (!user && userIdInput) {
        try {
          user = await client.users.fetch(userId);
        } catch {
          user = null;
        }
      }

      // Wenn der Benutzer nicht gefunden wurde
      if (!user) {
        return interaction.reply({
          content:
            `> \`❌\` » Der Benutzer mit der ID \`${userId}\` konnte nicht gefunden werden.`,
          ephemeral: true,
        });
      }

      // Bots dürfen keine Coins haben
      if (user.bot) {
        return interaction.reply({
          content:
            "> `❌` » Bots können keine Coins haben.",
          ephemeral: true,
        });
      }

      // Coin-Daten suchen
      const userCoins = await Coin.findOne({
        userId: userId,
      });

      if (!userCoins) {
        return interaction.reply({
          content:
            `> \`❗\` » ${user} besitzt aktuell keine Coins.`,
          ephemeral: true,
        });
      }

      // Prüfen, ob genügend Coins vorhanden sind
      if (userCoins.coins <= 0) {
        return interaction.reply({
          content:
            `> \`❗\` » ${user} besitzt aktuell **0 Coins**.`,
          ephemeral: true,
        });
      }

      if (amount > userCoins.coins) {
        return interaction.reply({
          content:
            `> \`❗\` » ${user} besitzt nicht genügend Coins.\n\n` +
            `» Vorhanden: **${userCoins.coins.toLocaleString("de-DE")} Coins**\n` +
            `» Entfernen: **${amount.toLocaleString("de-DE")} Coins**`,
          ephemeral: true,
        });
      }

      // Alten Kontostand speichern
      const oldCoins = userCoins.coins;

      // Coins entfernen
      userCoins.coins -= amount;

      await userCoins.save();

      const formattedOldCoins = oldCoins.toLocaleString("de-DE");
      const formattedAmount = amount.toLocaleString("de-DE");
      const formattedNewCoins = userCoins.coins.toLocaleString("de-DE");

      // Displayname aus Server holen
      const member = interaction.guild.members.cache.get(userId);

      const displayName =
        member?.displayName ||
        user.displayName ||
        user.username ||
        `Unbekannt (${userId})`;

      const CoinEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${displayName}'s Coins wurden aktualisiert`)
        .setDescription(
          `» **${formattedAmount} Coins** wurden von ${user} entfernt.\n\n` +
          `» Vorher: **${formattedOldCoins} Coins**\n` +
          `» Nachher: **${formattedNewCoins} Coins**`
        )
        .setColor("Red")
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setFooter({
          text: `» ${interaction.guild.name} | Coin-System`,
          iconURL: interaction.guild.iconURL(),
        })
        .setTimestamp();

      return interaction.reply({
        embeds: [CoinEmbed],
        ephemeral: true,
      });
    }
  },
};