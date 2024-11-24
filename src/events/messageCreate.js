const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');
const serverdb = require("../../Datenbank/serverdb");
const userdb = require("../../Datenbank/userdb");
const messagedb = require("../../Datenbank/messagedb");
const teamdb = require("../../Datenbank/teamdb");

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
        if(!message.guild) return
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);

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
        if (uD) {
            if (uD.afk) {

                const m = await message.reply(`<:grnAFK:1021087367261585439> | ${message.author} **ist wieder da!**\n> *Dein AFK-Status wurde entfernt. (Dauer: ${uD.afkStamp})*`)
                uD.afk = false
                uD.afkReason = ""
                uD.afkStamp = ""
                await uD.save()
                setTimeout(async () => {
                    try {
                        await m.delete()
                    } catch (error) {

                    }
                }, 5000)

                await message.member.setNickname(`${message.member.displayName.replace("AFK | ", "")}`).catch((err) => { })
            }
            }
        }

        // Bump System (geht noch nicht)
        const roleId = '1286573447807500319'; // ID der Rolle Bump Reward
        const disboardBotId = '302050872383242240'; // ID des Disboard-Bots

        // Überprüfen, ob die Nachricht vom Disboard-Bot stammt und den erfolgreichen Bump bestätigt
        if (message.author.id === disboardBotId && message.embeds.length > 0) {
        const embed = message.embeds[0];

        if (embed.description && embed.description.includes('Bump done')) {
            // Benutzer, der den Bump ausgeführt hat
            const member = message.guild.members.cache.get(message.interaction.user.id);

            if (!member) return;

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
                    await member.roles.remove(role);
                    member.send({ content: `> \`❗\` » Deine Rolle ${role} ist gerade abgelaufen (Du hattest die Rolle für: \`2 Stunden\`)`, ephemeral: true });
                }, 7200000); // 2 Stunden in Millisekunden
            } catch (error) {
                console.error(error);
                message.channel.send({ content: '> `❗` » Es gab einen Fehler beim Zuweisen der Rolle.', ephemeral: true });
            }
        }
    }

        // Discord Server Links im Haupt Chat & andere Chats löschen
        const CHANNEL_IDS = [
            '815922756918181898', // Haupt Chat
            '896743941813207081', // Spielersuche 
            '1250047970116636756', // Vorstellung 
            '886140608039747614', // Bilder und Videos
        ]; // Nicht erlaubte Kanäle
        const ALLOWED_CHANNEL_IDS = [
            '1172920281526960238' // Werbung für alle
        ]; // Liste der erlaubten Kanäle


        if (CHANNEL_IDS.includes(message.channel.id) && !message.author.bot) {
            const discordLinkPattern = /(https?:\/\/)?(www\.)?(discord\.gg|discordapp\.com\/invite)\/[^\s]+/;
            if (discordLinkPattern.test(message.content)) {
                try {
                    await message.delete();

                    const allowedChannelsMention = ALLOWED_CHANNEL_IDS.map(id => `<#${id}>`).join(', ');

                    const WarnEmbed = new EmbedBuilder()
                    .setTitle('⚠️ | WARNUNG')
                    .setDescription(`> Das Teilen von (Discord)-Server-Links ist in diesem Kanal\n> (<#${message.channel.id}>) nicht erlaubt.\n\n> Bitte nutze die erlaubten Kanäle wie z.b.\n> ${allowedChannelsMention}`)
                    .setColor('Red')
                    .setTimestamp();

                    try {
                        await message.author.send({ embeds: [WarnEmbed] });
                    } catch (error) {
                        console.error(`Konnte DM nicht senden: ${error}`);
                    }
                } catch (error) {
                    console.error(`Konnte Nachricht nicht löschen: ${error}`);
                }
            }
        }
    }
}