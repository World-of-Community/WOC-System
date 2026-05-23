import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import userdb from "../../../Datenbank/userdb.js";

export default {
  data: new SlashCommandBuilder()
    .setName('invites-manage')
    .setDescription('Fügt einem Benutzer manuell Einladungen hinzu oder entfernt sie')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Benutzer, dem du Einladungen hinzufügen oder entfernen willst')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('joins')
        .setDescription('Wie viele normale Einladungen sollen hinzugefügt oder entfernt werden? (positiv oder negativ)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('bonus')
        .setDescription('Wie viele Bonus-Einladungen sollen hinzugefügt oder entfernt werden? (optional)')
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('left')
        .setDescription('Wie viele Einladungen sollen als "verloren" hinzugefügt oder entfernt werden? (optional)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const joinsChange = interaction.options.getInteger('joins'); // positiv oder negativ
    const bonusChange = interaction.options.getInteger('bonus') || 0;
    const leftChange = interaction.options.getInteger('left') || 0;

    // Aktuelle Daten holen
    const userData = await userdb.findOne({ userID: user.id }) || {
      invites: { joins: 0, bonus: 0, left: 0 }
    };

    // Neue Werte berechnen und nicht unter 0 fallen lassen
    const newJoins = Math.max(0, (userData.invites.joins || 0) + joinsChange);
    const newBonus = Math.max(0, (userData.invites.bonus || 0) + bonusChange);
    const newLeft = Math.max(0, (userData.invites.left || 0) + leftChange);

    // Daten in DB updaten (überschreiben mit den neuen Werten)
    await userdb.findOneAndUpdate(
      { userID: user.id },
      {
        $set: {
          'invites.joins': newJoins,
          'invites.bonus': newBonus,
          'invites.left': newLeft
        }
      },
      { upsert: true }
    );

    const total = newJoins + newBonus - newLeft;

    const InviteEmbed = new EmbedBuilder()
      .setTitle('📨 Einladungen aktualisiert')
      .setDescription(`> \`👤\` » Benutzer: ${user} (\`${user.id}\`)\n> \`📩\` » Normale Einladungen (jetzt): **${newJoins}**\n> \`🎁\` » Bonus-Einladungen (jetzt): **${newBonus}**\n> \`❌\` » Verlorene Einladungen (jetzt): **${newLeft}**\n> \`📊\` » Gesamt-Einladungen: **${total}**`)
      .setColor('Blurple')
      .setFooter({ text: `Aktualisiert von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [InviteEmbed], ephemeral: true });
  }
};
