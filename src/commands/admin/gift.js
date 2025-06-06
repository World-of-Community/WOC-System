const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gift')
    .setDescription('» Verschenke ein Geschenk an jemanden. 🎁')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Der Nutzer, der das Geschenk erhalten soll')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('link')
        .setDescription('Der Geschenk-Link (z.B. Nitro, etc.)')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const link = interaction.options.getString('link');

    // Prüfen, ob Link "gift" enthält (allgemeine Prüfung)
    if (!link.toLowerCase().includes('gift')) {
      return interaction.reply({ content: 'Bitte gib einen gültigen Geschenk-Link an.', ephemeral: true });
    }

    // Prüfen, ob es ein Nitro-Link ist
    const isNitro = link.startsWith('https://discord.gift/') || link.startsWith('https://discord.com/gifts/');

    const embed = new EmbedBuilder()
      .setTitle(isNitro ? '🎁 Nitro Geschenk erhalten!' : '🎁 Geschenk erhalten!')
      .setDescription(
        `${interaction.user} hat ${isNitro ? 'Nitro' : 'ein Geschenk'} an ${user} verschenkt!\n\n` +
        `Link: [Hier klicken](${link})\n\n` +
        `Wichtiger Hinweis\n` +
        `Dies ist kein Scam. Bitte prüfe trotzdem jeden Link sorgfältig, bevor du darauf klickst.`
      )
      .setColor('Blurple')
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      await interaction.reply({ content: `> \`✅\` » Das Geschenk wurde erfolgreich an ${user} per DM geschickt! 📬`, ephemeral: true });
    } catch (error) {
      await interaction.reply({ content: `> \`❌\` » Ich konnte ${user} keine DM schicken. Bitte überprüfe die Datenschutzeinstellungen des Nutzers.`, ephemeral: true });
    }
  },
};
