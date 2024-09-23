const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

// Liste aller Flaggen der Welt
const flags = [
  { country: 'Deutschland', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/2560px-Flag_of_Germany.svg.png' },
  { country: 'Frankreich', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/62/Flag_of_France.png' },
  { country: 'Italien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Flag_of_Italy.svg/2560px-Flag_of_Italy.svg.png' },
  { country: 'Japan', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flag_of_Japan.svg' },
  { country: 'USA', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Flag_of_the_United_States.png/800px-Flag_of_the_United_States.png' },
  { country: 'Canada', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Flag_of_Canada.svg/1280px-Flag_of_Canada.svg.png' },
  { country: 'Brasilien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Flag_of_Brazil.svg' },
  { country: 'Indien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_India.png/2560px-Flag_of_India.png' },
  { country: 'Australien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Flag_of_Australia.svg/2560px-Flag_of_Australia.svg.png' },
  { country: 'Russland', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/2560px-Flag_of_Russia.svg.png' },
  { country: 'Südkorea', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Flag_of_South_Korea.png' },
  { country: 'Vereinigtes Königreich', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/42/Flag_of_the_United_Kingdom.png' },
  { country: 'Mexico', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo0kf0kaHt3s_pwARMBWL8yChtBbt9JNXF5Q&s' },
  { country: 'Argentinien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Flag_of_Argentina.svg/1280px-Flag_of_Argentina.svg.png' },
  { country: 'Südafrika', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Flag_of_South_Africa.svg/2560px-Flag_of_South_Africa.svg.png' },
  { country: 'China', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_China.png/1024px-Flag_of_China.png' },
  { country: 'Spanien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/1280px-Flag_of_Spain.svg.png' },
  { country: 'Saudi Arabien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Flag_of_Saudi_Arabia.svg/2560px-Flag_of_Saudi_Arabia.svg.png' },
  { country: 'Egypten', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Flag_of_Egypt_%28variant%29.png/1200px-Flag_of_Egypt_%28variant%29.png' },
  { country: 'Türkei', imageUrl: 'https://img.freepik.com/vektoren-premium/tuerkei-flagge-nationalfarben-der-republik-tuerkiye_608997-868.jpg' },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flaggenquiz')
    .setDescription('» Startet ein Flaggenquiz mit allen Flaggen der Welt')
    .addChannelOption(option => option.setName('kanal').setDescription('Der Kanal, in den die Nachricht gesendet werden soll').setRequired(true)),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal');

    await interaction.reply({ content: '> `⏰` » Lade das Flaggenquiz...', ephemeral: true });

    const sendNewFlag = async () => {
      const randomFlag = flags[Math.floor(Math.random() * flags.length)];
      
      console.log(`Sende Flagge für: ${randomFlag.country} (${randomFlag.imageUrl})`); // Debugging-Ausgabe

      const embed = new EmbedBuilder()
        .setTitle('Flaggenquiz')
        .setDescription('Welche Flagge ist das? Schreib den Ländernamen in den Chat!')
        .setImage(randomFlag.imageUrl)
        .setColor('Random');

      const message = await channel.send({ embeds: [embed] });

      return { flag: randomFlag, message };
    };

    let currentFlag = await sendNewFlag();

    const filter = msg => msg.author.id === interaction.user.id && msg.channel.id === channel.id;

    const collector = channel.createMessageCollector({ filter });

    collector.on('collect', async msg => {
      if (msg.content.toLowerCase() === currentFlag.flag.country.toLowerCase()) {
        await msg.react('✅');
        await channel.send(`> Richtig! Das ist die Flagge von **${currentFlag.flag.country}.**`);
        
        // Aktualisiere das Embed
        const newFlag = flags[Math.floor(Math.random() * flags.length)];
        currentFlag.flag = newFlag;
      
        const newEmbed = new EmbedBuilder()
          .setTitle('Flaggenquiz')
          .setDescription('Welche Flagge ist das? Schreib den Ländernamen in den Chat!')
          .setImage(newFlag.imageUrl)
          .setColor('Random');
      
        await currentFlag.message.edit({ embeds: [newEmbed] }); // Aktuellen Embed aktualisieren
      } else {
        await msg.react('❌');
      }
    });
  },
};
