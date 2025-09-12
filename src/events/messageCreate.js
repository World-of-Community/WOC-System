const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');
const serverdb = require("../../Datenbank/serverdb");
const userdb = require("../../Datenbank/userdb");
const messagedb = require("../../Datenbank/messagedb");
const teamdb = require("../../Datenbank/teamdb");
const bumpdb = require("../../Datenbank/bumpdb");
const { time } = require("console");

const TeamRoleIds = [
    '959869691529154631', // Admin
    '893423428558782465', // Team-leitung
    '929349039433056276', // Developer
    '816985466230145044', // Sr-Moderator
    '815920052385480754', // Moderator
    '815920170371383366', // Supporter
    '1263645368441241700', // Builder
];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {

        const deleteAfter = 30 * 1000;
        const mcServerIP = "worldofcommunity.de";
        const frage = message.content.toLowerCase();
    
        const suchbegriffe = [
            'wie ist die ip',
            'was ist die ip',
            'server ip',
            'minecraft ip',
            'ip',
            'ip?',
            'ip ?',
            'ip bitte',
            'ip vom server',
            'ip vom mc server',
            'was ist die ip vom server',
            'was ist die ip vom mc server',
            'wie lautet die ip',
            'kannst du mir die ip geben',
            'was ist die ip adresse',
            'ip adresse',
            'serveradresse',
            'adresse vom server',
            'mc ip',
            'mc-ip',
            'ip des servers',
            'minecraft server ip',
            'wie komme ich auf den server',
            'wie kann ich joinen',
            'wie joine ich',
            'join ip',
            'wie komme ich auf den mc server',
            'ip pls',
            'ip plz',
            'ip pls?',
            'ip pls!',
            'ip pls :D',
            'ip pls :)',
            'ip? :)',
            'wie ist nochmal die ip',
            'wie ist nochmal die ip?',
            'wie war nochmal die ip',
            'wie war nochmal die ip?',
            'ip vom minecraft server'
        ];
    
        if (suchbegriffe.some(begriff => frage.includes(begriff.toLowerCase()))) {
            const timestamp = Math.floor((Date.now() + deleteAfter) / 1000);
    
            const embed = new EmbedBuilder()
                .setTitle('`🌐` Minecraft-Server IP')
                .setDescription(
                    `> \`📡\` » Die IP des Servers lautet:\n` +
                    `\`\`\`${mcServerIP}\`\`\`\n` +
                    `> \`⚙️\` » Version: **ab 1.20.4**\n\n` +
                    `> \`⏳\` » Nachricht wird gelöscht <t:${timestamp}:R> (<t:${timestamp}:F>)`
                )
                .setColor('Green');
    
            const reply = await message.reply({ embeds: [embed] });
            setTimeout(() => {
                reply.delete().catch(console.error);
                message.delete().catch(console.error);
            }, deleteAfter);
        }

        const erlaubterKanal = "815922756918181898"; // Haupt chat

        if (message.channel.id !== erlaubterKanal) return; // Bricht ab, wenn es nicht der Kanal ist
        
        try {
            await messagedb.findOneAndUpdate(
                { guildID: message.guild.id },
                { $inc: { messages: 1 } }, // Zählt nur hoch, wenn im richtigen Kanal
                { new: true, upsert: true }
            );
        } catch (err) {
            console.error("Fehler beim Hochzählen der Nachrichten:", err);
        }
            
        if (!message.guild) return
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);

        if (
            message.interaction?.commandName === 'bump' &&
            message.applicationId === '302050872383242240' &&
            message.guildId === '815919809379172354'
        ) {
            //// BUMP HANDLER
        }

        // Teammitglied erwähnen Bot gibt Info Ticket Support
        if (!message.author.bot) {

            if(message.member.roles.cache.some(role => TeamRoleIds.includes(role.id))) {
                let teamMitglied = await teamdb.findOne({ userID: message.author.id });
                if(!teamMitglied) {
                    teamMitglied = new teamdb({
                        userID: message.author.id
                    })
                }

                teamMitglied.messages++
                await teamMitglied.save()
            }

        const authorHasTeamRole = message.member.roles.cache.some((role) => role.id === '820658664536145940');
        if (authorHasTeamRole) return;

        const mentions = message.mentions.members;
        const hasTeamMemberMention = mentions.some((member) => member.roles.cache.some((role) => role.id === '820658664536145940'));

        if (hasTeamMemberMention &&  !message.reference) {
        message.reply('Bitte erwähne oder Pinge keine Teammitglieder, öffne ein Ticket im <#819555839362072606> bei Fragen oder Problemen.')
            .then(sentMessage => {
                setTimeout(() => {
                    sentMessage.delete().catch(console.error);
                }, 5000);
            })
            .catch(console.error);
        }
    }

        // AFK System
        if (!message.author.bot) { 
            const uD = await userdb.findOne({ userID: message.author.id });
            if (uD && uD.afk && uD.afkStamp) {
                const afkSeit = uD.afkStamp; // Bereits gespeicherter Unix-Timestamp
        
                // Nachricht senden
                const m = await message.reply(
                    `<:grnAFK:1021087367261585439> | ${message.author} **ist wieder da!**\n> *Dein AFK-Status wurde entfernt. (Dauer: <t:${afkSeit}:R>)*`
                );
        
                // AFK-Status entfernen
                uD.afk = false;
                uD.afkReason = "";
                uD.afkStamp = ""; // Optional: besser `null` statt leeren String
                await uD.save();
        
                // Nachricht nach 5 Sekunden löschen
                setTimeout(async () => {
                    try {
                        await m.delete();
                    } catch (error) {}
                }, 5000);
        
                // Nickname anpassen
                await message.member.setNickname(
                    message.member.displayName.replace("AFK | ", "")
                ).catch(() => {});
            }
        }


        // Bump System (überarbeitet)
        const roleId = '1286573447807500319'; // ID der Rolle Bump Reward
        const disboardBotId = '302050872383242240'; // ID des Disboard-Bots

        // Überprüfen, ob die Nachricht vom Disboard-Bot stammt und den erfolgreichen Bump bestätigt
    if (message.author.id === disboardBotId && message.embeds.length > 0) {
        const embed = message.embeds[0];

        if (embed.description && embed.description.includes('Bump done')) {
            // Der Benutzer wird nicht direkt durch die Disboard-Bot-Nachricht identifiziert
            const bumpUserId = embed.description.match(/<@!?(\d+)>/)?.[1]; // Extrahiere User-ID aus der Nachricht
            if (!bumpUserId) {
                return message.channel.send('> `❗` » Konnte den Benutzer, der den Bump ausgeführt hat, nicht ermitteln.');
            }

            const member = message.guild.members.cache.get(bumpUserId);
            if (!member) {
                return message.channel.send('> `❗` » Benutzer konnte nicht gefunden werden.');
            }

            const role = message.guild.roles.cache.get(roleId);
            if (!role) {
                return message.channel.send('> `❗` » Die Rolle existiert nicht.');
            }

            try {
                // Rolle hinzufügen
                await member.roles.add(role);
                await message.channel.send(`${member} vielen Dank für deinen Bump!\nDu hast nun die ${role} Rolle.`);

                // Rolle nach 2 Stunden entfernen
                setTimeout(async () => {
                    try {
                        await member.roles.remove(role);
                        member.send({ content: `> \`❗\` » Deine Rolle ${role} ist gerade abgelaufen (Du hattest die Rolle für: \`2 Stunden\`)`, ephemeral: true });
                    } catch (error) {
                        console.error(`Fehler beim Entfernen der Rolle: ${error}`);
                    }
                }, 7200000); // 2 Stunden in Millisekunden
            } catch (error) {
                console.error(`Fehler beim Zuweisen der Rolle: ${error}`);
                message.channel.send('> `❗` » Es gab einen Fehler beim Zuweisen der Rolle.');
            }
        }
    }

    // Konfiguration der Kanäle
    const CHANNEL_IDS = [
        '815922756918181898', // Haupt Chat
        '896743941813207081', // Spielersuche
        '1250047970116636756', // Vorstellung
        '886140608039747614', // Bilder und Videos
    ]; // Nicht erlaubte Kanäle

    const ALLOWED_CHANNEL_IDS = [
        '1172920281526960238', // Werbung für alle
    ]; // Liste der erlaubten Kanäle

        // Ignoriere Bots und überprüfe ob der Kanal nicht erlaubt ist
    if (!CHANNEL_IDS.includes(message.channel.id) || message.author.bot) return;

    // Muster zur Erkennung von Discord-Links
    const discordLinkPattern = /(https?:\/\/)?(www\.)?(discord\.gg|discordapp\.com\/invite)\/[^\s]+/;

    // Überprüfe, ob die Nachricht einen Discord-Link enthält
    if (discordLinkPattern.test(message.content)) {
        try {
            // Lösche die Nachricht
            await message.delete();

            // Erstelle eine Erwähnungsliste der erlaubten Kanäle
            const allowedChannelsMention = ALLOWED_CHANNEL_IDS.map(id => `<#${id}>`).join(', ');

            // Erstelle das Warn-Embed
            const WarnEmbed = new EmbedBuilder()
                .setTitle('⚠️ | WARNUNG')
                .setDescription(
                    `> Das Teilen von (Discord)-Server-Links ist in diesem Kanal\n> (<#${message.channel.id}>) nicht erlaubt.\n\n> Bitte nutze die erlaubten Kanäle wie z.B.\n> ${allowedChannelsMention}`
                )
                .setColor('Red')
                .setTimestamp();

            // Versuche, dem Nutzer die Warnung als DM zu senden
            try {
                await message.author.send({ embeds: [WarnEmbed] });
            } catch (error) {
                console.error(`Konnte DM nicht senden: ${error}`);

                // Sende das Embed im Kanal und erwähne den Benutzer (nur sichtbar für ihn)
                const channelWarning = await message.channel.send({
                    content: `${message.author}, du kannst keine Server-Links in diesem Kanal teilen.`,
                    embeds: [WarnEmbed],
                });

                // Lösche die Nachricht nach 10 Sekunden
                setTimeout(() => channelWarning.delete().catch(console.error), 10000);
            }
        } catch (error) {
            console.error(`Konnte Nachricht nicht löschen: ${error}`);
        }
    }
    }
}