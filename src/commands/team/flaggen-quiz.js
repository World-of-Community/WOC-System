const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Liste aller Flaggen der Welt
const flags = [
  { country: 'Deutschland', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/2560px-Flag_of_Germany.svg.png' },
  { country: 'Frankreich', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Flag_of_France.png' },
  { country: 'Italien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/2560px-Flag_of_Italy.svg.png' },
  // Weitere Länder...
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flaggenquiz')
    .setDescription('» Startet ein Flaggenquiz mit allen Flaggen der Welt')
    .addChannelOption(option => option.setName('kanal').setDescription('Der Kanal, in den die Nachricht gesendet werden soll').setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal');

    await interaction.reply({ content: '> `⏰` » Lade das Flaggenquiz...', ephemeral: true });

    let currentFlagMessage;

    const sendNewFlag = async () => {
      const randomFlag = flags[Math.floor(Math.random() * flags.length)];
      const firstLetterHint = randomFlag.country.charAt(0); // Erster Buchstabe als Tipp

      const embed = new EmbedBuilder()
        .setTitle('Flaggenquiz')
        .setDescription(`Welche Flagge ist das?\n\nTipp: Der Name des Landes beginnt mit **${firstLetterHint}**`)
        .setImage(randomFlag.imageUrl)
        .setColor('Random');

      if (currentFlagMessage) {
        await currentFlagMessage.delete();
      }

      currentFlagMessage = await channel.send({ embeds: [embed] });

      console.log(`Flagge gezeigt: ${randomFlag.country}, Bild-URL: ${randomFlag.imageUrl}`);

      return randomFlag;
    };

    let currentFlag = await sendNewFlag();

    const filter = msg => msg.author.id === interaction.user.id && msg.channel.id === channel.id;

    const collector = channel.createMessageCollector({ filter });

    collector.on('collect', async msg => {
      if (msg.content.toLowerCase() === currentFlag.country.toLowerCase()) {
        await msg.react('✅');
        const correctMessage = await channel.send(`Richtig! Das ist die Flagge von **${currentFlag.country}.**`);

        // Antwortnachricht des Nutzers nach 5 Sekunden löschen
        await new Promise(resolve => setTimeout(resolve, 5000));
        await msg.delete();
        await correctMessage.delete(); // Korrektnachricht nach 5 Sekunden löschen

        const timestampNow = Math.floor(Date.now() / 1000);
        const timestampAfter5Seconds = timestampNow + 5;

        const waitingMessage = await channel.send(`Bitte warte... <t:${timestampAfter5Seconds}:R> geht es weiter.`);

        setTimeout(async () => {
          await waitingMessage.delete();
          currentFlag = await sendNewFlag();
        }, 5000);
      } else {
        await msg.react('❌');
        setTimeout(async () => {
          await msg.delete();
        }, 3000);
      }
    });
  },
};
