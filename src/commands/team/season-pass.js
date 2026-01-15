const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const User = require('../../../Datenbank/userdb');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('season-pass')
    .setDescription('» Zeigt den Seasonpass mit allen Vorteilen und der Kaufoption. 🎫')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const userData = await User.findOne({ userId: interaction.user.id }) || { shoppass: false, coins: 0 };

    const embed = new EmbedBuilder()
      .setTitle('🎟️ SeasonPass')
      .setColor('Blurple')
      .setDescription( 
       'Schreibe jeden Tag mindestens 1x - erhalte jeden Monat bis zu 20 Rewards!\n\n' +
       '**Auf einen Blick**:\n' +
       '» Alle 30 Tage ein neuer Pass mit 20 Rewards\n' +
       '» Davon 7 free, 13 Premium\n' +
       '» Schreibe aktiv, um deine Rewards freizuschalten\n\n' +
       '**So Geht\'s**:\n' +
       '» Schreibe jeden Tag mindestens 1x\n' +
       '» Du erhältst XP, mit denen du Rewards freischaltest\n' +
       '» 450 XP wenn du am vorherigen Tag auch geworben hast\n' +
       '» Ansonsten nur 300 XP - aktives Schreiben wird belohnt!\n\n' +
       '`📌` Premium Pass: Alle Rewards inkl. **5000 Coins**!\n'
      )

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('shoppass_show')
        .setLabel('SeasonPass anzeigen')
        .setEmoji('🎟️')
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId('shoppass_buy')
        .setLabel('Alle Rewards freischalten')
        .setEmoji('💎')
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.channel.send({ embeds: [embed], components: [row] })
    await interaction.reply({ content: 'SeasonPass Embed gesendet.', ephemeral: true });
  },
};
