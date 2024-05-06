const { Events, PermissionFlagsBits } = require("discord.js");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot && message.guild) return;
        if (message.channelId !== "1231188810029858887") return;

        const args = message.content.trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === '!start-gtn') {
          if(!message.member.permissions.has(PermissionFlagsBits.Administrator)) return await message.reply({content: `> \`❌\` » Du hast keine Berechtigungen das zu tun.`, ephemeral: true})
            let min = 1;
            let max = 1000;
            let timeLimit = 600000; // Standard: 60 Sekunden

            // Parsing arguments for custom min, max, and time limit
            for (let i = 0; i < args.length; i++) {
                if (args[i] === '-min') {
                    min = parseInt(args[i + 1]);
                } else if (args[i] === '-max') {
                    max = parseInt(args[i + 1]);
                } else if (args[i].endsWith('m')) { // Zeitlimit in Minuten
                    timeLimit = parseInt(args[i]) * 60000;
                } else if (args[i].endsWith('h')) { // Zeitlimit in Stunden
                    timeLimit = parseInt(args[i]) * 3600000;
                }
            }

            const number = Math.floor(Math.random() * (max - min + 1)) + min;
            console.log(number);
            message.channel.send({ content: `> \`📚\` » Ich denke an eine Zahl zwischen \`${min}\` und \`${max}\`.\n> Kannst du sie Erraten?` });

            const filter = m => !isNaN(m.content) && m.author.id === message.author.id;
            const collector = message.channel.createMessageCollector(filter, { time: timeLimit });

            collector.on('collect', m => {
                const guess = parseInt(m.content);
                if (guess === number) {
                    collector.stop();
                    m.reply(`> \`🥇\` » Du hast die richtige Zahl erraten: \`${number}\`.`);
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    message.channel.send(`\`❌\` » Die Zeit ist um, Die richtige Zahl war: \`${number}\``);
                }
            });
        }
    }
  }