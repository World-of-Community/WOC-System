const { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder, Collection, AuditLogEvent, ApplicationCommandType } = require('discord.js')
const path = require('node:path');
const fs = require('fs');
const file = fs.readFileSync('src/json/config.json', 'utf-8');
const config = JSON.parse(file);
const AsciiTable = require('ascii-table');
const client = new Client({
    intents: [
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildVoiceStates, 
    ],
    partials: [
        Partials.Channel,
        Partials.User,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction
    ],
});

// Modules and Files
const mongoose = require('mongoose');
const threaddb = require('../Datenbank/threaddb');
mongoose.connect(config.mongodb).then(console.log('Datenbank ist verbunden'));
const cron = require('node-cron');
const giveawaydb = require('../Datenbank/giveawaydb');
const serverdb = require('../Datenbank/serverdb');
const userdb = require('../Datenbank/userdb');
const { deployCommands } = require('./deployCommands');
let invites = new Map();

// Lade Commands
deployCommands();
client.commands = new Collection();

const readCommands = (dir, table) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            readCommands(fullPath, table);  
        } else if (file.endsWith(".js")) {
            try {
                const command = require(fullPath);
                if (command.data && command.data.name) {
                    client.commands.set(command.data.name, command);
                    table.addRow(command.data.name, '✅');
                } else {
                    table.addRow(file.split('.js')[0], '⛔');
                }
            } catch (error) {
                console.error(`Error loading command ${file}: ${error.message}`);
                table.addRow(file.split('.js')[0], '⛔');
            }
        }
    }
};

//const duplicateCommands = new Set();

//commandFiles.forEach(file => {
//    const command = require(`${commandPath}/${file}`);

    // Überprüfen, ob der Command-Name bereits existiert
//    if (commands.has(command.name)) {
        // Wenn ein doppelter Command gefunden wird, füge ihn der Set-Liste hinzu
//        duplicateCommands.add(command.name);
//    } else {
//        commands.set(command.name, command);
//    }
//});

// Wenn doppelte Commands gefunden wurden, automatisch in der Konsole ausgeben
//if (duplicateCommands.size > 0) {
//    console.log(`Doppelte Commands gefunden: ${[...duplicateCommands].join(', ')}`);
//} else {
//    console.log('Keine doppelten Commands gefunden.');
//}

let table = new AsciiTable()
    .setHeading('Slash Commands', 'Status')
    .setBorder('|', '=', '0', '0');

readCommands(path.resolve(__dirname, 'commands'), table);

console.log(table.toString());
console.log('-----------------------------');

// Load Events
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

const functionFolder = fs.readdirSync(`./src/functions`);
for (const folder of functionFolder) {
  const functionFiles = fs
    .readdirSync(`./src/functions/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of functionFiles)
    require(`./functions/${folder}/${file}`)(client);
}

// Systems
client.vorschlag();

// Handlers
client.handleErfolg(); 
client.manageTeam();

// Bot Ping / Erwähnung
const pingMessages = [
    'Wenn du Hilfe brauchst öffne ein Ticket im Support <:pepeheart:974642478055555082>',
    'Ein Admin hat mir verboten dir zu antworten <a:warnung:1066110628705615914>',
    'Ja? <:Moin:915211924164210738>',
    'Was gibt es? <a:what:1119708325962055720>',
    'Grüße dich! <a:winken:1086560167442796544>',
];

// MongoDB
mongoose.connection.on('connected', () => {
    console.log('Verbunden mit MongoDB!');
});

mongoose.connection.on('error', (err) => {
    console.error(`Verbindungsfehler: ${err.message}`);
});

// Wenn der Bot gepingt wird
client.on('messageCreate', message => {
    if (message.mentions.has(client.user) && !message.author.bot) {
        const randomPingMessage = pingMessages[Math.floor(Math.random() * pingMessages.length)];
        message.channel.send(randomPingMessage).then(sentMessage => {
            setTimeout(() => {
                sentMessage.delete()
                    .catch(err => console.error('Fehler beim Löschen der Nachricht:', err));
            }, 5000); // 5000 Millisekunden = 5 Sekunden
        }).catch(err => console.error('Fehler beim Senden der Nachricht:', err));
    }
});

// Bot schreibt user per DM wenn der bot angeschrieben wird
client.on('messageCreate', async message => {
    if (message.channel.type === ChannelType.DM && !message.author.bot) {
        try {
            // Antwort auf die DM
            await message.channel.send(`Hey ${message.author.displayName}!\nLeider bin ich der falsche Ansprechpartner, falls du Hilfe suchst...<:pepecryhands:1258388912196550707>\nÖffne ein Support Ticket in <#819555839362072606> damit sich unser Support-Team um dein Problem so schnell es geht kümmern kann. <:pepeheart:974642478055555082>`);
        } catch (error) {
            console.error('Fehler beim Senden der Antwort:', error);
        }
    }
});

//==================LOGS=====================

const ThreadIDs = {
    CHANNEL: "1269998213952442525",
    MESSAGE: "1269998217181921320",
    JOIN: "1269998215512457259",
    ROLES: "1269998221518831721",
    SERVER: "1269998220440895510",
    MODERATION: "1269998219266490538",
    INVITE: "1269998218264055818",

    OFFLINE: "",
    ONLINE: "",
    ERROR: ""
};

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== "815919809379172354") return;

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    // Überprüfe, ob alte Einladungen definiert sind
    if (!oldInvites) {
        invites.set(member.guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
        return;
    }

    // Suche die verwendete Einladung
    const invite = newInvites.find(i => oldInvites.has(i.code) && i.uses > oldInvites.get(i.code));

    if (invite) {
        const inviter = invite.inviter;
        const inviteUses = invite.uses;
        const InviteEmbed = new EmbedBuilder()
            .setDescription(`> × Willkommen ${member} bei **${member.guild.name}**!\n\n> × Eingeladen von **${inviter.displayName}**\n\n> × Einladungscode: [${invite.code}](https://discord.gg/${invite.code})\n\n> × Er/Sie hat nun **${inviteUses}** Einladungen\n`)
            .setColor('Blurple')
            .setTimestamp();

            await sendLog(ThreadIDs.INVITE, InviteEmbed)

        invites.set(member.guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
    }
});
const typeMap = {
    0: "TEXT",
    2: "VOICE",
    5: "NEWS",
    13: "STAGE",
    15: "FORUM"
};

client.on('channelCreate', async (channel) => {
    if (channel.type === 4) {
        return;
    }
    channel.guild.fetchAuditLogs({
        type: AuditLogEvent.CHANNEL_CREATE,
        limit: 1
    }).then(async audit => {
        const { executor } = audit.entries.first();

        const CreateEmbed = new EmbedBuilder()
            .setTitle('`➕` | KANAL ERSTELLT')
            .setDescription(`> Name: \`${channel.name}\` (<#${channel.id}>)\n> ID: \`${channel.id}\``)
            .setColor('Green')
            .setTimestamp();

            await sendLog(ThreadIDs.CHANNEL, CreateEmbed)
    })
})

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (newChannel.type === 4) {
        return;
    }
    newChannel.guild.fetchAuditLogs({
        type: AuditLogEvent.CHANNEL_UPDATE,
        limit: 1
    }).then(async audit => {
        const { executor } = audit.entries.first();

        let type = typeMap[newChannel.type] || newChannel.type;

        let description = `\`📂\` » **Informationen:**\n<:text3:1228332174911213638>**Name:** \`${newChannel.name}\` (<#${newChannel.id}>)\n<:text2:1228330539941888011>**Kanaltyp:** \`${type}\`\n`;

        let changesDetected = false;

        if (oldChannel.name !== newChannel.name) {
            description += `\n\`✒️\` » **Namensänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.name}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.name}\``;
            changesDetected = true;
        }
        if (oldChannel.nsfw !== newChannel.nsfw) {
            description += `\n\`🔞\` » **Altersbegrenzung:**\n<:text2:1228330539941888011>${newChannel.nsfw ? "<:on:1228350947898687508>" : "<:off:1228350962205200475>"}`;
            changesDetected = true;
        }
        if (oldChannel.topic !== newChannel.topic) {
            description += `\n\`🏝️\` » **Beschreibungsänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.topic || "❌"}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.topic || "❌"}\``;
            changesDetected = true;
        }
        if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
            description += `\n\`🦥\` » **Slowmode:**\n<:text3:1228332174911213638>**Alt:** ${oldChannel.rateLimitPerUser || "<:off:1228350962205200475>"}\n<:text2:1228330539941888011>**Neu:** ${newChannel.rateLimitPerUser || "<:off:1228350962205200475>"}`;
            changesDetected = true;
        }

        if (!changesDetected) {
            return;
        }

        const EditingEmbed = new EmbedBuilder()
            .setTitle('`🔁` | KANAL BEARBEITET')
            .setAuthor({ name: `${executor.username} » ${executor.id}`, iconURL: executor.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }) })
            .setDescription(description)
            .setColor('Orange')
            .setTimestamp();
            await sendLog(ThreadIDs.CHANNEL, EditingEmbed)
    })
});

client.on('channelDelete', async (channel) => {
    if (channel.type === 4) {
        return;
    }
    const DeleteEmbed = new EmbedBuilder()
        .setTitle('`🗑️` | KANAL GELÖSCHT')
        .setDescription(`> Name: ${channel.name}\nID: \`${channel.id}\``)
        .setColor('Red')
        .setTimestamp();

        await sendLog(ThreadIDs.CHANNEL, DeleteEmbed)
});

// Nachrichten Log
client.on('messageCreate', async (message) => {
    if (!message.author || message.author.bot) return;

    if(message.channelID === "1205936920866328576") return

    const MessageSendEmbed = new EmbedBuilder()
        .setTitle('`📨` | NACHRICHT GESENDET')
        .setDescription(`**${message.author.displayName}** hat eine Nachricht gesendet in ${message.channel}\n\n> Nachricht: ${message.content || '**Kein Inhalt**'}`)
        .setColor('Green')
        .setTimestamp();

        await sendLog(ThreadIDs.MESSAGE, MessageSendEmbed)
});

client.on('messageDelete', async (message) => {
    if (!message.author || message.author.bot) return;

    if(message.channelID === "1205936920866328576") return

    const MessageDeleteEmbed = new EmbedBuilder()
        .setTitle('`🗑️` | NACHRICHT GELÖSCHT')
        .setDescription(`Die Nachricht von **${message.author.displayName}** wurde gelöscht in ${message.channel}\n\n> Inhalt: ${message.content || '**Kein Inhalt**'}`)
        .setColor('Red')
        .setTimestamp();

        await sendLog(ThreadIDs.MESSAGE, MessageDeleteEmbed)
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!newMessage.author || newMessage.author.bot) return;

    if (oldMessage.content === newMessage.content) return;

    const MessageEditEmbed = new EmbedBuilder()
        .setTitle('`🖊️` | NACHRICHT BEARBEITET')
        .setDescription(`Die Nachricht von **${newMessage.author.displayName}** wurde bearbeitet in ${oldMessage.channel}\n\n> Alte Nachricht: ${oldMessage.content || '**Kein Inhalt**'}\n> Neue Nachricht: ${newMessage.content || '**Kein Inhalt**'}`)
        .setColor('Orange')
        .setTimestamp();

        await sendLog(ThreadIDs.MESSAGE, MessageEditEmbed)
});

client.on('ready', async () => {
    const botId = client.user.id; // Bot-ID

        const onlineEmbed = new EmbedBuilder()
            .setTitle('`🟢` | BOT ONLINE')
            .setDescription(`> **${client.user.displayName}** ist jetzt online.`)
            .setColor(colors.info)
            .setTimestamp();

        await sendLog(ThreadIDs.ONLINE, onlineEmbed)
});

client.on('disconnect', async () => {
    const botId = client.user.id; // Bot-ID

        const offlineEmbed = new EmbedBuilder()
            .setTitle('`🔴` | BOT OFFLINE')
            .setDescription(`> **${client.user.displayName}** ist offline.`)
            .setColor(colors.warn)
            .setTimestamp();

        await sendLog(ThreadIDs.OFFLINE, offlineEmbed)
});

client.on('error', async () => {

        const errorEmbed = new EmbedBuilder()
            .setTitle('`❌` | FEHLER BEI BOT')
            .setDescription(`\`\`\`${error.message}\`\`\``)
            .setColor(colors.error)
            .setTimestamp();

        await sendLog(ThreadIDs.ERROR, errorEmbed)
});

// Birthday System
const ageRoles = {
    "-18": "1199786765666500710",
    "18": "1199786814051979344",
};

cron.schedule('0 0 * * *', async () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    const guild = client.guilds.cache.get("815919809379172354");

    try {
        const birthdayUsers = await userdb.find({ "birthday.tag": day, "birthday.monat": month });
        const birthdayRole2 = await guild.roles.fetch("1244945910262399046");
        guild.members.cache.forEach(async member => {
            try {
                    if (member.roles.cache.has(birthdayRole2)) {
                        await member.roles.remove(birthdayRole2);
                    }
            } catch (removeError) {
                console.error(`Fehler beim Entfernen der Rollen von Mitglied ${member.id}:`, removeError);
            }
        });

        if (birthdayUsers.length > 0) {
            const birthdayChannel = client.channels.cache.get("1243964646449483788");
            const birthdayUsersList = [];

            for (const user of birthdayUsers) {
                try {
                    const member = await guild.members.fetch(user.userID);

                    if (user.birthday.jahr) {
                        const age = currentYear - user.birthday.jahr;
                        let roleId;

                        if (age <= 18) roleId = '1199786765666500710';
                        else if (age > 18) roleId = '1199786814051979344';
                        const birthdayRole = await guild.roles.fetch(roleId);

                        if (birthdayRole) {
                            await member.roles.add(birthdayRole);
                        }
                        birthdayUsersList.push(`${member} (**${age}**)`);
                    } else {
                        birthdayUsersList.push(`${member}`);
                    }
                    await member.roles.add(birthdayRole2);
                } catch (fetchError) {
                    console.error(`Fehler beim Verarbeiten des Mitglieds mit ID ${user.userID}:`, fetchError);
                    continue;
                }
            }

            let birthdayMessage = "";

            if (birthdayUsersList.length === 1) {
                birthdayMessage = `${birthdayUsersList[0]} hat **heute Geburtstag!** - <a:bier:1196502621427601498>`;
            } else {
                const lastUser = birthdayUsersList.pop();
                birthdayMessage = `${birthdayUsersList.join(", ")} und ${lastUser} haben **heute Geburtstag!** - <a:bier:1196502621427601498>`;
            }

            const birthdayWords = [
                "Genieße die kleinen Dinge. Sie machen das Leben großartig!",
                "Durch dich wird die Welt ein besserer Ort, bleib wie du bist!",
                "Heute sollst Du dich einfach entspannen und alle deine Sorgen verbannen.",
                "Lass dich drücken, knuddeln und umarmen. Sollen alle deine Ziele, Wünsche und Träume in Erfüllung gehen. Du hast es verdient.",
            ];
            const randomIndex = Math.floor(Math.random() * birthdayWords.length);
            const selectedBirthdayWord = birthdayWords[randomIndex];

            const birthdaymessage = await birthdayChannel.send({
                content: `🎂 𑁉 ${birthdayMessage}\nWünscht dem **${birthdayUsersList.length > 1 ? "Mitgliedern" : "Mitglied"}** alles Gute! <a:2herzen:1196502635465932984>\nTrage auch deinen Geburtstag ein mit \`/birthday set\` (**MIT JAHR** für eine Altersrolle!).\n*${selectedBirthdayWord}*`,
            });

            await birthdaymessage.react("<a:herzen:974633994840854608>");
            await birthdaymessage.react("<a:Cool:915211628755169301>");

        } else {
            const birthdayChannel = client.channels.cache.get("1243964646449483788");
            const message = await birthdayChannel.send({
                content: "<a:crying:1243854160160358470> 𑁉 Heute hat **keiner** Geburtstag... Oder vielleicht doch?\nTrage auch deinen Geburtstag ein mit `/birthday set` (**MIT JAHR** für eine Altersrolle!)\n*damit du zusammen mit **der Community** deinen Geburtstag feiern kannst!*",
            });

            await message.react("<a:herzen:974633994840854608>");
            await message.react("<a:Cool:915211628755169301>");
        }
    } catch (error) {
        console.error("Fehler beim Verarbeiten der Geburtstage:", error);
    }
});

// Werbung
setInterval( async () => {
    try {
    const guild = client.guilds.cache.get("815919809379172354");
    const channel = guild.channels.cache.get("1177536720229650442");

    const werbeEmbed = new EmbedBuilder()
        .setTitle('`🌍` WORLD OF COMMUNITY')
        .setDescription('__Du suchst ein Minecraft-& Discord Server?__\n\n> __Dann bist du bei uns genau richtig!__\n\n**__Wir bieten dir:__**\n\n> `🎭` | » **Server-Rollen** um **dein Server Profil** anzupassen\n> `🔔` | » **Server-Events** in **Discord**\n> `✨` | » **Selbst** Programmierte Bots mit einzigartigen Features!\n> `👥` | » **Freundliche & Hilfsbereite** Community!\n> `🪛` | » Einen Technik Bereich mit **Programmieren** und **Setup Vorstellung**\n> `📄` | » **Täglich neue Nachrichten** sowie **Gaming, Filme** und **Welt News**\n> `🎮` | » Ein **Spielersuche System** wo ihr euren **Spielpartner finden** könnt\n> `📰` | » Du kannst **Freie Werbung** senden.\n\n`🔍` - **__Wir suchen nach:__**\n\n> - Mitglieder die den Server aktiver gestalten\n> - Server Booster & Sponsoren für Gewinnspiele\n> - Neue Ideen/Vorschläge um den Discord-Server zu verbessern\n> - Teammitglieder in folgenden Bereichen: Developer, Supporter, Builder & Creator\n\n<a:MinecraftGrassBlock:872034424181637171> Bald WOC Minecraft Server!\nBetrete noch heute unseren Discord-Server!\n\n> `📌` | **Gib uns eine Chance und Betrete noch heute unseren Discord-Server!**\n\nKleiner Tipp, wenn du deine Freunde mitbringst macht es gleich viel mehr Spaß, da du dann schonmal jemanden kennst!\n\n» Link: https://discord.gg/686M8Cxsaa')
        .setColor('Blurple')
        .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341310989369384/World_Of_Community.png?ex=66b30177&is=66b1aff7&hm=0397fdb8031ef7316a8668df5cad914f61dc6d25fa7ff396bb3107d9463f6bc0&')
        .setFooter({ text: '» World Of Community - Werbung', iconURL: 'https://cdn.discordapp.com/attachments/1269339586568388670/1269341245730459749/WOC_Orange.png?ex=66f4ec68&is=66f39ae8&hm=ab3c1d2943afe003b938fa850ae5e5c643ed69225e1980d73573fef78234ad83&' })

    channel.send({ embeds: [werbeEmbed] })
        // Wenn die Nachricht automatisch veröffentlicht werden soll:
        .then(async msg => {
            msg.crosspost()
        })
    } catch (error) { 
    }
}, 60000 * 360); // 6 Stunden in Millisekunden

// Threads Checker
cron.schedule('0 0 * * *', async () => {
    const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000;
    const threads = await threaddb.find();

    for (const thread of threads) {
        const threadCreatedAt = new Date(thread.createdAt);
        const currentTime = new Date();

        if (currentTime - threadCreatedAt >= sevenDaysInMilliseconds) {
            const threadChannel = await client.channels.cache.get(thread.threadID)

            if (threadChannel) {
                await threadChannel.delete();
                await threaddb.findOneAndDelete({ threadID: thread.threadID });
            }
        }
    }
});

// Changelog Embed
cron.schedule('0 0 * * 1', async () => {
    try {
        const channel = await client.channels.cache.get(config.changelog);
        if (!channel) return;

        let serverData = await serverdb.findOne({ guildID: config.server });
        if (!serverData) {
            serverData = new serverdb({
                guildID: config.server,
                support: [],
                system: [],
                minecraft: [],
                dc: [],
                webseite: []
            });
            await serverData.save();
        } else {
                        
            if (!serverData.support) serverData.support = [];
            if (!serverData.system) serverData.system = [];
            if (!serverData.minecraft) serverData.minecraft = [];
            if (!serverData.webseite) serverData.webseite = [];
            if (!serverData.dc) serverData.dc = [];
            await serverData.save();
        }

        if (await serverdb.findOne({ guildID: config.server, deactivated: { $in: ['changelog'] } })) {
            return channel.send({ content: '> `⛔` » Das Changelog System ist momentan deaktiviert.' });
        }

        // Week Date
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 6);

        const todayDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}`;
        const nextWeekDate = `${nextWeek.getDate().toString().padStart(2, '0')}.${(nextWeek.getMonth() + 1).toString().padStart(2, '0')}`;

        const changelogEmbed = new EmbedBuilder()
            .setTitle(`<a:Neuigkeiten:1018910061348798564> » UPDATE-WOCHENRÜCKBLICK [${todayDate} - ${nextWeekDate}]`)
            .setDescription('<:PointRed:1123612255800524940> = Bug behoben\n<:PointOrange:1123612277669630092> = Änderung\n<:PointGreen:1123612318694117477> = Neu hinzugefügt\n\n<:Pfeil:1119709908540076124> Diese Nachricht wird mit jeder **neuen Änderung** welche in dieser Woche passiert ist, bearbeitet. Der Ping zu allen Änderungen erfolgt **am Ende jeder Woche.**\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n> In dieser Woche gab es keine Änderung.\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀\n⠀ ⠀ ⠀⠀ ⠀⠀ ⠀⠀')
            .setColor('#ff7b00')
            .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340524490260571/WOC_Banner_Update_Wochenruckblick.png')
            .setFooter({ text: `» Wir wünschen euch viel Spaß mit dem neuen Update! - ${todayDate}.${today.getFullYear()}`, iconURL: 'https://cdn.discordapp.com/attachments/943859953318371359/1055943224092532846/WOC_Orange.png' });

        // Arrays initialisieren (falls nicht vorhanden) und Daten anzeigen
        const support = serverData.support || [];
        const system = serverData.system || [];
        const minecraft = serverData.minecraft || [];
        const webseite = serverData.webseite || [];
        const discord = serverData.dc || [];

        // Add fields based on serverData
        if (support.length > 0) {
            changelogEmbed.addFields({
                name: '> <:Moderator:873823260507262996> - **WOC`👮`SUPPORT (BOT)** - UPDATE',
                value: `${support.join('\n')}`
            });
        }

        if (system.length > 0) {
            changelogEmbed.addFields({
                name: '> <a:System:915211580805881876> - **WOC`⚙️`SYSTEM (BOT)** - UPDATE',
                value: `${system.join('\n')}`
            });
        }

        if (minecraft.length > 0) {
            changelogEmbed.addFields({
                name: '> <a:MinecraftGrassBlock:872034424181637171> - **MINECRAFT SERVER** - UPDATE',
                value: `${minecraft.join('\n')}`
            });
        }

        if (discord.length > 0) {
            changelogEmbed.addFields({
                name: '> <:Discord:912007935616516098> - **DISCORD SERVER** - UPDATE',
                value: `${discord.join('\n')}`
            });
        }


        if (webseite.length > 0) {
            changelogEmbed.addFields({
                name: '> <a:wocbook:1178664700469317692> - **WEBSEITE** - UPDATE',
                value: `${webseite.join('\n')}`
            });
        }

        await channel.send({ content: 'Eine neue Woche, ein neues Glück <a:discordbloblove:855482395325890570>', embeds: [changelogEmbed] }).then(async (msg) => {
            serverData.updateMessage = msg.id;
            serverData.updateWeek = `${todayDate} - ${nextWeekDate}`;
            await serverData.save();
        });

    } catch (error) {
        console.log("Fehler im Cron job:", error);
    }
});


// 18 Uhr Message
cron.schedule('0 18 * * 0', async () => {
    const channel = client.channels.cache.get(config.changelog);
    const serverData = await serverdb.findOne({ guildID: config.server })

    if (!serverData) return;
    if (await serverdb.findOne({ guildID: config.server, deactivated: { $in: ['changelog'] } })) return;

    const message = channel.messages.fetch(serverData.updateMessage).then(async (msg) => {
        if (msg) {
            await msg.reply({ content: `Hier seht ihr die Änderungen **aus dieser Woche**, <@&${config.changelogRole}>!` })
        }
    })

    serverData.updateMessage = ''
    serverData.support = [];
    serverData.system = [];
    serverData.minecraft = [];
    serverData.dc = [];
    serverData.webseite = [];

    await serverData.save();

});

//====================[Giveaway]====================

setInterval(async () => {
    const currentTime = new Date();
    const activeGiveaways = await giveawaydb.find({ endTime: null });
    if (!activeGiveaways) return;

    for (const giveaway of activeGiveaways) {
        const startTime = new Date(giveaway.startTime);
        if (startTime.getTime() + giveaway.duration <= currentTime.getTime()) {
            if (giveaway.endTime) continue;
            giveaway.endTime = new Date();
            await giveaway.save();

            if (giveaway.teilnehmer.length < giveaway.gewinnerAnzahl) {
                const channel = await client.channels.fetch(giveaway.channelID);
                const giveawayMessage = await channel.messages.fetch(giveaway.msgID);
                await giveawayMessage.reply({ content: `\`⛔\` » **Zu wenig Teilnehmer:** Es fehlen \`${giveaway.gewinnerAnzahl - giveaway.teilnehmer.length}👥\` Teilnehmer um genug Gewinner auszulosen!`, ephemeral: true });
                continue;
            }

            const winnerIds = [];
            while (winnerIds.length < giveaway.gewinnerAnzahl) {
                const winnerIndex = Math.floor(Math.random() * giveaway.teilnehmer.length);
                const winnerId = giveaway.teilnehmer[winnerIndex];
                if (!winnerIds.includes(winnerId)) {
                    winnerIds.push(winnerId);
                }
            }

            console.log(winnerIds);

            const channel = await client.channels.fetch(giveaway.channelID);
            const giveawayMessage = await channel.messages.fetch(giveaway.msgID);
            if (!giveawayMessage) continue;

            const priceInput = await giveaway.price;
            const emoji = determineEmoji(priceInput);
            const winnersMentions = winnerIds.map(id => `<@${id}>`).join(", ");

            await giveawayMessage.reply({ content: `<a:bier:1196502621427601498> **Herzlichen Glückwunsch**, ${winnersMentions} ${winnerIds.length === 1 ? "hat" : "haben"} ${emoji} **${priceInput}** ${emoji} gewonnen! <a:2herzen:1196502635465932984>` });

            for (const winnerId of winnerIds) {
                const userData = await userdb.findOne({ userID: winnerId });
                if (userData) {
                    userData.giveaway.eventWins += 1;
                    await userData.save();
                }

                const winner = await client.users.fetch(winnerId);
                if (winner) {
                    const embed = new EmbedBuilder()
                        .setTitle('<a:Cool:915211628755169301> » GEWINNSPIEL GEWONNEN! <a:Cool:915211628755169301>')
                        .setDescription(`» Du hast bei dem Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** gewonnen!\n» Ein Teammitglied wird sich **demnächst** bei dir melden.`)
                        .setColor('Blurple');
                    await winner.send({ content: `Du hast bei einem Gewinnspiel **GEWONNEN!!!**`, embeds: [embed] }).catch(error => console.log('Nachricht konnte nicht an den Gewinner gesendet werden.'));
                }
            }

            const embed = giveawayMessage.embeds[0];
            const giveawayEndEmbed = new EmbedBuilder()
                .setTitle(`${embed.title}`)
                .setDescription(`<a:Neuigkeiten:1018910061348798564> » **__Gewinnspiel - Gewinner__**\n<:PfeilBlau:1147248395837247613> Teilnehmer: **${giveaway.teilnehmer.length}**\n<:PfeilBlau:1147248395837247613> Gewinner: ${winnerIds.length > 0 ? winnersMentions : "**`Zu wenig Teilnehmer`**"}\n<:PfeilBlau:1147248395837247613> Erstellt von <@${giveaway.creator}>`)
                .setColor('Red')
                .setThumbnail('https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif?ex=66b647bd&is=66b4f63d&hm=53e18bea4e53fcfa6bef3450c65670ac3d7d1d57e3dd66a18e23d9660dfdfc6d&')
                .setFooter({ text: `${client.user.displayName} - Bot`, iconURL: `${client.user.displayAvatarURL()}` })
                .setTimestamp();
            await giveawayMessage.edit({ content: '⛔ **GEWINNSPIEL VORBEI!** ⛔', embeds: [giveawayEndEmbed], components: [] });

            const creator = client.users.cache.get(giveaway.creator);
            if (creator) {
                const creatorEmbed = new EmbedBuilder()
                    .setTitle('<a:Information:1007267420316106903> » GEWINNSPIEL VORBEI!')
                    .setDescription(`\`✅\` » Das Gewinnspiel auf **[World Of Community](https://discord.gg/dHzbdsqST8)** ist vorbei!\n\`📌\` » Da du das Event gestartet hast, habe ich **dich informiert.**\n\n\`💸\` » **Zahle das Gewinnspiel** selbst aus, oder kümmere dich\n\`💸\` » darum, dass es die zuständige Person erledigt.`)
                    .setColor('Orange');
                await creator.send({ embeds: [creatorEmbed] }).catch(error => console.log('Nachricht konnte nicht an den Giveaway Ersteller gesendet werden.'));
            }
        }
    }
}, 30000);

function determineEmoji(priceInput) {
    if (priceInput.toLowerCase().includes("nitro") && !priceInput.toLowerCase().includes("basic")) {
        return "<a:nitro:1186636151335944283>";
    } else if (priceInput.toLowerCase().includes("nitro") && priceInput.toLowerCase().includes("basic")) {
        return "<a:basic:1186636165567229972>";
    } else if (priceInput.toLowerCase().includes("guthaben")) {
        return "<a:guthaben:1186636139281530970>";
    } else {
        return "<a:Diamond:1018911546430210128>";
    }
}

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.guild.id !== config.server) return; 

    let serverData = await serverdb.findOne({ guildID: message.guildId });
    if (!serverData) {
        serverData = new serverdb({
            guildID: message.guildId,
            roleBypass: []
        });
        await serverData.save();
    }

    let userData = await userdb.findOne({ userID: message.author.id });
    if (!userData) {
        userData = new userdb({
            userID: message.author.id,
            giveaway: {
                eventWins: 0,
                toggledm: true,
                messages: 1,
                voiceTime: 0,
                startTime: 0,
            },
            stats: {
                messages: 1,
                voiceTime: 0
            }
        });
        await userData.save();
    } else {
        userData.giveaway.messages += 1;
        userData.stats.messages += 1;
        await userData.save();
    }
});

client.on('voiceStateUpdate', async (oldState, newState) => {
    if (oldState.member.user.bot || newState.member.user.bot) return;

    const userId = newState.member.user.id;
    const currentTime = new Date().getTime();

    if (!oldState.channelId && newState.channelId) {

        let userData = await userdb.findOne({ userID: userId });
        if (userData) {
            userData.giveaway.startTime = currentTime;
            await userData.save();
        } else {
            console.error(`Für die Benutzer-ID wurde keine Benutzerdaten gefunden: ${userId}`);
        }
    } 
    else if (oldState.channelId && !newState.channelId) {

        console.log('Benutzer hat einen Sprachkanal verlassen.');

        let userData = await userdb.findOne({ userID: userId });
        if (userData) {
            const startTime = userData.giveaway.startTime;

            if (startTime !== 0) {
                const durationInMilliseconds = currentTime - startTime;
                if (!isNaN(durationInMilliseconds)) {
                    userData.giveaway.voiceTime += durationInMilliseconds;
                    userData.stats.voiceTime += durationInMilliseconds;
                    userData.giveaway.startTime = 0;
                    await userData.save();
                } else {
                    console.error('Ungültige durationInMilliseconds:', durationInMilliseconds);
                }
            } else {
                console.error('Die Startzeit war Null oder nicht eingestellt.');
            }
        } else {
            console.error('Für die Benutzer-ID wurde keine Benutzerdaten gefunden:', userId);
        }
    }
});

client.on('error', (error) => {
    const errorMessage = error.stack || error;
    console.log(errorMessage)
});

process.on('unhandledRejection', error => {
    console.log(error)
});

async function sendLog(threadID, embed) {
    const serverCatch = client.guilds.cache.get("815919809379172354")
    const logchannel = await serverCatch.channels.cache.get("1263436406655680513");

    await logchannel.threads.cache.get(threadID).send({embeds: [embed]});
}

module.exports = { client }

// Bot Start
client.login(config.token)

/*
    const channel = client.channel.cache.get("1295742887388254278")
    channel.threads.create({
        name: '📌 » Online & Offline Logs', message: { content: `» In diesen Log Kanal werden alle \`Online & Offline Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    channel.threads.create({
        name: '⚠️ » Error Logs', message: { content: `» In diesen Log Kanal werden alle \`Error Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

/*
    const channel = client.channels.cache.get("1263436406655680513")
    channel.threads.create({
      name: '📁 » Kanal Logs', message: { content: `» In diesen Log Kanal werden alle \`Kanal Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    channel.threads.create({
      name: '👤 » Join & Leave Logs', message: { content: `» In diesen Log Kanal werden alle \`Join & Leave Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    channel.threads.create({
      name: '💬 » Nachrichten Logs', message: { content: `» In diesen Log Kanal werden alle \`Nachrichten Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    channel.threads.create({
      name: '📩 » Invite Log', message: {  content: `» In diesen Log Kanal werden alle \`Invites Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    channel.threads.create({
      name: '📚 » Moderation Logs', message: {  content: `» In diesen Log Kanal werden alle \`Moderation Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    channel.threads.create({
      name: '🔨 » Server Logs', message: {  content: `» In diesen Log Kanal werden alle \`Server Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);

    channel.threads.create({
      name: '🎭 » Rollen Logs', message: {  content: `» In diesen Log Kanal werden alle \`Rollen Logs\` gepostet` }, reason: 'System' })
    .then(threadChannel => console.log(threadChannel))
    .catch(console.error);
*/