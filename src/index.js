const { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder, Collection, AuditLogEvent } = require('discord.js')
const path = require('node:path');
const fs = require('fs');
const file = fs.readFileSync('src/json/config.json', 'utf-8');
const config = JSON.parse(file);
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
    ],
    partials: [
        Partials.Channel,
        Partials.User,
        Partials.GuildMember,
        Partials.Message
    ],
});

// Modules and Files
const mongoose = require('mongoose');
const threaddb = require('../Datenbank/threaddb');
mongoose.connect(config.mongodb).then(console.log('Datenbank ist verbunden'));
const cron = require('node-cron');
const serverdb = require('../Datenbank/serverdb');
const userdb = require('../Datenbank/userdb');
const { deployCommands } = require('./deployCommands');
let invites = new Map();

// Lade Commands
deployCommands()
client.commands = new Collection()

const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"))
console.log('-------------------------------------------')
console.log('|   Command                  |   Loaded   |')
console.log('-------------------------------------------')
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (command.data) {
        client.commands.set(command.data.name, command);
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
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Vorschlag
client.on("threadCreate", async (thread) => {
    if (thread.ownerId === "1020023299448786955") return;

    const guild = client.guilds.cache.get("815919809379172354");

    const channel = await guild.channels.cache.get("1254340245772701747");
    if (channel && channel.id === thread.parentId) {
        const ownerid = thread.ownerId
        const member = await guild.members.fetch(ownerid);
        const message = await thread.fetchStarterMessage();

        const tags = thread.appliedTags;
        const thread2 = await channel.threads.create({ name: thread.name, message: { content: `\`⚙️\` - Bitte warten, Ich erfasse die Daten.` }, appliedTags: tags });

        const embed = new EmbedBuilder()
            .setColor("Orange")
            .setTitle(`\`🔎\` **- ${thread.name}**`)
            .setDescription(`⠀\n> ${message}\n⠀\n**─────────────────────────**`)
            .addFields([
                {
                    name: `\`💡\` **- Vorschläge**`,
                    value: `> Erstelle einen Post um deine eigenen Vorschlag einzureichen`,
                },
            ])
            .setFooter({
                text:
                    "Eingereicht von " +
                    member.user.username +
                    " » " +
                    member.id
            });

        const message2 = await thread2.fetchStarterMessage();
        await message2.react("1008781495055429672");
        await message2.react("1008781575644782622");
        await message2.edit({ content: `\`👋\` » ${member}, Ich habe dein Vorschlag eingereicht.`, embeds: [embed] })
        await thread.delete()
    }
});

// Bot Ping / Erwähnung
const pingMessages = [
    'Wenn du Hilfe brauchst öffne ein Ticket im Support <:pepeheart:974642478055555082>',
    'Ein Admin hat mir verboten dir zu antworten <a:warnung:1066110628705615914>',
    'Ja? <:Moin:915211924164210738>',
    'Was gibt es? <a:what:1119708325962055720>',
    'Grüße dich! <a:winken:1086560167442796544>',
];

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
    // Überprüfen, ob die Nachricht in einer DM gesendet wurde
    if (message.channel.type === ChannelType.DM && !message.author.bot) {
        try {
            // Antwort auf die DM
            await message.channel.send(`Hey ${message.author.displayName}!\nLeider bin ich der falsche Ansprechpartner, falls du Hilfe suchst...<:pepecryhands:1258388912196550707>\nÖffne ein Support Ticket in <#819555839362072606> damit sich unser Support-Team um dein Problem so schnell es geht kümmern kann. <:pepeheart:974642478055555082>`);
        } catch (error) {
            console.error('Fehler beim Senden der Antwort:', error);
        }
    }
});

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== "815919809379172354") return;

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    // Check if oldInvites is defined
    if (!oldInvites) {
        invites.set(member.guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
        return;
    }

    // Find the invite that was used
    const invite = newInvites.find(i => oldInvites.has(i.code) && i.uses > oldInvites.get(i.code));

    if (invite) {
        const inviter = invite.inviter;
        const inviteUses = invite.uses;
        const InviteEmbed = new EmbedBuilder()
            .setDescription(`> × Willkommen ${member} bei **${member.guild.name}**!\n\n> × Eingeladen von **${inviter.displayName}**\n\n> × Einladungscode: [${invite.code}](https://discord.gg/${invite.code})\n\n> × Er/Sie hat nun **${inviteUses}** Einladungen\n`)
            .setColor('Blurple')
            .setTimestamp();

        const channel = member.guild.channels.cache.get("1240246786128613396");
        if (channel) {
            channel.send({ embeds: [InviteEmbed] });
        }

        // Update the invite map
        invites.set(member.guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
    }
});

// Kanal Log
const LOG_CHANNEL_ID = "1242799344692887662";
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

        const logChannel = await channel.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) await logChannel.send({ embeds: [CreateEmbed] });
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

        if (oldChannel.name !== newChannel.name) {
            description += `\n\`✒️\` » **Namensänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.name}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.name}\``;
        }
        if (oldChannel.nsfw !== newChannel.nsfw) {
            description += `\n\`🔞\` » **Altersbegrenzung:**\n<:text2:1228330539941888011>${newChannel.nsfw ? "<:on:1228350947898687508>" : "<:off:1228350962205200475>"}`;
        }
        if (oldChannel.topic !== newChannel.topic) {
            description += `\n\`🏝️\` » **Beschreibungsänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.topic || "❌"}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.topic || "❌"}\``;
        }
        if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
            description += `\n\`🦥\` » **Slowmode:**\n<:text3:1228332174911213638>**Alt:** ${oldChannel.rateLimitPerUser || "<:off:1228350962205200475>"}\n<:text2:1228330539941888011>**Neu:** ${newChannel.rateLimitPerUser || "<:off:1228350962205200475>"}`;
        }

        const EditingEmbed = new EmbedBuilder()
            .setTitle('`🔁` | KANAL BEARBEITET')
            .setAuthor({ name: `${executor.username} » ${executor.id}`, iconURL: executor.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }) })
            .setDescription(description)
            .setColor('Orange')
            .setTimestamp();

        const logChannel = await newChannel.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) await logChannel.send({ embeds: [EditingEmbed] });
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

    const logChannel = await channel.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [DeleteEmbed] });
});

// Nachrichten Log
client.on('messageCreate', async (message) => {
    if (!message.author || message.author.bot) return;

    const MessageSendEmbed = new EmbedBuilder()
        .setTitle('`📨` | NACHRICHT GESENDET')
        .setDescription(`**${message.author.displayName}** hat eine Nachricht gesendet in **${message.channel}**\n\n> Nachricht: \`${message.content || 'Kein Inhalt'}\``)
        .setColor('Green')
        .setTimestamp();

    const logChannel = await client.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [MessageSendEmbed] });
});

client.on('messageDelete', async (message) => {
    if (!message.author || message.author.bot) return;

    const MessageDeleteEmbed = new EmbedBuilder()
        .setTitle('`🗑️` | NACHRICHT GELÖSCHT')
        .setDescription(`Die Nachricht von **${message.author.displayName}** wurde gelöscht in **${message.channel}**\n\n> Inhalt: \`${message.content || 'Kein Inhalt'}\``)
        .setColor('Red')
        .setTimestamp();

    const logChannel = await client.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [MessageDeleteEmbed] });
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!newMessage.author || newMessage.author.bot) return;

    const MessageEditEmbed = new EmbedBuilder()
        .setTitle('`🖊️` | NACHRICHT BEARBEITET')
        .setDescription(`Die Nachricht von **${newMessage.author.displayName}** wurde bearbeitet in **${oldMessage.channel}**\n\n> Alte Nachricht: \`${oldMessage.content || 'Kein Inhalt'}\`\n> Neue Nachricht: \`${newMessage.content || 'Kein Inhalt'}\``)
        .setColor('Orange')
        .setTimestamp();

    const logChannel = await client.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [MessageEditEmbed] });
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
    const roleId = '1244945910262399046';
    const guild = client.guilds.cache.get("815919809379172354");

    try {
        const birthdayUsers = await userdb.find({ "birthday.tag": day, "birthday.monat": month });

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
                    await member.roles.add(roleId);
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
setInterval(() => {
    const guild = client.guilds.cache.get("815919809379172354");
    const channel = guild.channels.cache.get("1177536720229650442");

    const bannerEmbed = new EmbedBuilder()
        .setColor('Blurple')
        .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1143165949864849419/World_Of_Community.png?ex=662f9841&is=661d2341&hm=94cca3673a9731afbc0210dc4525df02ae7ffc006f41bd7aee57b8f50b9b470b&')

    const werbeEmbed = new EmbedBuilder()
        .setTitle('`🌍` WORLD OF COMMUNITY - GAMING, COMMUNITY & CHILL')
        .setDescription('Du suchst ein Discord Server mit Gaming, Community & Chill?\n\n> Dann bist du bei uns genau richtig!\n\n**__Wir bieten dir:__**\n\n> `🎭` | » **Server-Rollen** um **dein Server Profil** anzupassen\n> `🔔` | » **Server-Events** in **Discord**\n> `✨` | » **Selbst** Programmierte Bots mit einzigartigen Features!\n> `👥` | » **Freundliche & Hilfsbereite** Community!\n> `🪛` | » Einen Technik Bereich mit **Programmieren** und **Setup Vorstellung**\n> `📄` | » **Täglich neue Nachrichten** sowie **Gaming (Gratis Spiele), Filme und Welt News**\n> `🎮` | » Ein **Spielersuche System** wo ihr euren **Spielpartner finden** könnt\n> `📰` | » **Freie Werbung** senden können & Server-Partnerschaften möglich\n\n> `📌` | **Gib uns eine Chance und Betrete noch heute unseren Discord-Server!**\n\nKleiner Tipp, wenn du deine Freunde mitbringst macht es gleich viel mehr Spaß, da du dann schonmal jemanden kennst!\n\n» Link: https://discord.gg/686M8Cxsaa')
        .setColor('Blurple')
        .setFooter({ text: 'World Of Community - Werbung', iconURL: 'https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=6624db23&is=662389a3&hm=5bccd1823f8042757910fb78c8cca1cb6ff34a2095e77c9b9aa22b31e9cd4046&' })

    channel.send({ embeds: [bannerEmbed, werbeEmbed] })
        // Wenn die Nachricht automatisch veröffentlicht werden soll:
        .then(async msg => {
            msg.crosspost()
        })
}, 60000 * 240); // 4 Stunden in Millisekunden

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
    const channel = client.channels.cache.get(config.changelog);
    const serverData = await serverdb.findOne({ guildID: config.server })

    if (!serverData) return;
    if (await serverdb.findOne({ guildID: config.server, deactivated: { $in: ['changelog'] } })) return channel.send({ content: '> `⛔` » Das Changelog System ist momentan deaktiviert.' })

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
    await serverdb.findOneAndUpdate(
        { guildID: config.server },
        { $set: { support: [], system: [], gift: [], verify: [], minecraft: [] } },
        { new: true }
    );
    await serverData.save()
});

client.on('error', (error) => {
    const errorMessage = error.stack || error;
    console.log(errorMessage)
});

process.on('unhandledRejection', error => {
    console.log(error)
});

// Bot Start
client.login(config.token)