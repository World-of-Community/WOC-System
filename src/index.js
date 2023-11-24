const Discord = require('discord.js')
const path = require('node:path');
const fs = require('fs');
const file = fs.readFileSync('src/json/config.json', 'utf-8');
const config = JSON.parse(file);
const bot = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.GuildIntegrations, Discord.GatewayIntentBits.GuildMembers, Discord.GatewayIntentBits.GuildMessageTyping,
        Discord.GatewayIntentBits.GuildMessages, Discord.GatewayIntentBits.GuildPresences, Discord.GatewayIntentBits.Guilds, Discord.GatewayIntentBits.MessageContent, Discord.GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Discord.Partials.Channel, Discord.Partials.User, Discord.Partials.GuildMember, Discord.Partials.Message
    ],
});
// Modules and Files
const mongoose = require('mongoose');
const threaddb = require('../Datenbank/threaddb');
mongoose.connect(config.mongodb, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}).then(console.log('Datenbank ist verbunden'));
const cron = require('node-cron');
const serverdb = require('../Datenbank/serverdb');
const userdb = require('../Datenbank/userdb');
const { deployCommands } = require('./deployCommands');

//Lade Commands
deployCommands()
bot.commands = new Discord.Collection()

const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"))
console.log('-------------------------------------------')
console.log('|   Command                  |   Loaded   |')
console.log('-------------------------------------------')
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        bot.commands.set(command.data.name, command);
        console.log(`|   ${(command.data.name).padEnd(17, ' ')}        |     ✅     |`)
    }
}
console.log('-------------------------------------------')

//Load Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args));
    } else {
        bot.on(event.name, (...args) => event.execute(...args));
    }
}

//     // Ask Command
//     if (interaction.commandName === 'ask') {
//         const texte = [
//             'Also wenn das wahr ist dann bin ich weg...',
//             'Huch! Das stimmt auf keinen Fall!',
//             'Wenn du Meinst...',
//             'Hoffentlich nicht!',
//             'Ja, da gebe ich dir zu 100% Recht :)',
//             'Nein oh bitte nicht, das darf nicht wahr sein!'
//         ]
//         const text = texte[Math.floor(Math.random() * texte.length)]
//         await interaction.reply({
//             content: `${text}`
//         })
//     }

//     // Laugh Command
//     if (interaction.commandName === 'laugh') {
//         const laughgifs = [
//             'https://tenor.com/de/view/funny-laughing-hysterically-crying-gif-21624342.gif',
//             'https://tenor.com/de/view/el-risitas-juan-joya-borja-ratones-coloraos-laugh-meme-laughing-man-gif-24899295.gif',
//             'https://tenor.com/de/view/laugh-gif-20137505.gif',
//             'https://tenor.com/de/view/smile-laughing-laugh-gif-26377590.gif',
//             'https://tenor.com/de/view/laughing-laugh-haha-happy-lol-gif-17298893.gif'
//         ]
//         const mitglied = await interaction.options.getUser('user')
//         const laughgif = laughgifs[Math.floor(Math.random() * laughgifs.length)]
//         await interaction.reply({
//             content: `${mitglied}`,
//             embeds: [
//                 new Discord.EmbedBuilder()
//                     .setDescription(`**${interaction.user}** lacht **${mitglied}** aus. Autsch!`)
//                     .setImage(laughgif)
//                     .setColor('Orange')
//                     .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
//             ]
//         })
//     }

//     // Cringe Command
//     if (interaction.commandName === 'cringe') {
//         const cringegifs = [
//             'https://tenor.com/de/view/homer-simpson-goodbye-bye-disappears-hide-in-the-bushes-gif-3394899.gif',
//             'https://tenor.com/de/view/pedro-monkey-puppet-meme-awkward-gif-15268759.gif',
//             'https://tenor.com/de/view/awkward-silence-what-gif-13940581.gif'
//         ]
//         const mitglied = await interaction.options.getUser('user')
//         const gif = cringegifs[Math.floor(Math.random() * cringegifs.length)]
//         await interaction.reply({
//             content: `${mitglied}`,
//             embeds: [
//                 new Discord.EmbedBuilder()
//                     .setDescription(`**${interaction.user} findet **${mitglied}** echt peinlich.`)
//                     .setImage(gif)
//                     .setColor('Blue')
//                     .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
//             ]
//         })
//     }

//     // Hug Command
//     if (interaction.commandName === 'hug') {
//         const huggifs = [
//             'https://tenor.com/de/view/so-cute-aww-gif-26434851.gif',
//             'https://tenor.com/de/view/hugs-cuddle-hug-gif-26074093.gif',
//             'https://tenor.com/de/view/love-hug-gif-25661526.gif'
//         ]
//         const mitglied = await interaction.options.getUser('user')
//         const gif = huggifs[Math.floor(Math.random() * huggifs.length)]
//         await interaction.reply({
//             content: `${mitglied}`,
//             embeds: [
//                 new Discord.EmbedBuilder()
//                     .setDescription(`**${interaction.user}** hat **${mitglied}** umarmt. Einfach süß die beiden! <:dogsmiley:1037783082620698746>`)
//                     .setImage(gif)
//                     .setColor('Green')
//                     .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
//             ]
//         })
//     }

//     // Brofist Command
//     if (interaction.commandName === 'brofist') {
//         const brofistgifs = [
//             'https://tenor.com/de/view/ken-ryu-brofist-street-fighter-gif-9219109.gif',
//             'https://tenor.com/de/view/bro-gif-26275846.gif',
//             'https://tenor.com/de/view/free-anime-rin-matsuoka-sousuke-gif-18204553.gif',
//             'https://tenor.com/de/view/army-fist-bump-friendship-army-of-two-the-devils-cartel-gif-6195745.gif'
//         ]
//         const mitglied = await interaction.options.getUser('user')
//         const gif = brofistgifs[Math.floor(Math.random() * brofistgifs.length)]
//         await interaction.reply({
//             content: `${mitglied}`,
//             embeds: [
//                 new Discord.EmbedBuilder()
//                     .setDescription(`**${interaction.user}** hat mit **${mitglied}** eine Brofist vollzogen. Wie cool! <a:Cool:915211628755169301>`)
//                     .setImage(gif)
//                     .setColor('Aqua')
//                     .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
//             ]
//         })
//     }

//     // Pat Command
//     if (interaction.commandName === 'pat') {
//         const patgifs = [
//             'https://tenor.com/de/view/bunny-gif-4514864.gif',
//             'https://tenor.com/de/view/good-boy-pat-on-head-stitch-gif-14742401.gif',
//             'https://tenor.com/de/view/big-hero6-baymax-there-there-patting-head-pat-head-gif-4086973.gif'
//         ]
//         const mitglied = await interaction.options.getUser('user')
//         const gif = patgifs[Math.floor(Math.random() * patgifs.length)]
//         await interaction.reply({
//             content: `${mitglied}`,
//             embeds: [
//                 new Discord.EmbedBuilder()
//                     .setDescription(`**${interaction.user}** streichelt **${mitglied}**. Wie niedlich!`)
//                     .setImage(gif)
//                     .setColor('Purple')
//                     .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
//             ]
//         })
//     }

//     // Uptime
//     if (interaction.commandName === 'uptime') {
//         function formatUptime(uptime) {
//             const seconds = Math.floor(uptime % 60);
//             const minutes = Math.floor((uptime / 60) % 60);
//             const hours = Math.floor((uptime / 3600) % 24);
//             const days = Math.floor(uptime / 86400);

//             return `${days}d ${hours}h ${minutes}m`;
//         }
//         const uptime = formatUptime(process.uptime());
//         const ping = Date.now() - interaction.createdTimestamp;
//         const uptimeEmbed = new Discord.EmbedBuilder()
//             .setTitle('`🤖` × Interessante Bot Statistiken')
//             .setDescription(`» Hier siehst du ein paar Interessante Infos, die in speziellen Fällen auch sehr nützlich sein könnten.\n\n\`🔋\` » **Online** seit \`${uptime}\`\n\`📡\` » Meine **Reaktionszeit** liegt bei: \`${ping}\`ms`)
//             .setThumbnail('https://cdn.discordapp.com/attachments/1145779055644393592/1151073428099575858/WOC_Orange.png')
//             .setColor('Orange')
//             .setFooter({ text: 'WOC System - Bot', iconURL: 'https://cdn.discordapp.com/attachments/1145779055644393592/1151073428099575858/WOC_Orange.png' });
//         interaction.reply({ embeds: [uptimeEmbed], ephemeral: true });
//     }

//     // Report System
//     if (interaction.commandName === 'report') {
//         const reportedUser = await interaction.options.getUser('user');
//         const grund = interaction.options.getString('grund');
//         const reportchannel = '1010515517460725782';
//         const reportedMember = await interaction.guild.members.fetch(reportedUser.id)

//         const createdAt = `<t:${Math.round(reportedUser.createdTimestamp / 1000)}>`;
//         const joinedAt = `<t:${Math.round(reportedMember.joinedTimestamp / 1000)}>`;

//         if (reportedUser.id == interaction.user.id) {
//             return await interaction.reply({ content: "> `❌` » Du kannst dich nicht selbst melden.", ephemeral: true })
//         }
//         if (reportedUser.bot == true) {
//             return await interaction.reply({ content: "> `❌` » Du kannst keine Bots melden.", ephemeral: true });
//         }
//         const reportEmbed = new Discord.EmbedBuilder()
//             .setTitle(`\`📝\` | Neuer Report von ${interaction.user.displayName}`)
//             .setDescription(`${reportedUser} wurde von ${interaction.user} gemeldet.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\nReportgrund: ${grund}\nBenutzername: ${reportedUser.displayName} (\`${reportedUser.id}\`) (${reportedUser})\nAccount erstellt am: ${createdAt}\nBeigetreten am: ${joinedAt}`)
//             .setFooter({ text: "©️ World Of Community - Report System", iconURL: "https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png" })
//             .setColor('Red')
//         const modChannel = interaction.guild.channels.cache.find(channel => channel.id === reportchannel);
//         if (modChannel) {
//             modChannel.send({ embeds: [reportEmbed] });
//             await interaction.reply({ content: "> `✅` » der Report wurde gesendet. Vielen Dank!", ephemeral: true });
//         } else {
//             await interaction.reply({ content: "> `❌` » Es wurde kein Report-Kanal gefunden.", ephemeral: true });
//         }
//     }

//     // Server-Info
//     if (interaction.commandName === 'server') {
//         const serverEmbed = new Discord.EmbedBuilder()
//             .setTitle('Unsere Server Information')
//             .setDescription('Information zum Discord Server\n> `⏰` » Server Erstellt: `01.03.2021`\n\nInformation zum Minecraft Server\n> `🌍` » Server Version: `1.16.5 - 1.20.1`\n> `🔋` » Server Kapazität: `100👥`\n\nBeschreibung:\nWir bieten der Community die Spielmodi KnockbackFFA und Minigames an, es gibt viele Verschiedene und Einzigartige Spieler-Ränge...')
//             .setColor('#5385ac')
//             .setFooter({ text: 'World Of Community | Server Information', iconURL: 'https://cdn.discordapp.com/attachments/1145779055644393592/1151073428099575858/WOC_Orange.png' });

//         interaction.reply({ embeds: [serverEmbed], ephemeral: true });
//     }

//     // Aktivieren
//     

//     // Deaktivieren
//     

//     // Ping-Reaktion Command
//     if (interaction.commandName === 'emoji') {
//         const emojisInput = interaction.options.getString('emojis')
//         const userData = await userdb.findOne({ userID: interaction.user.id })
//         if (!userData) return;
//         const emojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>/g;
//         const emojis = emojisInput.match(emojiRegex);
//         if (!emojis) return interaction.reply({ content: '> `❗` » Bitte füge min. 1 Emoji hinzu.', ephemeral: true })
//         if (emojis.length > 3) return interaction.reply({ content: '> `❌` » Du kannst nicht mehr als **3 Emojis** auswählen.', ephemeral: true })

//         const emojiArray = emojis ? emojis.map(emoji => emoji.toString()) : [];

//         await userdb.findOneAndUpdate({ userID: interaction.user.id }, { $set: { reactions: emojiArray } })
//         await interaction.reply({ content: '> `✅` » Die Emojis wurden erfolgreich hinzugefügt.', ephemeral: true })
//     }

//     // Accept - Suggestion
//     if (interaction.commandName === 'accept') {
//         if (!interaction.member.permissions.has('Administrator')) return;

//         const msgId = interaction.options.getString('nachrichtenid');
//         const grund = interaction.options.getString('grund');
//         const channel = bot.channels.cache.get(config.vorschläge);

//         if (!channel) return;

//         await channel.messages.fetch(`${msgId}`).then(async (msg) => {
//             if (!msg) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
//             if (!msg.embeds || msg.embeds.length === 0) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
//             const vorschlagEmbed = msg.embeds[0];
//             if (!vorschlagEmbed.fields) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })

//             const thumbsUpReactions = msg.reactions.cache.find(reaction => reaction.emoji.name === 'upvote');
//             const thumbsUpCount = thumbsUpReactions ? thumbsUpReactions.users.cache.size : 0;

//             const thumbsDownReactions = msg.reactions.cache.find(reaction => reaction.emoji.name === 'downvote');
//             const thumbsDownCount = thumbsDownReactions ? thumbsDownReactions.users.cache.size : 0;

//             const editEmbed = new Discord.EmbedBuilder()
//                 .setAuthor({ name: `Akzeptiert von ${interaction.user.displayName}` })
//                 .setTitle('» `✅` - VORSCHLAG AKZEPTIERT!')
//                 .setDescription(`${vorschlagEmbed.description}`)
//                 .setColor('#37ff00')
//                 .addFields(
//                     { name: '`📊` - **Community-Voting**', value: `» IHR habt abgestimmt: \`${thumbsUpCount - 1}\` <a:upvote:1033452503309758525> | <a:downvote:1033452526340673596> \`${thumbsDownCount - 1}\`` },
//                     { name: '`✅` - **Status**', value: `» Dieser Vorschlag wurde vom Team angenommen.\n**Grund:** \`${grund}\` ` }
//                 )
//                 .setThumbnail('https://cdn.discordapp.com/attachments/1145779055644393592/1146793338251522048/akzeptiert.png')
//                 .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779363019751554/WOC_Server_Idee_Akzeptiert.png')

//             msg.edit({ embeds: [editEmbed] });
//             await msg.reactions.removeAll()
//             interaction.reply({ content: '> `✅` » Du hast diesen Vorschlag akzeptiert.', ephemeral: true });
//         });
//     }

//     // Editing - Suggestion
//     if (interaction.commandName === 'editing') {
//         if (!interaction.member.permissions.has('Administrator')) return;

//         const msgId = interaction.options.getString('nachrichtenid');
//         const grund = interaction.options.getString('grund');
//         const channel = bot.channels.cache.get(config.vorschläge);

//         if (!channel) return;

//         await channel.messages.fetch(`${msgId}`).then(async (msg) => {
//             if (!msg) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
//             if (!msg.embeds || msg.embeds.length === 0) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
//             const vorschlagEmbed = msg.embeds[0];
//             if (!vorschlagEmbed.fields) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })

//             const thumbsUpReactions = msg.reactions.cache.find(reaction => reaction.emoji.name === 'upvote');
//             const thumbsUpCount = thumbsUpReactions ? thumbsUpReactions.users.cache.size : 0;

//             const thumbsDownReactions = msg.reactions.cache.find(reaction => reaction.emoji.name === 'downvote');
//             const thumbsDownCount = thumbsDownReactions ? thumbsDownReactions.users.cache.size : 0;

//             const editEmbed = new Discord.EmbedBuilder()
//                 .setAuthor({ name: `in Planung von ${interaction.user.displayName}` })
//                 .setTitle('VORSCHLAG IN PLANUNG!')
//                 .setDescription(`${vorschlagEmbed.description}`)
//                 .setColor('#ff6600')
//                 .addFields(
//                     { name: '`📊` - **Community-Voting**', value: `» IHR habt abgestimmt: \`${thumbsUpCount - 1}\` <a:upvote:1033452503309758525> | <a:downvote:1033452526340673596> \`${thumbsDownCount - 1}\`` },
//                     { name: '`🚧` - **Status**', value: `» Dieser Vorschlag ist bereits in Planung und wird bald umgesetzt.\n**Grund:** \`${grund}\` ` }
//                 )
//                 .setThumbnail('https://cdn.discordapp.com/attachments/1145779055644393592/1146793359231430676/bearbeitung.png')
//                 .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1165934478028447764/WOC_Banner_Server_Idee_in_Planung.jpg?ex=6548a819&is=65363319&hm=0ecdc4384b7247f1bc07d5b0414690a530da1370739d2e6d1ec3351c1f6f71f0&')

//             msg.edit({ embeds: [editEmbed] });
//             await msg.reactions.removeAll()
//             interaction.reply({ content: '> `🚧` » Du hast diesen Vorschlag in Planung genommen.', ephemeral: true });
//         });
//     }

//     // Deny - Suggestion
//     if (interaction.commandName === 'deny') {
//         if (!interaction.member.permissions.has('Administrator')) return;

//         const msgId = interaction.options.getString('nachrichtenid');
//         const grund = interaction.options.getString('grund');
//         const channel = bot.channels.cache.get(config.vorschläge);

//         if (!channel) return;

//         await channel.messages.fetch(`${msgId}`).then(async (msg) => {
//             if (!msg) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
//             if (!msg.embeds || msg.embeds.length === 0) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })
//             const vorschlagEmbed = msg.embeds[0];
//             if (!vorschlagEmbed.fields) return interaction.reply({ content: '> `❌` » Die Nachricht konnte nicht gefunden werden.', ephemeral: true })

//             const thumbsUpReactions = msg.reactions.cache.find(reaction => reaction.emoji.name === 'upvote');
//             const thumbsUpCount = thumbsUpReactions ? thumbsUpReactions.users.cache.size : 0;

//             const thumbsDownReactions = msg.reactions.cache.find(reaction => reaction.emoji.name === 'downvote');
//             const thumbsDownCount = thumbsDownReactions ? thumbsDownReactions.users.cache.size : 0;

//             const editEmbed = new Discord.EmbedBuilder()
//                 .setAuthor({ name: `Abgelehnt von ${interaction.user.displayName}` })
//                 .setTitle('» `❌` - VORSCHLAG ABGELEHNT!')
//                 .setDescription(`${vorschlagEmbed.description}`)
//                 .setColor('#ff2600')
//                 .addFields(
//                     { name: '`📊` - **Community-Voting**', value: `» IHR habt abgestimmt: \`${thumbsUpCount - 1}\` <a:upvote:1033452503309758525> | <a:downvote:1033452526340673596> \`${thumbsDownCount - 1}\`` },
//                     { name: '`❌` - **Status**', value: `» Dieser Vorschlag wurde vom Team abgelehnt.\n**Grund:** \`${grund}\` ` }
//                 )
//                 .setThumbnail('https://cdn.discordapp.com/attachments/1145779055644393592/1146793380085518407/abgelehnt.png')
//                 .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779340601213069/WOC_Server_Idee_Abgelehnt.png')

//             msg.edit({ embeds: [editEmbed] });
//             await msg.reactions.removeAll()
//             interaction.reply({ content: '> `❌` » Du hast diesen Vorschlag abgelehnt.', ephemeral: true });
//         });
//     }




//     // Unban Command
//     

//     // Bot News Command
//     

//     // Ränge Menu
//     if (interaction.customId === 'ränge-menu') {
//         switch (interaction.values[0]) {
//             case 'server': {
//                 const year = interaction.guild.roles.cache.get('972193356333604874')
//                 const roleCountY = year.members.size

//                 const informant = interaction.guild.roles.cache.get('1147250265641201724')
//                 const roleCountI = informant.members.size

//                 const umfrage = interaction.guild.roles.cache.get('1147250982967836823')
//                 const roleCountU = umfrage.members.size

//                 const SDES = interaction.guild.roles.cache.get('992008555987222548')
//                 const roleCountSDES = SDES.members.size

//                 const christmas = interaction.guild.roles.cache.get('863034801036591114')
//                 const roleCountC = christmas.members.size

//                 const lucky = interaction.guild.roles.cache.get('1124598019862573096')
//                 const roleCountlucky = lucky.members.size

//                 const serverEST = interaction.guild.roles.cache.get('882240367632744508')
//                 const roleCountSEST = serverEST.members.size

//                 const serverEmbed = new Discord.EmbedBuilder()
//                     .setTitle('<a:trophe:1112823561992818859> 𑁉 UNSERE SERVER-ERFOLGE')
//                     .setDescription(`» Mit **Erfolgen** kannst du **vor deinen Freunden** angeben und hast die Chance, in unserem Server **einzigartige Erfolge freizuschalten!**\n\n\`🧡\` 𑁉 <@&972193356333604874> (\`${roleCountY}👥\`)\n<:Pfeil:1119709908540076124> Mitglied seit **einem Jahr** auf dem Server.\n\n\`💡\` 𑁉 <@&1147250265641201724> (\`${roleCountI}👥\`)\n<:Pfeil:1119709908540076124> Reiche **10 Server-Ideen** ein.\n\n\`📢\` 𑁉 <@&1147250982967836823> (\`${roleCountU}👥\`)\n<:Pfeil:1119709908540076124> Nimm an **20 Server-Umfragen** teil.\n\n \`💚\` 𑁉 <@&992008555987222548> (\`${roleCountSDES}👥\`)\n<:Pfeil:1119709908540076124> **Seit 2021** auf World Of Community\n\n \`🎄\` 𑁉 <@&863034801036591114> (\`${roleCountC}👥\`)\n<:Pfeil:1119709908540076124> Exklusiv an **Weihnachten 2021** erhalten\n\n \`☘️\` 𑁉 <@&1124598019862573096> (\`${roleCountlucky}👥\`)\n<:Pfeil:1119709908540076124> **Gewinne** bei einem Event auf WOC.\n\n \`🔓\` 𑁉 <@&882240367632744508> (\`${roleCountSEST}👥\`)\n<:Pfeil:1119709908540076124> War bei der **Server-Eröffnung 2021** dabei.`)
//                     .setColor('#ff7300')
//                     .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779095284748408/WOC_Banner_Server_Erfolge.png')
//                     .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
//                     .setTimestamp()
//                 await interaction.reply({ embeds: [serverEmbed], ephemeral: true })
//             } break;

//             case 'spieler': {
//                 const supreme = interaction.guild.roles.cache.get('815921105407574056')
//                 const roleCountsupreme = supreme.members.size

//                 const premium = interaction.guild.roles.cache.get('917826787977871441')
//                 const roleCountpremium = premium.members.size

//                 const legende = interaction.guild.roles.cache.get('815920452337139733')
//                 const roleCountlegende = legende.members.size

//                 const emerald = interaction.guild.roles.cache.get('835775556611997697')
//                 const roleCountemerald = emerald.members.size

//                 const diamond = interaction.guild.roles.cache.get('835775627721179167')
//                 const roleCountdiamond = diamond.members.size

//                 const episch = interaction.guild.roles.cache.get('835775597446955048')
//                 const roleCountepisch = episch.members.size

//                 const mitglied = interaction.guild.roles.cache.get('815920703067914290')
//                 const roleCountmitglied = mitglied.members.size

//                 const spielerEmbed = new Discord.EmbedBuilder()
//                     .setTitle('`👥` 𑁉 UNSERE SPIELER-RÄNGE')
//                     .setDescription(`» Du kannst **Kostenlos** den Epischen-Rang nach **2 Wochen** Spielzeit dir Freischalten oder andere höhere Spieler-Ränge durch eine Spende erhalten.\n\n> \`🌟\` 𑁉 <@&815921105407574056> (\`${roleCountsupreme}👥\`)\n<:PfeilBlau:1119711275014955080> Mehr Vorteile als der **Premium-Rang**\n\n> \`⭐\` 𑁉 <@&917826787977871441> (\`${roleCountpremium}👥\`)\n<:PfeilBlau:1119711275014955080> Mehr Vorteile als der **Legenden-Rang**\n\n> \`🔮\` 𑁉 <@&815920452337139733> (\`${roleCountlegende}👥\`)\n<:PfeilBlau:1119711275014955080> Mehr Vorteile als der **Emerald-Rang**\n\n> \`👻\` 𑁉 <@&835775556611997697> (\`${roleCountemerald}👥\`)\n<:PfeilBlau:1119711275014955080> Mehr Vorteile als der **Diamond-Rang**\n\n> \`💎\` 𑁉 <@&835775627721179167> (\`${roleCountdiamond}👥\`)\n<:PfeilBlau:1119711275014955080> Mehr Vorteile als der **Episch-Rang**\n\n> \`🟣\` 𑁉 <@&835775597446955048> (\`${roleCountepisch}👥\`)\n<:PfeilBlau:1119711275014955080> Mehr Vorteile als **Spieler-Rang**\n\n> \`👥\` 𑁉 <@&815920703067914290> (\`${roleCountmitglied}👥\`)\n<:PfeilBlau:1119711275014955080> **Standard-Rang** auf dem server.`)
//                     .setColor('Grey')
//                     .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779427477827614/WOC_Spieler_Range.png')
//                     .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
//                     .setTimestamp()
//                 await interaction.reply({ embeds: [spielerEmbed], ephemeral: true })
//             } break;

//             case 'exklusive': {
//                 const vip = interaction.guild.roles.cache.get('862708375698538507')
//                 const roleCountvip = vip.members.size

//                 const booster = interaction.guild.roles.cache.get('843013551605284864')
//                 const roleCountbooster = booster.members.size

//                 const creator = interaction.guild.roles.cache.get('815920219247214644')
//                 const roleCountcreator = creator.members.size

//                 const twitchsub = interaction.guild.roles.cache.get('1067899186542018571')
//                 const roleCounttwitchsub = twitchsub.members.size

//                 const unterstützer = interaction.guild.roles.cache.get('1010105569866174574')
//                 const roleCountunterstützer = unterstützer.members.size


//                 const exklusiveEmbed = new Discord.EmbedBuilder()
//                     .setTitle('<a:krone:1112823594649665607> 𑁉 EXKLUSIVE ROLLEN FREISCHALTEN')
//                     .setDescription(`» Alle **Ränge in dieser Liste** kannst du nur auf ganz **bestimmter Art und Weise** erhalten, dennoch haben sie **mächtige Vorteile.**\n\n> \`🔮\` 𑁉 <@&843013551605284864> (\`${roleCountbooster}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Booste diesen Server!\n\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`😎\` 𑁉 <@&862708375698538507> (\`${roleCountvip}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n<:PfeilBlau:1119711275014955080>  **Fremde Emojis** verwenden & **Links** einbetten.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`🎥\` 𑁉 <@&815920219247214644> (\`${roleCountcreator}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`💜\` 𑁉 <@&1067899186542018571> (\`${roleCounttwitchsub}👥\`)\n<:Pfeil:1119709908540076124> **Rang Freischalten:** Kaufe dir einen Sub bei [Red3405](https://www.twitch.tv/red340505tv) auf Twitch und erhalte diesen Rang auf unserem Discord Server.\n\n<:PfeilBlau:1119711275014955080>  **Fremde Emojis** verwenden & **Links** einbetten.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`💛\` 𑁉 <@&1010105569866174574> (\`${roleCountunterstützer}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** im Status \`discord.gg/woc\` schreiben!\n\n<:PfeilBlau:1119711275014955080>  **Fremde Emojis** verwenden & **Links** einbetten.\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!`)
//                     .setColor('#105f93')
//                     .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1165934440111947836/WOC_Banner_Exklusive_Range.jpg?ex=6548a810&is=65363310&hm=89256e89f794c1320066eb5bc5e8a67e9c47b3570b29e6f103e0e553dda627e5&')
//                     .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
//                     .setTimestamp()
//                 await interaction.reply({ embeds: [exklusiveEmbed], ephemeral: true })
//             } break;

//             case 'team': {
//                 async function getMemberList(roleID) {
//                     var liste = ""
//                     const role = interaction.guild.roles.cache.find((r) => r.id === roleID);
//                     const rolemember = role.members
//                     rolemember.forEach(async element => {
//                         liste += `<@${element.user.id}> , `
//                     });
//                     if (liste.length == 0) { return 'Niemand' }
//                     return liste.slice(0, -2);
//                 }
//                 const admin = interaction.guild.roles.cache.get('959869691529154631')
//                 const roleCountadmin = admin.members.size

//                 const leitung = interaction.guild.roles.cache.get('893423428558782465')
//                 const roleCountleitung = leitung.members.size

//                 const developer = interaction.guild.roles.cache.get('929349039433056276')
//                 const roleCountdeveloper = developer.members.size

//                 const srmoderator = interaction.guild.roles.cache.get('816985466230145044')
//                 const roleCountsrmoderator = srmoderator.members.size

//                 const moderator = interaction.guild.roles.cache.get('815920052385480754')
//                 const roleCountmoderator = moderator.members.size

//                 const supporter = interaction.guild.roles.cache.get('815920170371383366')
//                 const roleCountsupporter = supporter.members.size

//                 const teamEmbed = new Discord.EmbedBuilder()
//                     .setTitle('<a:security:1119708496670232646> 𑁉 UNSER SERVER-TEAM')
//                     .setDescription(`» Hier kannst du alle **unsere Team-Ränge** sehen und welche User **aktuell in unserem Server-Team** tätig sind.\n\n> \`🎯\` 𑁉 <@&959869691529154631> (\`${roleCountadmin}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Administration kümmert sich um die ganze Server-Verwaltung, die Organisation und um die Umsetzung neuer Ideen.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(admin.id)}\n\n> \`👨‍✈️\` 𑁉 <@&893423428558782465> (\`${roleCountleitung}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Leitung greifen größtenteils der Administration unter die Arme oder bearbeiten teilweise schon Bewerbungen mit uns.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(leitung.id)}\n\n> \`👨‍💻\` 𑁉 <@&929349039433056276> (\`${roleCountdeveloper}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Developer/Entwickler kümmern sich um die Entwicklung unserer Bots und helfen der Administrator bei der technischen Umsetzung.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(developer.id)}\n\n> \`🕵\` 𑁉 <@&816985466230145044> (\`${roleCountsrmoderator}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Senior-Mod's sind erfahrene Moderatoren und kümmern sich um die Pflege des Support-Teams. Sie agieren als eine Art von "Mentor" und führt neue Teammitglieder ein.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(srmoderator.id)}\n\n> \`👮\` 𑁉 <@&815920052385480754> (\`${roleCountmoderator}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Mods sind wichtige Bestandteile des Teams. Sie kümmern sich um Tickets, Moderation und administrieren kleinere Elemente (wie das Bann-System).\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(moderator.id)}\n\n> \`🧩\` 𑁉 <@&815920170371383366> (\`${roleCountsupporter}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Supporter sind neu in unserem Team. Sie kümmern sich um Support-Tickets, moderieren den Chat und gewöhnen sich ein.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(supporter.id)}`)
//                     .setColor('#ff2600')
//                     .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779266122944632/WOC_Banner_Team_Range.png')
//                     .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
//                     .setTimestamp()
//                 await interaction.reply({ embeds: [teamEmbed], ephemeral: true })
//             } break;

//             case 'bot': {
//                 const botEmbed = new Discord.EmbedBuilder()
//                     .setTitle('`🤖` 𑁉 UNSERE WICHTIGSTEN BOTS')
//                     .setDescription('» Hier könnt ihr sehen **welche Aufgaben** unsere **wichtigsten Bots** haben, die speziell **von uns entwickelt** wurden.\n\n> `⚙️` 𑁉 <@1020023299448786955> (Eingeführt am `15.09.2022📝`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Aufgaben dieses Bots sind sehr vielfältig. Wir listen euch einmal die größten Dinge auf.\n\n<:PfeilBlau:1119711275014955080> **Info-& Stats-Kanäle aktuell halten**\n<:PfeilBlau:1119711275014955080> **Ideen-, Spielersuche-& Changelog-System**\n<:PfeilBlau:1119711275014955080> **Bewerbungs-& Rollen-Verwaltung**\n\n> \`🚑\` 𑁉 <@1031487336783028274> (Tickets bearbeitet: `10.000+🎫`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Erstellung, Verwaltung und Organisierung von Tickets.\n\n> \`🎁\` 𑁉 <@1030858684584169612> (Gewinnspiele beendet: `1.000+🎀`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Komplette Verwaltung aller Gewinnspiele.\n\n> \`✅\` 𑁉 <@1031487617193226300> (Verifiziert: `100+🌍`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Verifizierung von Discord & Minecraft Account auf dem Server-Netzwerk.\n\n> \`🤖\` 𑁉 **DIE RESTLICHEN BOTS...**\n<:Pfeil:1119709908540076124> **Aufgaben:** Die restlichen Bots erfüllen nur noch kleine Aufgaben oder werden bald durch einen eigenen Bot von uns ersetzt.')
//                     .setColor('#318c86')
//                     .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1170776135605424300/WOC_Banner_Discord_Bots.jpg?ex=655a453e&is=6547d03e&hm=97479df4c4d89ec4e6d8c5a7e8ffa5e164298b6de5cd75b8d5763d039fd02545&')
//                     .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
//                     .setTimestamp()
//                 await interaction.reply({ embeds: [botEmbed], ephemeral: true })
//             } break;
//         }
//     }

//     // Seite 2
//     if (interaction.customId === 'seite-2') {
//         const seite2Embed = new Discord.EmbedBuilder()
//             .setTitle('<:PointRed:1123612255800524940> » World Of Community - Regelwerk (Seite 2)')
//             .setDescription('» An diesen Regeln musst du dich jederzeit halten, damit wir eine friedliche Atmosphäre wahren können. Solltest du dies nicht tun, können Sanktionen gegen deinem Account folgen.\n\n───────────────────────── \n\n1️⃣1️⃣ 𑁉 Jegliche Inhalte sind in angemessener Form & Formattierung zu teilen. Dies betrifft zum Beispiel Nicknamen & Nachrichten.\n\n1️⃣2️⃣ 𑁉 Die Verbreitung von Viren oder unerlaubten Clientmodifikationen für Anwendungen ist nicht gestattet.\n\n1️⃣3️⃣ 𑁉 Im Zweifelsfall ist das Team berechtigt nach eigenem Ermessen zu handeln, eine Strafe muss nicht anhand einer Regel gerechtfertigt sein.\n\n1️⃣4️⃣ 𑁉 Das Ausnutzen von Bot-Systemen (Support, Server-Ideen, o.ä.) ist untersagt, um unsere Arbeit nicht zu behindern.\n\n 1️⃣5️⃣ 𑁉 Unterhaltungen sollten immer auf Deutsch (gelegentlich auf Englisch) geführt werden, damit unser Team alle Konversationen nachvollziehen kann.\n\n1️⃣6️⃣ 𑁉 Unwissenheit schützt nicht vor einer Strafe. Allerdings hast du das Recht, einen Antrag auf Entsperrung bei uns einzureichen.')
//             .setColor('#c53a2b')
//             .setImage('https://cdn.discordapp.com/attachments/943859953318371359/1045406350903095357/WOC_Server_Regeln.png')

//         const regelButton = new Discord.ActionRowBuilder()
//             .addComponents(
//                 new Discord.ButtonBuilder()
//                     .setCustomId('verifizieren')
//                     .setLabel('✅ » Verifizieren')
//                     .setStyle(Discord.ButtonStyle.Success)
//             )
//         await interaction.reply({ embeds: [seite2Embed], components: [regelButton], ephemeral: true })
//     }

//     // Verifizierung
//     if (interaction.customId === 'verifizieren') {
//         const rndNumber = Math.floor(Math.random() * 999) + 1000
//         let verifyNumber = rndNumber.toString()
//         const verifyModal = new Discord.ModalBuilder()
//             .setTitle('Verifiziere dich!')
//             .setCustomId('verify-modal');

//         const verifyInput = new Discord.TextInputBuilder()
//             .setCustomId('verifyInput')
//             .setLabel(`Dein Verifizierungscode: ${verifyNumber}`)
//             .setMinLength(4)
//             .setStyle(Discord.TextInputStyle.Short)
//             .setRequired(true);

//         const row = new Discord.ActionRowBuilder().addComponents(verifyInput);
//         verifyModal.addComponents(row);
//         await interaction.showModal(verifyModal).then(msg => {
//             bot.on('interactionCreate', async (inter) => {
//                 if (inter.customId === 'verify-modal') {
//                     const input = inter.fields.getTextInputValue('verifyInput')

//                     if (input !== verifyNumber) {
//                         await inter.reply({ content: '> \`❌\` » Dieser Verifizierungscode war falsch, Bitte versuche es erneut.', ephemeral: true })
//                     }
//                     if (input === verifyNumber) {
//                         inter.member.roles.add(config.verifyRolle)
//                         await inter.reply({ content: `> \`✅\` » Die Verifizierung war **erfolgreich**, du hast die <@&${config.verifyRolle}>-Rolle bekommen. Viel Spaß auf dem Server.`, ephemeral: true })
//                     }
//                 }
//             });
//         });
//     }
// });

// // Presence Update
// bot.on('presenceUpdate', async (oldPresence, newPresence) => {
//     if (newPresence.guild.id !== config.server) return;
//     const role = newPresence.guild.roles.cache.get(config.vanityRole);
//     const member = newPresence.member;
//     const activities = member.presence.activities[0];

//     if (activities && activities.state) {
//         const state = activities.state;
//         if (state.includes(`.gg/${config.vanity}`) || state.includes(`discord.gg/${config.vanity}`)) {
//             member.roles.add(role);
//         } else {
//             if (member.roles.cache.get(role.id)) {
//                 member.roles.remove(role);
//             }
//         }
//     }
// });

// // Guild Member Add
// bot.on('guildMemberAdd', async (member) => {
//     const welcomeChannel = bot.channels.cache.get(config.willkommen)

//     const contents = [
//         `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **ist gerade auf den Server geschlittert** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Ein wildes** ${member} (\`#${member.guild.memberCount}\`) **erscheint!** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **hat den weg gefunden** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **ist gelandet** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **ist auf den Server gehüpft** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **bringt Kekse** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Kann jemand** ${member} (\`#${member.guild.memberCount}\`) **etwas herumführen?** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Huch!** ${member} (\`#${member.guild.memberCount}\`) **ist zu uns gestolpert** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Heißen wir** ${member} (\`#${member.guild.memberCount}\`) **Willkommen bei uns!** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **gibt allen eine Runde aus, Willkommen** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Willkommen** ${member} (\`#${member.guild.memberCount}\`) **Wir hoffen, du hast Pizza mitgebracht.** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Hey** ${member} (\`#${member.guild.memberCount}\`) **sind wir froh das du uns gefunden hast** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Juhu,** ${member} (\`#${member.guild.memberCount}\`) **du hast es zu uns geschafft!** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Herzlich Willkommen** ${member} (\`#${member.guild.memberCount}\`) **Sag hallo** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **Hilft uns die Welt zu erobern.** <a:winken:1086560167442796544>`,
//         `<a:Join:978633410992021524> **Danke dass du uns eine Chance gibst,** ${member} (\`#${member.guild.memberCount}\`) **Willkommen!** <a:winken:1086560167442796544>`
//     ]
//     const rndContent = Math.floor(Math.random() * contents.length)

//     await welcomeChannel.send({ content: `${contents[rndContent]}` })
// });

// Threads Checker
cron.schedule('0 0 * * *', async () => {
    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const threads = await threaddb.find();

    for (const thread of threads) {
        const threadCreatedAt = new Date(thread.createdAt);
        const currentTime = new Date();

        if (currentTime - threadCreatedAt >= sevenDaysInMilliseconds) {
            const threadChannel = await bot.channels.cache.get(thread.threadID)

            if (threadChannel) {
                await threadChannel.delete();
                await threaddb.findOneAndDelete({ threadID: thread.threadID });
            }
        }
    }
});

// Changelog Embed
cron.schedule('0 0 * * 1', async () => {
    const channel = bot.channels.cache.get(config.changelog);
    const serverData = await serverdb.findOne({ guildID: config.server })

    if (!serverData) return;
    if (await serverdb.findOne({ guildID: config.server, deactivated: { $in: ['changelog'] } })) return channel.send({ content: '> `⛔` » Das Changelog System ist momentan deaktiviert.' })

    // Week Date
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 6);

    const todayDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const nextWeekDate = `${nextWeek.getDate().toString().padStart(2, '0')}.${(nextWeek.getMonth() + 1).toString().padStart(2, '0')}`;

    const changelogEmbed = new Discord.EmbedBuilder()
        .setTitle(`<a:Neuigkeiten:1018910061348798564> » UPDATE-WOCHENRÜCKBLICK [${todayDate} - ${nextWeekDate}]`)
        .setDescription('<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointYellow:1123612299140280400> = Wartungsarbeiten\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n> In dieser Woche gab es keine Änderung.\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀')
        .setColor('#ff7b00')
        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1146801543056723968/Update_WochenRuckblick_Banner.png')
        .setFooter({ text: 'Wir wünschen euch viel Spaß mit dem neuen Update!', iconURL: 'https://cdn.discordapp.com/attachments/943859953318371359/1055943224092532846/WOC_Orange.png' })
        .setTimestamp()

    if (serverData.support.length > 0) {
        changelogEmbed.addFields(
            {
                name: '> <:Moderator:873823260507262996> - **WOC`👮`SUPPORT (BOT)** - UPDATE',
                value: `${serverData.support.join('\n')}`
            }
        )
    }
    if (serverData.system.length > 0) {
        changelogEmbed.addFields(
            {
                name: '> <a:System:915211580805881876> - **WOC`⚙️`SYSTEM (BOT)** - UPDATE',
                value: `${serverData.system.join('\n')}`
            }
        )
    }
    if (serverData.gift.length > 0) {
        changelogEmbed.addFields(
            {
                name: '> <a:Giveaway:1072144077103054909> - **WOC`🎁`GIFT (BOT)** - UPDATE',
                value: `${serverData.gift.join('\n')}`
            }
        )
    }
    if (serverData.verify.length > 0) {
        changelogEmbed.addFields(
            {
                name: '> <a:yes_tick:1042831133303386122> - **WOC`✅`VERIFY (BOT)** - UPDATE',
                value: `${serverData.verify.join('\n')}`
            }
        )
    }
    if (serverData.minecraft.length > 0) {
        changelogEmbed.addFields(
            {
                name: '> <a:MinecraftGrassBlock:872034424181637171> - **MINECRAFT SERVER** - UPDATE',
                value: `${serverData.minecraft.join('\n')}`
            }
        )
    }

    await channel.send({ content: 'Eine neue Woche, ein neues Glück <a:discordbloblove:855482395325890570>', embeds: [changelogEmbed] }).then(async (msg) => {
        serverData.updateMessage = msg.id
        serverData.updateWeek = `${todayDate} - ${nextWeekDate}`
        await serverData.save()
    })
});

// 18 Uhr Message
cron.schedule('0 18 * * 0', async () => {
    const channel = bot.channels.cache.get(config.changelog);
    const serverData = await serverdb.findOne({ guildID: config.server })

    if (!serverData) return;
    if (await serverdb.findOne({ guildID: config.server, deactivated: { $in: ['changelog'] } })) return;

    const message = channel.messages.fetch(serverData.updateMessage).then(async (msg) => {
        if (msg) {
            await msg.reply({ content: `Hier seht ihr die Änderungen **aus dieser Woche**, <@&${config.changelogRole}>!` })
        }
    })

    serverData.updateMessage = ''
    await serverdb.findOneAndUpdate(
        { guildID: config.server },
        { $set: { support: [], system: [], gift: [], verify: [], minecraft: [] } },
        { new: true }
    );
    await serverData.save()
});

// Bot Start
bot.login(config.token)