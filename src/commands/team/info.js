const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('» Verschiedene Info-Nachrichten 📑')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addSubcommand(sub =>
      sub
        .setName('reward')
        .setDescription('» Zeigt die Belohnungen mit Seltenheiten 🎁')
    )
    .addSubcommand(sub =>
      sub
        .setName('bewerbung')
        .setDescription('» Sendet eine Info Bewerbungsnachricht 💬')
    ),

  async execute(interaction) {
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
        .setTitle('🎁 Belohnungen')
        .setDescription('Wähle eine **Seltenheit**, um die möglichen Rewards zu sehen.')
        .setColor('Blurple');

      const message = await interaction.reply({
        embeds: [startEmbed],
        components: [rarityButtons],
        ephemeral: true,
        fetchReply: true
      });

      // ───────────── COLLECTOR ─────────────
      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 5 * 60 * 1000 // 5 Minuten
      });

      collector.on('collect', async btn => {
        if (btn.user.id !== interaction.user.id) {
          return btn.reply({
            content: '> `❌`  Du darfst diese Buttons nicht benutzen.',
            ephemeral: true
          });
        }

        let embed;

        switch (btn.customId) {
          case 'rarity_gewoehnlich':
            embed = new EmbedBuilder()
              .setTitle('Gewöhnlich')
              .setDescription(
                '> **1 Level** – 15%\n' +
                '> **200 XP** – 15%\n' +
                '> **500 Coins** – 15%\n' +
                '> **750 Coins** – 15%'
              )
              .setColor('Grey');
            break;

          case 'rarity_ungewoehnlich':
            embed = new EmbedBuilder()
              .setTitle('Ungewöhnlich')
              .setDescription(
                '> **2 Level** – 7%\n' +
                '> **3 Level** - 6%\n' +
                '> **1.000 Coins** – 6%\n' +
                '> **1.000 XP** – 6%'
              )
              .setColor('Green');
            break;

          case 'rarity_selten':
            embed = new EmbedBuilder()
              .setTitle('Selten')
              .setDescription(
                '> **4 Level** – 3%\n' +
                '> **5 Level** – 3%\n' +
                '> **2.500 Coins** – 2%\n' +
                '> **5.000 Coins** – 2%'
              )
              .setColor('Blue');
            break;

          case 'rarity_episch':
            embed = new EmbedBuilder()
              .setTitle('Episch')
              .setDescription(
                '> **7.500 Coins** – 2%\n' +
                '> **10.000 Coins** – 2%'
              )
              .setColor('Purple');
            break;

          case 'rarity_legendaer':
            embed = new EmbedBuilder()
              .setTitle('Legendär (Jackpot)')
              .setDescription(
                '> **50.000 Coins** – 1%'
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
