const { Client, GatewayIntentBits, Partials, ChannelType, EmbedBuilder, Collection, AuditLogEvent } = require('discord.js')
const path = require('node:path');
const fs = require('fs');
const file = fs.readFileSync('src/json/config.json', 'utf-8');
const config = JSON.parse(file);
const client = new Client({
    intents: [
        GatewayIntentBits.GuildIntegrations, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences, GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [
        Partials.Channel, Partials.User, Partials.GuildMember, Partials.Message
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

client.on('inviteCreate', async (invite) => {
    const inviter = invite.inviter;

    invites.get(invite.guild.id).set(invite.code, invite.uses);

    const embed = new EmbedBuilder()
        .setTitle('Einladung erstellt')
        .setDescription(`${inviter.username} hat eine neue Einladung erstellt. Code: ${invite.code}, Max. Verwendungen: ${invite.maxUses || 'Unbegrenzt'}`)
        .setColor('#0099ff')
        .setTimestamp();

    const channel = await client.channels.fetch("1240246786128613396");
    channel.send({ embeds: [embed] });
});
client.on('inviteDelete', async (invite) => {
    const inviter = invite.inviter;

    invites.get(invite.guild.id).delete(invite.code);

    const embed = new EmbedBuilder()
        .setTitle('Einladung gelöscht')
        .setDescription(`${inviter.username} hat eine Einladung gelöscht. Code: ${invite.code}.`)
        .setColor('#0099ff')
        .setTimestamp();

    const channel = await client.channels.fetch("1240246786128613396");
    channel.send({ embeds: [embed] });
});

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== "815919809379172354") return; //

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    const invite = newInvites.find(i => i.uses > oldInvites.get(i.code));
    if (invite) {
        const inviter = invite.inviter;
        const inviteUses = invite.uses;
        const InviteEmbed = new EmbedBuilder()
        .setDescription(`> × Willkommen ${member} bei **${member.guild.name}**!\n\n> × Eingeladen von **${inviter.displayName}**\n\n> ×Einladungs Code: [${invite.code}](https://discord.gg/${invite.code})\n\n> × Er/Sie hat nun ${inviteUses} Einladungen\n`)
        .setColor('Blurple')
        .setTimestamp();

        const channel = member.guild.channels.cache.get("1240246786128613396");
        if (channel) {
            channel.send({ embeds: [InviteEmbed] });
        }

        // Update the invite map
        invites.set(member.guild.id, new Map(newInvites.map((invite) => [invite.code, invite.uses])));
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
client.on('channelCreate', async(channel) => {
    if(channel.type === 4) {
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

client.on('channelUpdate', async(oldChannel, newChannel) => {
    if(newChannel.type === 4) {
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
        .setAuthor({ name: `${executor.username} » ${executor.id}`, iconURL: executor.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 })})
        .setDescription(description)
        .setColor('Orange')
        .setTimestamp();

    const logChannel = await newChannel.guild.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [EditingEmbed] });
    })
});

client.on('channelDelete', async(channel) => {
    if(channel.type === 4) {
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

client.on('messageCreate', async(message) => {
    if (!message.author || message.author.bot) return;

    const MessageSendEmbed = new EmbedBuilder()
        .setTitle('`📨` | NACHRICHT GESENDET')
        .setDescription(`**\`${message.author.displayName}\`** hat eine Nachricht gesendet in **${message.channel}**\n\n> Nachricht: \`${message.content || 'Kein Inhalt'}\``)
        .setColor('Green')
        .setTimestamp();

    const logChannel = await client.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [MessageSendEmbed] });
});

client.on('messageDelete', async(message) => {
    if (!message.author || message.author.bot) return;

    const MessageDeleteEmbed = new EmbedBuilder()
        .setTitle('`🗑️` | NACHRICHT GELÖSCHT')
        .setDescription(`Die Nachricht von **${message.author.displayName}** wurde gelöscht in **${message.channel}**\n\n> Inhalt: \`${message.content || 'Kein Inhalt'}\``)
        .setColor('Red')
        .setTimestamp();

    const logChannel = await client.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [MessageDeleteEmbed] });
});

client.on('messageUpdate', async(oldMessage, newMessage) => {
    if (!newMessage.author || newMessage.author.bot) return;

    const MessageEditEmbed = new EmbedBuilder()
        .setTitle('`🖊️` | NACHRICHT BEARBEITET')
        .setDescription(`Die Nachricht von **${oldMessage.member.user.globalName}** wurde bearbeitet in **${oldMessage.channel}**\n\n> Alte Nachricht: \`${oldMessage.content || 'Kein Inhalt'}\`\n> Neue Nachricht: \`${newMessage.content || 'Kein Inhalt'}\``)
        .setColor('Orange')
        .setTimestamp();

    const logChannel = await client.channels.cache.get(LOG_CHANNEL_ID);
    if (logChannel) await logChannel.send({ embeds: [MessageEditEmbed] });
});

// Geburtstagssystem noch nicht verfügbar in Wartung

// Beispielhafte Altersrollen
const ageRoles = {
    'Jünger als 18': '1199786765666500710',
    'Älter als 18': '1199786814051979344',
    // Füge hier weitere Altersrollen hinzu
};

cron.schedule('0 0 * * *', async () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const currentYear = today.getFullYear();

    const birthdayChannel = client.channels.cache.get('1243964646449483788');

    const birthdays = JSON.parse(fs.readFileSync('./birthdays.json', 'utf8'));

    for (const [userId, { tag, monat, jahr }] of Object.entries(birthdays)) {
        if (tag === day && monat === month) {
            try {
                const guild = client.guilds.cache.get('815919809379172354');
                const member = await guild.members.fetch(userId);

                const age = currentYear - jahr;
                const roleId = ageRoles[age.toString()];

                if (roleId) {
                    const role = guild.roles.cache.get(roleId);
                    await member.roles.add(role);

                const randomword = [
                    'Genieße die kleinen Dinge. Sie machen das Leben großartig!',
                    'Durch dich wird die Welt ein besserer Ort, bleib wie du bist!',
                    'Heute sollst Du Dich einfach entspannen und alle Deine Sorgen verbannen.',
                    'Lass dich drücken, knuddeln und umarmen. Sollen alle deine Ziele, Wünsche und Träume in Erfüllung gehen. Du hast es verdient.'
                ]
                const birthdayword = huggifs[Math.floor(Math.random() * randomword.length)]

                    const birthdayEmbed = new EmbedBuilder()
                        .setDescription(`🎂 𑁉 ${member.displayName}! hat **heute Geburtstag**\nWünscht dem **Mitglied** alles gute!\nTrage auch deinen Geburtstag ein mit \`/birthday set\` (**MIT JAHR** für eine Altersrolle!).\n*${birthdayword}*`)
                        .setColor('Blurple')

                    await member.send({ content: `${member.displayName}`, embeds: [birthdayEmbed] });

                    birthdayChannel.send({ embeds: [birthdayEmbed] });

                }
            } catch (error) {
                console.error(`Fehler beim Zuweisen der Rolle für ${userId}:`, error);
            }
        }
    }

    if (!birthdayFound) {
        const noBirthdayEmbed = new EmbedBuilder()
            .setDescription('<a:crying:1243854160160358470> 𑁉 Heute hat **keiner** Geburtstag... Oder vielleicht doch?\nTrage auch deinen Geburtstag ein mit `/birthday set` (**MIT JAHR** für eine Altersrolle!)\n*damit du zusammen mit **der Community** deinen Geburtstag feiern kannst!*')
            .setColor('Red')

        notificationChannel.send({ embeds: [noBirthdayEmbed] });
    } else if (birthdayUsers.length === 2) {
        const user1 = await guild.members.fetch(birthdayUsers[0].userId);
        const user2 = await guild.members.fetch(birthdayUsers[1].userId);
        const age1 = currentYear - birthdayUsers[0].jahr;
        const age2 = currentYear - birthdayUsers[1].jahr;

        const roleId1 = ageRoles[age1.toString()];
        const roleId2 = ageRoles[age2.toString()];

        if (roleId1) {
            const role1 = guild.roles.cache.get(roleId1);
            await user1.roles.add(role1);
        }

        if (roleId2) {
            const role2 = guild.roles.cache.get(roleId2);
            await user2.roles.add(role2);
        }

        const twobirthdayEmbed = new EmbedBuilder()
            .setDescription(`🎂 𑁉 ${user1.displayName} und ${user2.displayName}! haben **heute Geburtstag**\nWünscht dem **Mitglied** alles gute!\nTrage auch deinen Geburtstag ein mit \`/birthday set\` (**MIT JAHR** für eine Altersrolle!).\n*${birthdayword}*`)
            .setColor('Blurple')

        await user1 && user2.send({ content: `${user1.displayName} und ${user2.displayName}!`, embeds: [twobirthdayEmbed] });

        birthdayChannel.send({ embeds: [twobirthdayEmbed] });
    }
})


// Werbung
setInterval(() => {
    const guild = bot.guilds.cache.get("815919809379172354");
    const channel = guild.channels.cache.get("1177536720229650442");
  
    const bannerEmbed = new EmbedBuilder()
         .setColor('Blurple')
         .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1143165949864849419/World_Of_Community.png?ex=662f9841&is=661d2341&hm=94cca3673a9731afbc0210dc4525df02ae7ffc006f41bd7aee57b8f50b9b470b&')
    
    const werbeEmbed = new EmbedBuilder()
         .setTitle('`🌍` WORLD OF COMMUNITY - GAMING, COMMUNITY & CHILL')
         .setDescription('Du suchst ein Discord Server mit Gaming, Community & Chill?\n\n> Dann bist du bei uns genau richtig!\n\n**__Wir bieten dir:__**\n\n> `🎭` | » **Server-Rollen** um **dein Server Profil** anzupassen\n> `🔔` | » **Server-Events** in **Discord**\n> `🤖` | » **Selbst** Programmierte Bots mit einzigartigen Features!\n> `👥` | » **Freundliche & Hilfsbereite** Community!\n> `🎮` | » Ein **Spielersuche System** wo ihr euren **Spielpartner finden** könnt\n> `📰` | » **Freie Werbung** senden können & Server-Partnerschaften möglich\n\n> `📌` | **Gib uns eine Chance und Betrete noch heute unseren Discord-Server!**\n\nKleiner Tipp, wenn du deine Freunde mitbringst macht es gleich viel mehr Spaß, da du dann schonmal jemanden kennst!\n\n» Link: https://discord.gg/686M8Cxsaa')
         .setColor('Blurple')
         .setFooter({ text: 'World Of Community - Werbung', iconURL: 'https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=6624db23&is=662389a3&hm=5bccd1823f8042757910fb78c8cca1cb6ff34a2095e77c9b9aa22b31e9cd4046&'})
  
    channel.send({ embeds: [bannerEmbed, werbeEmbed] })
    // Wenn die Nachricht automatisch veröffentlicht werden soll:
    .then(async msg => {
      msg.crosspost()
    })
  }, 60000 * 360 ); // 6 Stunden in Millisekunden

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

// Werbung
setInterval(() => {
    const guild = client.guilds.cache.get("815919809379172354");
    const channel = guild.channels.cache.get("1177536720229650442");
      
    const bannerEmbed = new EmbedBuilder()
          .setColor('Blurple')
          .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1143165949864849419/World_Of_Community.png?ex=662f9841&is=661d2341&hm=94cca3673a9731afbc0210dc4525df02ae7ffc006f41bd7aee57b8f50b9b470b&')
    
    const werbeEmbed = new EmbedBuilder()
         .setTitle('`🌍` WORLD OF COMMUNITY - GAMING, COMMUNITY & CHILL')
         .setDescription('Du suchst ein Discord Server mit Gaming, Community & Chill?\n\n> Dann bist du bei uns genau richtig!\n\n**__Wir bieten dir:__**\n\n> `🎭` | » **Server-Rollen** um **dein Server Profil** anzupassen\n> `🔔` | » **Server-Events** in **Discord**\n> `✨` | » **Selbst** Programmierte Bots mit einzigartigen Features!\n> `👥` | » **Freundliche & Hilfsbereite** Community!\n\n> `📌` | **Gib uns eine Chance und Betrete noch heute unseren Discord-Server!**\n\nKleiner Tipp, wenn du deine Freunde mitbringst macht es gleich viel mehr Spaß, da du dann schonmal jemanden kennst!\n\n» Link: https://discord.gg/686M8Cxsaa')
         .setColor('Blurple')
         .setFooter({ text: 'World Of Community - Werbung', iconURL: 'https://cdn.discordapp.com/attachments/815983648574275584/1202182432506523648/WOC_Orange.png?ex=6624db23&is=662389a3&hm=5bccd1823f8042757910fb78c8cca1cb6ff34a2095e77c9b9aa22b31e9cd4046&'})
  
    channel.send({ embeds: [bannerEmbed, werbeEmbed] })
    // Wenn die Nachricht automatisch veröffentlicht werden soll:
    .then(async msg => {
      msg.crosspost()
    })
  }, 60000 * 360 ); // 6 Stunden in Millisekunden

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