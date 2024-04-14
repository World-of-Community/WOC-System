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

// Lade Commands
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

// Load Events
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
        .setDescription('<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n> In dieser Woche gab es keine Änderung.\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀')
        .setColor('#ff7b00')
        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1186716971883049102/WOC_Banner_Update_Wochenruckblick.jpg?ex=659d7dce&is=658b08ce&hm=d739e6be0bf20a0253d90f9f0a23b65ae5c70a5ce65904dab0e9400483f3f710&')
        .setFooter({ text: `Wir wünschen euch viel Spaß mit dem neuen Update! - ${todayDate}.${today.getFullYear()}`, iconURL: 'https://cdn.discordapp.com/attachments/943859953318371359/1055943224092532846/WOC_Orange.png' })

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
                name: '> <a:yes_tick:1042831133303386122> - **SERVICE (BOT)** - UPDATE',
                value: `${serverData.service.join('\n')}`
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