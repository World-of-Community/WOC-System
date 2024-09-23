const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Liste aller Flaggen der Welt
const flags = [
  { country: 'Germany', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg' },
  { country: 'France', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg' },
  { country: 'Italy', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/03/Flag_of_Italy.svg' },
  { country: 'Japan', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9e/Flag_of_Japan.svg' },
  { country: 'United States', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a4/Flag_of_the_United_States.svg' },
  { country: 'Canada', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Flag_of_Canada.svg' },
  { country: 'Brazil', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/05/Flag_of_Brazil.svg' },
  { country: 'India', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg' },
  { country: 'Australia', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Flag_of_Australia.svg' },
  { country: 'Russia', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/f/f3/Flag_of_Russia.svg' },
  { country: 'South Korea', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/0/09/Flag_of_South_Korea.svg' },
  { country: 'United Kingdom', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg' },
  { country: 'Mexico', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Flag_of_Mexico.svg' },
  { country: 'Argentina', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Flag_of_Argentina.svg' },
  { country: 'South Africa', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Flag_of_South_Africa.svg' },
  { country: 'China', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Flag_of_the_People%27s_Republic_of_China.svg' },
  { country: 'Spain', imageUrl: 'https://upload.wikimedia.org/wikipedia/en/9/9a/Flag_of_Spain.svg' },
  { country: 'Saudi Arabia', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Flag_of_Saudi_Arabia.svg' },
  { country: 'Egypt', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Flag_of_Egypt.svg' },
  { country: 'Turkey', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg' },
  // Füge weitere Länder hinzu oder lade sie dynamisch über eine API.
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flaggenquiz')
    .setDescription('» Startet ein Flaggenquiz mit allen Flaggen der Welt'),

  async execute(interaction) {
    await interaction.reply({ content: '> `⏰` » Lade das Flaggenquiz...' }); // Zuerst eine Antwort senden

    const sendNewFlag = async () => {
      const randomFlag = flags[Math.floor(Math.random() * flags.length)];

      const embed = new EmbedBuilder()
        .setTitle('Flaggenquiz')
        .setDescription('Welche Flagge ist das? Schreib den Ländernamen in den Chat!')
        .setImage(randomFlag.imageUrl)
        .setColor('Random');

      // Antwort mit neuem Embed
      await interaction.editReply({ content: null, embeds: [embed] });

      return randomFlag; // Rückgabe des aktuellen Flags
    };

    let currentFlag = await sendNewFlag(); // Senden des ersten Embeds

    // Filter für Nachrichten im Kanal, die der Benutzer eingibt
    const filter = msg => msg.author.id === interaction.user.id;

    const collector = interaction.channel.createMessageCollector({ filter });

    collector.on('collect', async msg => {
      if (msg.content.toLowerCase() === currentFlag.country.toLowerCase()) {
        await msg.react('✅');
        await interaction.followUp({ content: `Richtig! Das ist die Flagge von ${currentFlag.country}.` });
        currentFlag = await sendNewFlag(); // Senden eines neuen Embeds
      } else {
        await msg.react('❌'); // Falsche Antwort, der Bot reagiert mit ❌
      }
    });
  },
};
