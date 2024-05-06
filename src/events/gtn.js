//Guess the number
const { Events } = require("discord.js");
module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if(message.author.bot) return;
        if(!message.channelId === "1231188810029858887") return

        
        const args = message.content.trim().split(/ +/);
        const command = args.shift().toLowerCase();
      
        if (command === '!start') {
          const min = 1;
          const max = 100; 
          
          const number = Math.floor(Math.random() * (min - max + 1)) + min;
      
          message.channel.send({content: `> \`📚\` » Ich denke an eine Zahl zwischen \`1\` und \`1000\`.\n> Kannst du sie Erraten?`});
          
          const filter = m => !isNaN(m.content) && m.author.id === message.author.id;
          const collector = message.channel.createMessageCollector(filter, { time: 60000 }); // Collect guesses for 1 minute
      
          collector.on('collect', m => {
            const guess = parseInt(m.content);
            if (guess === number) {
              collector.stop();
              message.reply(`> \`🥇\` » Du hast die richtige Zahl erraten: \`${number}\`.`);
        }});
      
          collector.on('end', collected => {
            if (collected.size === 0) {
              message.channel.send(`\`❌\` » Die Zeit ist um, Die richtige Zahl war: \`${number}\``);
            }
          });
        }
    }
}