const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../../Datenbank/userdb'); // Passe diesen Pfad ggf. an

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('» Hole dir deine täglichen Coins. 🪙'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date();

    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, streak: 0 }); // Streak initialisieren
    }

    const letzteBelohnung = user.lastDaily || new Date(0);
    const stundenSeitdem = (now - letzteBelohnung) / (1000 * 60 * 60);
    const tageSeitdem = (now - letzteBelohnung) / (1000 * 60 * 60 * 24);

    if (stundenSeitdem < 24) {
      const naechsteMoeglichkeit = new Date(letzteBelohnung.getTime() + 24 * 60 * 60 * 1000);
      const verbleibend = Math.ceil((naechsteMoeglichkeit - now) / (1000 * 60));
      const stunden = Math.floor(verbleibend / 60);
      const minuten = verbleibend % 60;

      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('`⏳` Bereits abgeholt!')
            .setDescription(`Du kannst deine täglichen Coins wieder in **${stunden}h ${minuten}min** abholen.`)
        ],
        ephemeral: true
      });
    }

    // Streak aktualisieren
    if (tageSeitdem <= 2) {
      user.streak = (user.streak || 0) + 1;
    } else {
      user.streak = 1;
    }

    // Belohnung + Bonus für Streak
    const basisBelohnung = Math.floor(Math.random() * 9 + 2) * 50;
    const streakBonus = user.streak * 10;
    const gesamtBelohnung = basisBelohnung + streakBonus;

    user.coins += gesamtBelohnung;
    user.lastDaily = now;
    await user.save();

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('`🎁` Tägliche Belohnung')
          .setDescription(
            `Du hast heute **${basisBelohnung.toLocaleString('de-DE')} Coins** erhalten.\n` +
            `**+${streakBonus.toLocaleString('de-DE')} Bonus** für deine Streak von **${user.streak} Tag(en)**.\n\n` +
            `Insgesamt: **${gesamtBelohnung.toLocaleString('de-DE')} Coins**`
          )
          .setFooter({ text: 'Komm morgen wieder und erhöhe deine Serie!' })
      ]
    });
  }
};
