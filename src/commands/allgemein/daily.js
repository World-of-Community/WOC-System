const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Coin } = require('../../../Datenbank/coindb'); // Coin Modell importieren

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
    .setDescription('» Hole dir deine tägliche Belohnung. 🪙'),

  async execute(interaction) {
    const userId = interaction.user.id;
    const now = new Date();

    let user = await Coin.findOne({ userId });
    if (!user) {
      user = await Coin.create({ userId, coins: 0, streak: 0, lastDaily: null });
    }

    // Wenn bereits heute abgeholt wurde
    if (user.lastDaily && user.lastDaily.toDateString() === now.toDateString()) {
      const naechsteMoeglichkeit = new Date();
      naechsteMoeglichkeit.setHours(24, 0, 0, 0); // Heute um Mitternacht = morgen 0:00

      const unixTimestamp = Math.floor(naechsteMoeglichkeit.getTime() / 1000);

      await interaction.reply({
        ephemeral: true,
        embeds: [
          new EmbedBuilder()
            .setColor('Red')
            .setTitle('`⏳` Bereits abgeholt!')
            .setDescription(`Du kannst deine täglichen Coins wieder <t:${unixTimestamp}:R> abholen.\n(<t:${unixTimestamp}:F>)`)
            .setFooter({ text: 'Nachricht wird in 30 Sekunden gelöscht.' })
        ]
      });

      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 30000);

      return;
    }

    // Streak prüfen
    const gestern = new Date(now);
    gestern.setDate(now.getDate() - 1);

    if (user.lastDaily && user.lastDaily.toDateString() === gestern.toDateString()) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }

    const Belohnung = 100;
    const bonusMultiplikator = berechneBonusMultiplikator(user.streak);
    const gesamtBelohnung = Math.floor(Belohnung * bonusMultiplikator);

    user.coins += gesamtBelohnung;
    user.lastDaily = now;

    await user.save();

    const bonusStatusText = generiereBonusStatus(user.streak);
    const streakText = user.streak === 1 ? 'Tag' : 'Tage';

    await interaction.reply({
      ephemeral: true,
      embeds: [
        new EmbedBuilder()
          .setColor('Green')
          .setTitle('`🎁` Tägliche Belohnung')
          .setDescription(
            `Belohnung: **${Belohnung.toLocaleString('de-DE')} Coins**\n` +
            `Streak: **${user.streak} ${streakText}**\n` +
            `Bonus-Multiplikator: **${((bonusMultiplikator - 1) * 100).toFixed(0)}%**\n\n` +
            `Insgesamt erhältst du: **${gesamtBelohnung.toLocaleString('de-DE')} Coins**\n\n` +
            `**Streak-Übersicht:**\n${bonusStatusText}\n\n` +
            `Komm morgen wieder, um deine Belohnung zu erhöhen!`
          )
          .setFooter({ text: 'Nachricht wird in 30 Sekunden gelöscht.' })
      ]
    });

    setTimeout(() => {
      interaction.deleteReply().catch(() => {});
    }, 30000);
  }
};
