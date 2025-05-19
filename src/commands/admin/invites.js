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
      option.setName('joins')
        .setDescription('Wie viele normale Einladungen sollen hinzugefügt werden? (positiv oder negativ)')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('bonus')
        .setDescription('Wie viele Bonus-Einladungen sollen hinzugefügt werden? (optional)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('left')
        .setDescription('Wie viele Einladungen sollen abgezogen werden? (optional)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const joins = interaction.options.getInteger('joins'); // Kann auch negativ sein, um abzuziehen
    const bonus = interaction.options.getInteger('bonus') || 0;
    const left = interaction.options.getInteger('left') || 0;

    // Update in der Datenbank: joins, bonus, left erhöhen/vermindern
    await userdb.findOneAndUpdate(
      { userID: user.id },
      {
        $inc: {
          'invites.joins': joins,
          'invites.bonus': bonus,
          'invites.left': left
        }
      },
      { upsert: true }
    );

    // Hol aktuellen Stand aus DB, um Gesamt anzeigen zu können
    const userData = await userdb.findOne({ userID: user.id });

    const joinsCount = userData?.invites?.joins || 0;
    const bonusCount = userData?.invites?.bonus || 0;
    const leftCount = userData?.invites?.left || 0;
    const total = joinsCount + bonusCount - leftCount;

    const InviteEmbed = new EmbedBuilder()
      .setTitle('📨 Einladungen aktualisiert')
      .setDescription(`> \`👤\` » Benutzer: ${user} (\`${user.id}\`)\n> \`📩\` » Normale Einladungen (jetzt): **${joinsCount}**\n> \`🎁\` » Bonus-Einladungen (jetzt): **${bonusCount}**\n> > \`❌\` » Verlorene Einladungen (jetzt): **${leftCount}**\n> \`📊\` » Gesamt-Einladungen: **${total}**`)
      .setColor('Blurple')
      .setFooter({ text: `Aktualisiert von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [InviteEmbed], ephemeral: true });
  }
};
