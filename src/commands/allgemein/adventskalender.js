const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const Advent = require("../../../Datenbank/adventdb");

// Belohnungen definieren
const rewards = {
  1: { type: 'coins', value: 100 },
  2: { type: 'coins', value: 320 },
  3: { type: 'coins', value: 220 },
  4: { type: 'coins', value: 140 },
  5: { type: 'coins', value: 230 },
  6: { type: 'role', value: '1312780135530889326' },
  7: { type: 'coins', value: 270 },
  8: { type: 'coins', value: 800 },
  9: { type: 'coins', value: 400 },
  10: { type: 'coins', value: 210 },
  11: { type: 'coins', value: 290 },
  12: { type: 'coins', value: 120 },
  13: { type: 'coins', value: 740 },
  14: { type: 'coins', value: 380 },
  15: { type: 'coins', value: 640 },
  16: { type: 'coins', value: 180 },
  17: { type: 'coins', value: 230 },
  18: { type: 'coins', value: 250 },
  19: { type: 'coins', value: 330 },
  20: { type: 'coins', value: 340 },
  21: { type: 'coins', value: 500 },
  22: { type: 'coins', value: 760 },
  23: { type: 'coins', value: 2500 },
  24: { type: 'coins', value: 5000 },
};

// Anpassbare Buttons
const buttonConfig = {
  1: { label: '1🎁', style: ButtonStyle.Primary },
  2: { label: '2🌨️', style: ButtonStyle.Primary },
  3: { label: '3🎄', style: ButtonStyle.Primary },
  4: { label: '4⛄', style: ButtonStyle.Primary },
  5: { label: '5⭐', style: ButtonStyle.Primary },
  6: { label: '6❄️', style: ButtonStyle.Primary },
  7: { label: '7✨', style: ButtonStyle.Primary },
  8: { label: '8🎄', style: ButtonStyle.Primary },
  9: { label: '9☃️', style: ButtonStyle.Primary },
  10: { label: '10🎁', style: ButtonStyle.Primary },
  11: { label: '11⭐', style: ButtonStyle.Primary },
  12: { label: '12❄️', style: ButtonStyle.Primary },
  13: { label: '13🌨️', style: ButtonStyle.Primary },
  14: { label: '14🎄', style: ButtonStyle.Primary },
  15: { label: '15⭐', style: ButtonStyle.Primary },
  16: { label: '16✨', style: ButtonStyle.Primary },
  17: { label: '17❄️', style: ButtonStyle.Primary },
  18: { label: '18🎄', style: ButtonStyle.Primary },
  19: { label: '19🧸', style: ButtonStyle.Primary },
  20: { label: '20🦌', style: ButtonStyle.Primary },
  21: { label: '21✨', style: ButtonStyle.Primary },
  22: { label: '22🎉', style: ButtonStyle.Primary },
  23: { label: '23🎁', style: ButtonStyle.Primary },
  24: { label: '24🎅', style: ButtonStyle.Primary },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adventskalender')
    .setDescription('» Öffne deinen Adventskalender! 🎁'),

  async execute(interaction) {
    const currentDay = new Date().getDate();
    const maxDay = 24;

    if (interaction.isChatInputCommand()) {
      // Buttons erstellen
      const rows = [];
      for (let i = 1; i <= maxDay; i += 5) {
        const row = new ActionRowBuilder();
        for (let j = i; j < i + 5 && j <= maxDay; j++) {
          const buttonData = buttonConfig[j] || {}; // Standardwerte für Button
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`advent_${j}`)
              .setLabel(buttonData.label || j.toString()) // Button-Label anpassen
              .setStyle(buttonData.style || ButtonStyle.Primary) // Button-Style anpassen
              .setDisabled(j > currentDay) // Zukünftige Tage deaktivieren
          );
        }
        rows.push(row);
      }

      // Adventskalender Embed erstellen
      const Adventskalender = new EmbedBuilder()
        .setTitle('🎄 Adventskalender')
        .setDescription(`Klicke auf einen Tag, um deine Belohnung zu erhalten!\n\nHeute ist der **${currentDay}. Dezember**.`)
        .setColor('Green')
        .setFooter({ text: `${interaction.guild.name} wünscht euch Frohe Weihnachten!`, iconURL: `${interaction.guild.iconURL()}` });

      // Sende Embed mit Buttons
      await interaction.channel.send({ embeds: [Adventskalender], components: [rows] });
      await interaction.reply({ text: '> ✅ » Der Adventskalender wurde erfolgreich gesendet.', ephemeral: true });
    }

    // Button-Interaktion verarbeiten
    if (interaction.isButton() && interaction.customId.startsWith('advent_')) {
      const [, day] = interaction.customId.split('_');
      const dayNumber = parseInt(day);

      // Datenbankeintrag prüfen
      let userData = await Advent.findOne({ userId: interaction.user.id });
      if (!userData) {
        userData = await Advent.create({ userId: interaction.user.id, openedDays: [] });
      }

      // Überprüfen, ob der Tag bereits geöffnet wurde
      if (userData.openedDays.includes(dayNumber)) {
        return interaction.reply({ content: '> `❗` » Du hast diesen Tag bereits geöffnet!', ephemeral: true });
      }

      // Überprüfen, ob der Tag in der Zukunft liegt
      if (dayNumber > currentDay) {
        return interaction.reply({ content: '> `❌` » Du kannst zukünftige Tage nicht öffnen!', ephemeral: true });
      }

      // Belohnungssystem verarbeiten
      userData.openedDays.push(dayNumber);
      await userData.save();

      let rewardMessage;
      const reward = rewards[dayNumber];

      switch (reward?.type) {
        case 'coins':
          rewardMessage = `> \`🎉\` » Du hast **${reward.value} Coins** erhalten!\n> Öffne ein Ticket im Support um deine Belohnung abzuholen.`;
          // Logik für Coins (z. B. in einer Datenbank speichern)
          break;

        case 'role':
          const role = interaction.guild.roles.cache.find(r => r.id === reward.value);
          if (role) {
            await interaction.member.roles.add(role);
            rewardMessage = `> \`🎉\` » Du hast die Rolle **${reward.value}** erhalten!`;
          } else {
            rewardMessage = '> `❗` » Rolle wurde nicht gefunden. Bitte melde dich im Support.';
          }
          break;

        case 'custom':
          rewardMessage = reward.value;
          break;

        default:
          rewardMessage = `> \`🎁\` » Du hast den **${dayNumber}. Dezember** geöffnet.`;
      }

      // Antwort mit der Belohnung
      return interaction.reply({ content: rewardMessage, ephemeral: true });
    }
  },
};
