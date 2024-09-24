const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionBitField } = require('discord.js');

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
  { country: 'Abchasien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Flag_of_the_Republic_of_Abkhazia.svg/1200px-Flag_of_the_Republic_of_Abkhazia.svg.png' },
  { country: 'Afghanistan', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Flag_of_Afghanistan_%282013%E2%80%932021%29.svg/2560px-Flag_of_Afghanistan_%282013%E2%80%932021%29.svg.png' },
  { country: 'Albanien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Flag_of_Albania.svg/700px-Flag_of_Albania.svg.png' },
  { country: 'Algerien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Flag_of_Algeria.svg/2560px-Flag_of_Algeria.svg.png' },
  { country: 'Andorra', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Andorra.svg/2560px-Flag_of_Andorra.svg.png' },
  { country: 'Angola', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Flag_of_Angola.svg/1024px-Flag_of_Angola.svg.png' },
  { country: 'Antigua und Barbuda', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Antigua_and_Barbuda.svg/1200px-Flag_of_Antigua_and_Barbuda.svg.png' },
  { country: 'Äqualtorialguinea', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Flag_of_Equatorial_Guinea.svg/640px-Flag_of_Equatorial_Guinea.svg.png' },
  { country: 'Armenien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Flag_of_Armenia.svg/2560px-Flag_of_Armenia.svg.png' },
  { country: 'Aserbaidschan', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Flag_of_Azerbaijan.svg/1024px-Flag_of_Azerbaijan.svg.png' },
  { country: 'Äthiopien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/2560px-Flag_of_Ethiopia.svg.png' },
  { country: 'Bahamas', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_the_Bahamas.png/1200px-Flag_of_the_Bahamas.png' },
  { country: 'Bahrain', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Flag_of_Bahrain.png' },
  { country: 'Bangladesch', imageUrl: 'https://www.countryflags.com/wp-content/uploads/bangladesh-flag-png-xl.png' },
  { country: 'Barbados', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Flag_of_Barbados.svg/1500px-Flag_of_Barbados.svg.png' },
  { country: 'Belarus', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Flag_of_Belarus.png' },
  { country: 'Belgien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Flag_of_Belgium.png' },
  { country: 'Belize', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Flag_of_Belize.svg/800px-Flag_of_Belize.svg.png' },
  { country: 'Benin', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Benin.svg/2560px-Flag_of_Benin.svg.png' },
  { country: 'Bhutan', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Flag_of_Bhutan.svg/1024px-Flag_of_Bhutan.svg.png' },
  { country: 'Bolivien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Flag_of_Bolivia.svg/1280px-Flag_of_Bolivia.svg.png' },
  { country: 'Bosnien und Herzegowina', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/bf/Flag_of_Bosnia_and_Herzegovina.svg' },
  { country: 'Botswana', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWCfMst42ogd805skChF2kE3d-CuspBC8W-g&s' },
  { country: 'Brunei', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Brunei.svg/2560px-Flag_of_Brunei.svg.png' },
  { country: 'Bulgarien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Bulgaria.svg' },
  { country: 'Burkina Faso', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcNWvLFtGlWm_3niO8ElVBb9LPLuVBuO3R_w&s' },
  { country: 'Burundi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Flag_of_Burundi.svg/1200px-Flag_of_Burundi.svg.png' },
  { country: 'Chile', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Flag_of_Chile.svg/1024px-Flag_of_Chile.svg.png' },
  { country: 'Taiwan', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Flag_of_Taiwan.png' },
  { country: 'Cookinseln', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Flag_of_the_Cook_Islands.svg/2560px-Flag_of_the_Cook_Islands.svg.png' },
  { country: 'Costa Rica', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Flag_of_Costa_Rica.svg/2560px-Flag_of_Costa_Rica.svg.png' },
  { country: 'Dänemark', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Denmark.svg/635px-Flag_of_Denmark.svg.png' },
  { country: 'Dominica', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Flag_of_Dominica.svg/2560px-Flag_of_Dominica.svg.png' },
  { country: 'Dominikanische Republik', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_the_Dominican_Republic.svg/2560px-Flag_of_the_Dominican_Republic.svg.png' },
  { country: 'Dschibuti', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxDVieyiQVJjFNwL34VX9YUiCzxcb1j0ao5A&s' },
  { country: 'Ecuador', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Flag_of_Ecuador.png/1200px-Flag_of_Ecuador.png' },
  { country: 'El Salvador', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Flag_of_El_Salvador.svg/1280px-Flag_of_El_Salvador.svg.png' },
  { country: 'Elfenbeinküste', imageUrl: 'https://www.countryflags.com/wp-content/uploads/cote-d-ivoire-flag-png-large.png' },
  { country: 'Eritrea', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Flag_of_Eritrea.svg/1280px-Flag_of_Eritrea.svg.png' },
  { country: 'Estland', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Flag_of_Estonia.svg/1200px-Flag_of_Estonia.svg.png' },
  { country: 'Eswatini', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv4jBPkZHV8d3F8mkIRAHMg5zFEuriNL4X-A&s' },
  { country: 'Fitschi', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Fiji.svg/1280px-Flag_of_Fiji.svg.png' },
  { country: 'Finnland', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Flag_of_Finland.png/1200px-Flag_of_Finland.png' },
  { country: 'Gabun', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Flag_of_Gabon.svg/2560px-Flag_of_Gabon.svg.png' },
  { country: 'Gambia', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtU-WPwks0O6s0o3T6V482G6cHqRTuYB1M1A&s' },
  { country: 'Georgien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Georgia.svg/2560px-Flag_of_Georgia.svg.png' },
  { country: 'Ghana', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Flag_of_Ghana.svg/2560px-Flag_of_Ghana.svg.png' },
  { country: 'Grenada', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Flag_of_Grenada.svg/800px-Flag_of_Grenada.svg.png' },
  { country: 'Griechenland', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Flag_of_Greece.png/1200px-Flag_of_Greece.png' },
  { country: 'Guatemala', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Flag_of_Guatemala.svg/1024px-Flag_of_Guatemala.svg.png' },
  { country: 'Guinea', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Flag_of_Guinea.svg' },
  { country: 'Guinea-Bissau', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Flag_of_Guinea-Bissau.svg/2560px-Flag_of_Guinea-Bissau.svg.png' },
  { country: 'Guyana', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Flag_of_Guyana.svg/1280px-Flag_of_Guyana.svg.png' },
  { country: 'Haiti', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Flag_of_Haiti.svg/1280px-Flag_of_Haiti.svg.png' },
  { country: 'Honduras', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Flag_of_Honduras.svg/1200px-Flag_of_Honduras.svg.png' },
  { country: 'Indonesien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/1024px-Flag_of_Indonesia.svg.png' },
  { country: 'Irak', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTfCW_WaQul9zV6LPJFxS14-7LAJKdcUz8Ww&s' },
  { country: 'Iran', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Flag_of_Iran.svg/2560px-Flag_of_Iran.svg.png' },
  { country: 'Irland', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Flag_of_Ireland.svg/1280px-Flag_of_Ireland.svg.png' },
  { country: 'Island', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Flag_of_Iceland.svg/1280px-Flag_of_Iceland.svg.png' },
  { country: 'Israel', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Flag_of_Israel.svg/1280px-Flag_of_Israel.svg.png' },
  { country: 'Jamaica', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Jamaica.png' },
  { country: 'Jemen', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Flag_of_Yemen.svg/1024px-Flag_of_Yemen.svg.png' },
  { country: 'Jordanien', imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/2560px-Flag_of_Jordan.svg.png' },
];

// Funktion, um eine zufällige Flagge auszuwählen
function getRandomFlag() {
  const randomIndex = Math.floor(Math.random() * flags.length);
  return flags[randomIndex];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('flaggenquiz')
    .setDescription('» Startet ein Flaggenquiz mit allen Flaggen der Welt')
    .addChannelOption(option =>
      option.setName('kanal').setDescription('Der Kanal, in den die Nachricht gesendet werden soll').setRequired(true)
    ),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal');
    await interaction.reply({ content: '> `⏰` » Lade das Flaggenquiz...', ephemeral: true });

    let currentFlagMessage;

    // Funktion, um eine neue Flagge anzuzeigen
    const sendNewFlag = async () => {
      const randomFlag = flags[Math.floor(Math.random() * flags.length)];
      const firstLetterHint = randomFlag.country.charAt(0); // Erster Buchstabe als Tipp

      const embed = new EmbedBuilder()
        .setDescription(`\`🚩\` » Welche Flagge ist das?\n\n\`💡\` » Tipp: Der Name des Landes beginnt mit **${firstLetterHint}**.`)
        .setImage(randomFlag.imageUrl)
        .setColor('Random')
        .setFooter({ text: 'Benutze den Button, um die Flagge zu überspringen.' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('skip_flag')
            .setLabel('Überspringen')
            .setStyle(ButtonStyle.Secondary)
        );

      if (currentFlagMessage) {
        await currentFlagMessage.delete();
      }

      currentFlagMessage = await channel.send({ embeds: [embed], components: [row] });
      console.log(`Flagge gezeigt: ${randomFlag.country}, Bild-URL: ${randomFlag.imageUrl}`);
      return randomFlag;
    };

    let currentFlag = await sendNewFlag();

    // Button-Interaktions-Handler
    const filter = (i) => i.customId === 'skip_flag' && i.user.id === interaction.user.id;
    const collector = channel.createMessageComponentCollector({ filter });

    collector.on('collect', async (i) => {
      await i.deferUpdate(); // Interaktion aufschieben, um Zeitüberschreitungen zu vermeiden
      currentFlag = await sendNewFlag(); // Neue Flagge senden
    });

    // Nachrichten-Collector für das Erraten der Flagge
    const messageFilter = (msg) => msg.content.toLowerCase() === currentFlag.country.toLowerCase();
    const messageCollector = channel.createMessageCollector({ filter: messageFilter });

    messageCollector.on('collect', async (msg) => {
      await msg.react('✅');
      const correctMessage = await channel.send(`Richtig! Das ist die Flagge von **${currentFlag.country}**.`);

      // Nachrichten nach 5 Sekunden löschen
      setTimeout(async () => {
        await msg.delete();
        await correctMessage.delete();
        const waitingMessage = await channel.send('Bitte warte... In 5 Sekunden geht es weiter.');
        
        setTimeout(async () => {
          await waitingMessage.delete();
          currentFlag = await sendNewFlag();
        }, 5000);
      }, 5000);
    });

    messageCollector.on('end', async (msg) => {
      await msg.react('❌');
      setTimeout(async () => {
        await msg.delete();
      }, 3000);
    });
  },
};
