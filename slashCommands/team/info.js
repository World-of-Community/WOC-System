import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";

export default {
  name: "info",
    description: "» Verschiedene Info-Nachrichten 📑",
    type: 1,
    default_member_permissions: "268435456",
    options: [
        {
            "type": 1,
            "name": "reward",
            "description": "» Zeigt die Belohnungen mit Seltenheiten 🎁",
            "options": []
        },
        {
            "type": 1,
            "name": "bewerbung",
            "description": "» Sendet eine Info Bewerbungsnachricht 💬",
            "options": []
        }
    ],

  async run(client, interaction) {
    const subcommand = interaction.options.getSubcommand();

    // ───────────── BUTTONS ─────────────
    const rarityButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('rarity_gewoehnlich')
        .setLabel('Gewöhnlich')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('rarity_ungewoehnlich')
        .setLabel('Ungewöhnlich')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('rarity_selten')
        .setLabel('Selten')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('rarity_episch')
        .setLabel('Episch')
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId('rarity_legendaer')
        .setLabel('Legendär')
        .setStyle(ButtonStyle.Secondary)
    );

    // ───────────── /info reward ─────────────
    if (subcommand === 'reward') {
      const startEmbed = new EmbedBuilder()
        .setTitle('`🎁` Erste Nachricht - Belohnungen')
        .setDescription('Wähle eine **Seltenheit**, um die möglichen Rewards zu sehen.')
        .setColor('Blurple');

      const message = await interaction.reply({
        embeds: [startEmbed],
        components: [rarityButtons],
        ephemeral: true,
        fetchReply: true
      });

      // ───────────── COLLECTOR ─────────────
      const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button });

      collector.on('collect', async btn => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({
            content: '> `❌` » Du darfst diese Buttons nicht benutzen.',
            ephemeral: true
          });
        }

        let embed;

        switch (btn.customId) {
          case 'rarity_gewoehnlich':
            embed = new EmbedBuilder()
              .setTitle('Erste Nachricht - Gewöhnlich')
              .setDescription(
                '> **1 Level** – Chance: `15%`\n' +
                '> **200 XP** – Chance: `15%`\n' +
                '> **500 Coins** – Chance: `15%`\n' +
                '> **750 Coins** – Chance: `15%`'
              )
              .setColor('Grey');
            break;

          case 'rarity_ungewoehnlich':
            embed = new EmbedBuilder()
              .setTitle('Erste Nachricht - Ungewöhnlich')
              .setDescription(
                '> **2 Level** – Chance: `7%`\n' +
                '> **3 Level** - Chance: `6%`\n' +
                '> **1.000 Coins** – Chance: `6%`\n' +
                '> **1.000 XP** – Chance: `6%`'
              )
              .setColor('Green');
            break;

          case 'rarity_selten':
            embed = new EmbedBuilder()
              .setTitle('Erste Nachricht - Selten')
              .setDescription(
                '> **4 Level** – Chance: `3%`\n' +
                '> **5 Level** – Chance: `3%`\n' +
                '> **2.500 Coins** – Chance: `2%`\n' +
                '> **5.000 Coins** – Chance: `2%`'
              )
              .setColor('Blue');
            break;

          case 'rarity_episch':
            embed = new EmbedBuilder()
              .setTitle('Erste Nachricht - Episch')
              .setDescription(
                '> **7.500 Coins** – Chance: `2%`\n' +
                '> **10.000 Coins** – Chance: `2%`'
              )
              .setColor('Purple');
            break;

          case 'rarity_legendaer':
            embed = new EmbedBuilder()
              .setTitle('Erste Nachricht - Legendär (Jackpot)')
              .setDescription(
                '> **50.000 Coins** – Chance: `1%`'
              )
              .setColor('Gold');
            break;
        }

        await btn.update({
          embeds: [embed],
          components: [rarityButtons],
          ephemeral: true
        });
      });

      return;
    }

    // ───────────── /info bewerbung ─────────────
    if (subcommand === 'bewerbung') {
      await interaction.channel.send(
        'Das zuständige Teammitglied wird sich zeitnah darum kümmern, wir bitten daher um Geduld.'
      );

      return interaction.reply({
        content: '`✅` » Die Nachricht wurde erfolgreich gesendet',
        ephemeral: true
      });
    }
  }
};
