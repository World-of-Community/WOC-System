const { SlashCommandBuilder, PermissionFlagsBits, PermissionBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const flags = [
  {
    country: "Deutschland",
    imageUrl: "https://www.worldometers.info/img/flags/gm-flag.gif",
  },
  {
    country: "Frankreich",
    imageUrl: "https://www.worldometers.info/img/flags/fr-flag.gif",
  },
  {
    country: "Vereinigte Staaten",
    imageUrl: "https://www.worldometers.info/img/flags/us-flag.gif",
  },
  {
    country: "Kanada",
    imageUrl: "https://www.worldometers.info/img/flags/ca-flag.gif",
  },
  {
    country: "Brasilien",
    imageUrl: "https://www.worldometers.info/img/flags/br-flag.gif",
  },
  {
    country: "Japan",
    imageUrl: "https://www.worldometers.info/img/flags/ja-flag.gif",
  },
  {
    country: "Indien",
    imageUrl: "https://www.worldometers.info/img/flags/in-flag.gif",
  },
  {
    country: "Australien",
    imageUrl: "https://www.worldometers.info/img/flags/as-flag.gif",
  },
  {
    country: "Vereinigtes Königreich",
    imageUrl: "https://www.worldometers.info/img/flags/uk-flag.gif",
  },
  {
    country: "China",
    imageUrl: "https://www.worldometers.info/img/flags/ch-flag.gif",
  },
  {
    country: "Russland",
    imageUrl: "https://www.worldometers.info/img/flags/rs-flag.gif",
  },
  {
    country: "Südkorea",
    imageUrl: "https://www.worldometers.info/img/flags/ks-flag.gif",
  },
  {
    country: "Italien",
    imageUrl: "https://www.worldometers.info/img/flags/it-flag.gif",
  },
  {
    country: "Spanien",
    imageUrl: "https://www.worldometers.info/img/flags/sp-flag.gif",
  },
  {
    country: "Mexiko",
    imageUrl: "https://www.worldometers.info/img/flags/mx-flag.gif",
  }
  // Weitere Flaggen können hier hinzugefügt werden
];


// flaggenquiz.json noch hier hinzufügen inkl. datenbank



module.exports = {
  data: new SlashCommandBuilder()
    .setName('flaggenquiz')
    .setDescription('» Startet ein Flaggenquiz mit allen Flaggen der Welt')
    .addChannelOption(option => option.setName('kanal').setDescription('Der Kanal, in den die Nachricht gesendet werden soll').setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const channel = interaction.options.getChannel('kanal');
    const currentTime = Math.floor(Date.now() / 1000); // Aktuelle Zeit in Unix-Timestamp
    const timestampAfter5Seconds = currentTime + 5; // Zeit in 5 Sekunden
    await interaction.reply({ content: `> \`⏰\` » Lade das Flaggenquiz... **<t:${timestampAfter5Seconds}:R>**`, ephemeral: true });

    let currentFlagMessage;

    // Funktion, um eine neue Flagge anzuzeigen
    const sendNewFlag = async () => {
      const randomFlag = flags[Math.floor(Math.random() * flags.length)];
      const firstLetterHint = randomFlag.country.charAt(0); // Erster Buchstabe als Tipp

      const embed = new EmbedBuilder()
        .setDescription(`\`🚩\` » Welche Flagge ist das?\n\n\`💡\` » Tipp: Der Name des Landes beginnt mit **${firstLetterHint}**.\n\n\`✍️\` » Schreibe den Namen der Flagge in den Chat!`)
        .setImage(randomFlag.imageUrl)
        .setColor('Random')
        .setFooter({ text: '» Benutze den Button, um die Flagge zu überspringen.', iconURL: `${interaction.guild.iconURL()}` });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('skip_flag')
            .setLabel('➡️ Überspringen')
            .setStyle(ButtonStyle.Secondary)
        );

      // Wenn es bereits eine Nachricht gibt, bearbeiten wir diese anstelle einer neuen
      if (currentFlagMessage) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 Sekunden Pause
        await currentFlagMessage.edit({ embeds: [embed], components: [row] });
      } else {
        await new Promise(resolve => setTimeout(resolve, 3000)); // 3 Sekunden Pause
        currentFlagMessage = await channel.send({ embeds: [embed], components: [row] });
      }

      console.log(`Flagge gezeigt: ${randomFlag.country}, Bild-URL: ${randomFlag.imageUrl}`);
      return randomFlag;
    };

    let currentFlag = await sendNewFlag();

    // Button-Interaktions-Handler
    const filter = (i) => i.customId === 'skip_flag' && i.user.id === interaction.user.id;
    const collector = channel.createMessageComponentCollector({ filter });

    collector.on('collect', async (i) => {
      await i.deferUpdate(); // Interaktion aufschieben, um Zeitüberschreitungen zu vermeiden
      
      // Nachricht senden, dass das Quiz übersprungen wurde
      const skipMessage = await channel.send(`Das Flaggenquiz wurde von ${i.user} übersprungen.`);

      // Nachricht nach 5 Sekunden löschen
      setTimeout(async () => {
        await skipMessage.delete();
      }, 5000);

      // Neue Flagge anzeigen
      currentFlag = await sendNewFlag(); // Embed bearbeiten und neue Flagge anzeigen
    });

    // Nachrichten-Collector für das Erraten der Flagge
    const messageFilter = (msg) => msg.content.toLowerCase() === currentFlag.country.toLowerCase();
    const messageCollector = channel.createMessageCollector({ filter: messageFilter });

    messageCollector.on('collect', async (msg) => {
      await msg.react('✅');
      const correctMessage = await channel.send(`> \`✅\` » Richtig! Das ist die Flagge von **${currentFlag.country}**.`);

      // Nachrichten nach 5 Sekunden löschen
      setTimeout(async () => {
        await msg.delete();
        await correctMessage.delete();
        const currentTime = Math.floor(Date.now() / 1000); // Aktuelle Zeit in Unix-Timestamp
        const timestampAfter5Seconds = currentTime + 5; // Zeit in 5 Sekunden

        const waitingMessage = await channel.send(`> \`❗\` » Bitte warte... **<t:${timestampAfter5Seconds}:R>** geht es weiter.`);
        
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
