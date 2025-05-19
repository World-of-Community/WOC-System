const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const userdb = require("../../../Datenbank/userdb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('invites-add')
    .setDescription('Fügt einem Benutzer manuell Einladungen hinzu')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer, dem du Einladungen hinzufügen willst')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('anzahl')
        .setDescription('Wie viele Einladungen sollen hinzugefügt werden?')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('bonus')
        .setDescription('Wie viele Bonus-Einladungen sollen hinzugefügt werden?')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const amount = interaction.options.getInteger('anzahl');
    const bonus = interaction.options.getInteger('bonus') || 0;

    await userdb.findOneAndUpdate(
      { userID: user.id },
      {
        $inc: {
          'invites.joins': amount,
          'invites.bonus': bonus
        }
      },
      { upsert: true }
    );

    const total = amount + bonus;

    const InviteEmbed = new EmbedBuilder()
      .setTitle('📨 Einladungen hinzugefügt')
      .setDescription(`> \`👤\` » Benutzer: ${user} (\`${user.id}\`)\n> \`📩\` » Normale Einladungen: **${amount}**\n> \`🎁\` » Bonus-Einladungen: **${bonus}**\n> \`📊\` » Gesamt: **${total}**`)
      .setColor('Blurple')
      .setFooter({ text: `Hinzugefügt von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [InviteEmbed], ephemeral: true });
  }
};
