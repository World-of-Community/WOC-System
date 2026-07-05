import { EmbedBuilder } from "discord.js";
import { Coin } from "../../models/coindb.js";

export default {
  name: "coins-manage",
  description: "» Verwalte Coins eines Benutzers.",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      "type": 1,
      "name": "add",
      "description": "Füge einem Benutzer Coins hinzu.",
      "options": [
        {
          "name": "user",
          "description": "Der Benutzer, dem Coins hinzugefügt werden sollen",
          "required": true,
          "type": 6,
        },
        {
          "type": 4,
          "name": "amount",
          "description": "Die Anzahl der Coins, die hinzugefügt werden sollen",
          "required": true,
        },
      ],
    },
    {
      "type": 1,
      "name": "remove",
      "description": "Entfernt Coins von einem Benutzer.",
      "options": [
        {
          "type": 4,
          "name": "amount",
          "description": "Die Anzahl der Coins, die entfernt werden sollen",
          "required": true,
        },
        {
          "name": "user",
          "description": "Der Benutzer (Ping)",
          "required": false,
          "type": 6,
        },
        {
          "type": 3,
          "name": "userid",
          "description": "Die Benutzer-ID",
          "required": false,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      if (user.bot) {
        return interaction.reply({ content: "> `❌` » Bots können keine Coins erhalten.", ephemeral: true });
      }

      if (amount <= 0) {
        return interaction.reply({ content: "> `❗` » Die Anzahl der Coins muss eine positive Zahl sein.", ephemeral: true });
      }

      let userCoins = await Coin.findOne({ userId: user.id });
      if (!userCoins) {
        userCoins = new Coin({ userId: user.id, coins: 0 });
      }

      userCoins.coins += amount;
      await userCoins.save();

      const formattedCoins = userCoins.coins.toLocaleString("de-DE");
      const formattedAmount = amount.toLocaleString("de-DE");

      const CoinEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${user.displayName}'s Coins wurden aktualisiert`)
        .setDescription(`» ${user} hat **${formattedAmount} Coins** erhalten.\n\n» ${user.displayName} hat jetzt insgesamt **${formattedCoins} Coins**.`)
        .setColor("Green")
        .setThumbnail(user.displayAvatarURL())
        .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      return interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
    }

    if (subcommand === "remove") {
      const userPing = interaction.options.getUser("user");
      const userIdInput = interaction.options.getString("userid");
      const amount = interaction.options.getInteger("amount");

      if (amount <= 0) {
        return interaction.reply({ content: "> `❗` » Die Anzahl der Coins muss größer als **0** sein.", ephemeral: true });
      }

      // Validierung: entweder Ping ODER ID muss angegeben werden
      if (!userPing && !userIdInput) {
        return interaction.reply({ content: "> `❗` » Du musst entweder einen Benutzer **pingen** oder eine **ID angeben**.", ephemeral: true });
      }

      const userId = userPing?.id || userIdInput;
      let user = userPing;

      if (!user && userIdInput) {
        try {
          user = await interaction.client.users.fetch(userIdInput);
        } catch {
          user = null;
        }
      }

      if (user?.bot) {
        return interaction.reply({ content: "> `❌` » Bots können keine Coins haben.", ephemeral: true });
      }

      const userCoins = await Coin.findOne({ userId });
      if (!userCoins) {
        return interaction.reply({ content: `> \`❗\` » Nutzer mit der ID \`${userId}\` hat keine Coins, die entfernt werden können.`, ephemeral: true });
      }

      userCoins.coins -= amount;
      if (userCoins.coins < 0) {userCoins.coins = 0;}
      await userCoins.save();

      const member = interaction.guild.members.cache.get(userId);
      const displayName = member?.displayName || user?.username || `Unbekannt (${userId})`;
      const formattedCoins = userCoins.coins.toLocaleString("de-DE");
      const formattedAmount = amount.toLocaleString("de-DE");

      const CoinEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${displayName}'s Coins wurden aktualisiert`)
        .setDescription(`» **${formattedAmount} Coins** wurden von <@${userId}> entfernt.\n\n» Aktueller Stand: **${formattedCoins} Coins**.`)
        .setColor("Red")
        .setThumbnail(user?.displayAvatarURL?.() || null)
        .setFooter({ text: `» ${interaction.guild.name} | Coin-System`, iconURL: interaction.guild.iconURL() })
        .setTimestamp();

      return interaction.reply({ embeds: [CoinEmbed], ephemeral: true });
    }
  },
};
