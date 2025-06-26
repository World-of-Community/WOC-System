const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../../Datenbank/userdb'); // Pfad anpassen

const bonusLevels = [
  { days: 10,  percent: 50 },
  { days: 20,  percent: 100 },
  { days: 50,  percent: 150 },
  { days: 100, percent: 200 },
  { days: 200, percent: 250 },
  { days: 500, percent: 300 },
];

function berechneBonusMultiplikator(streak) {
  if (streak >= 500) return 4.0;
  if (streak >= 200) return 3.5;
  if (streak >= 100) return 3.0;
  if (streak >= 50)  return 2.5;
  if (streak >= 20)  return 2.0;
  if (streak >= 10)  return 1.5;
  return 1.0;
}

function generiereBonusStatus(streak) {
  return bonusLevels.map(level => {
    const erreicht = streak >= level.days ? '`✅`' : '`❌`';
    return `Ab ${level.days} Tage: ${level.percent}% mehr Coins ${erreicht}`;
  }).join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('» Hole dir deine täglichen Coins. 🪙'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date();

    let user = await User.findOne({ userId });
    if (!user) {
      user = await User.create({ userId, coins: 0, streak: 0 });
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

    // Basis-Belohnung immer 100
    const basisBelohnung = 100;

    // Bonus-Multiplikator ermitteln
    const bonusMultiplikator = berechneBonusMultiplikator(user.streak);

    // Gesamt-Belohnung berechnen
    const gesamtBelohnung = Math.floor(basisBelohnung * bonusMultiplikator);

    user.coins += gesamtBelohnung;
    user.lastDaily = now;
    await user.save();

    // Status der Bonuslevel generieren
    const bonusStatusText = generiereBonusStatus(user.streak);

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('`🎁` Tägliche Belohnung')
          .setDescription(
            `Basis-Belohnung: **${basisBelohnung.toLocaleString('de-DE')} Coins**\n` +
            `Streak: **${user.streak} Tage**\n` +
            `Aktuell: **${user.streak}. Tag**\n` +
            `Bonus-Multiplikator: **${((bonusMultiplikator - 1) * 100).toFixed(0)}%**\n\n` +
            `Insgesamt erhältst du: **${gesamtBelohnung.toLocaleString('de-DE')} Coins**\n\n` +
            `**Streak-Übersicht:**\n${bonusStatusText}`
          )
          .setFooter({ text: 'Komm morgen wieder, um deine Belohnung zu erhöhen!' })
      ], 
      ephemeral: true
    });
  }
};
