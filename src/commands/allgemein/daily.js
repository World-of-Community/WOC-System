const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb');  // Coin Modell importieren

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

    let user = await Coin.findOne({ userId });
    if (!user) {
      user = await Coin.create({ userId, coins: 0, streak: 0, lastDaily: null });
    }

    const MS_24H = 24 * 60 * 60 * 1000;

    if (user.lastDaily && now.getTime() < user.lastDaily.getTime() + MS_24H) {
      const naechsteMoeglichkeit = new Date(user.lastDaily.getTime() + MS_24H);
      const verbleibendMs = naechsteMoeglichkeit.getTime() - now.getTime();
      const verbleibendMin = Math.ceil(verbleibendMs / (1000 * 60));
      const stunden = Math.floor(verbleibendMin / 60);
      const minuten = verbleibendMin % 60;

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

    const tageSeitdem = user.lastDaily ? (now.getTime() - user.lastDaily.getTime()) / MS_24H : Infinity;
    if (tageSeitdem <= 2) {
      user.streak = (user.streak || 0) + 1;
    } else {
      user.streak = 1;
    }

    const basisBelohnung = 100;
    const bonusMultiplikator = berechneBonusMultiplikator(user.streak);
    const gesamtBelohnung = Math.floor(basisBelohnung * bonusMultiplikator);

    user.coins += gesamtBelohnung;
    user.lastDaily = now;

    await user.save();

    const bonusStatusText = generiereBonusStatus(user.streak);
    const streakText = user.streak === 1 ? 'Tag' : 'Tage';

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('`🎁` Tägliche Belohnung')
          .setDescription(
            `Basis-Belohnung: **${basisBelohnung.toLocaleString('de-DE')} Coins**\n` +
            `Streak: **${user.streak} ${streakText}**\n` +
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
