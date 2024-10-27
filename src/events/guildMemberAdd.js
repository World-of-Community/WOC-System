const { Events, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const client = require('../index');
const fs = require('fs');
const serverdb = require("../../Datenbank/serverdb");
const userdb = require("../../Datenbank/userdb");
const { willkommen } = require('../json/config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {

        const logchannel = await member.guild.channels.cache.get("1263436406655680513");

        const join = new EmbedBuilder()
            .setTitle('<:user_join:1228329348470407198> | NUTZER BEIGETRETEN')
            .setDescription(`**${member.user.displayName}** ist dem Server beigetreten.\n\n\`📌\` | **INFORMATIONEN**\n> Username: ${member.user.username}\n> Anzeigename: ${member.user.displayName} (${member})\n> Server beigetreten: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n> Account erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
            .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
            .setColor('Green')
            .setTimestamp();

        await logchannel.threads.cache.get("1269998215512457259").send({embeds: [join]});

        const neuesMitglied = await member.guild.roles.cache.get('1222122625594294272'); 
        const mitglied = await member.guild.roles.cache.get('815920703067914290'); 

        try {
            await member.roles.add(neuesMitglied);
            await member.roles.add(mitglied);
        } catch (error) {
            console.error('Fehler beim Hinzufügen der Rolle:', error);
        }

        const serverData = await serverdb.findOne({ guildID: member.guild.id })
        if (member.user.bot) return; 
        if (serverData.deactivated.includes("willkommensnachrichten")) return;
        
        const welcomeChannel = await member.guild.channels.cache.get(config.willkommen)

        const contents = [
            `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **ist gerade auf den Server geschlittert** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Ein wildes** ${member} (\`#${member.guild.memberCount}\`) **erscheint!** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **hat den weg gefunden** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **ist gelandet** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **ist auf den Server gehüpft** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **bringt Kekse** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Kann jemand** ${member} (\`#${member.guild.memberCount}\`) **etwas herumführen?** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Huch!** ${member} (\`#${member.guild.memberCount}\`) **ist zu uns gestolpert** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Heißen wir** ${member} (\`#${member.guild.memberCount}\`) **Willkommen bei uns!** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **gibt allen eine Runde aus, Willkommen** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Willkommen** ${member} (\`#${member.guild.memberCount}\`) **Wir hoffen, du hast Pizza mitgebracht.** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Hey** ${member} (\`#${member.guild.memberCount}\`) **sind wir froh das du uns gefunden hast** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Juhu,** ${member} (\`#${member.guild.memberCount}\`) **du hast es zu uns geschafft!** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Herzlich Willkommen** ${member} (\`#${member.guild.memberCount}\`) **Sag hallo** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> ${member} (\`#${member.guild.memberCount}\`) **Hilft uns die Welt zu erobern.** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Danke dass du uns eine Chance gibst,** ${member} (\`#${member.guild.memberCount}\`) **Willkommen!** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Wir begrüßen** ${member} (\`#${member.guild.memberCount}\`) **in der Community** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Diese Entscheidung war kein Fehler,** ${member} (\`#${member.guild.memberCount}\`) **- Willkommen!** <a:winken:1086560167442796544>`,
            `<a:Join:978633410992021524> **Schön, dass du da bist,** ${member} (\`#${member.guild.memberCount}\`) <a:winken:1086560167442796544>`
        ]
        const rndContent = Math.floor(Math.random() * contents.length)

        await welcomeChannel.send({ content: `${contents[rndContent]}` })

        const channel = member.guild.channels.cache.get('815922286502346773');
        if (!channel) return console.error('Kanal wurde nicht gefunden.');

        try {
            const message = await channel.send(`Willkommen auf unserem Discord-Server, ${member}! Bitte Verifiziere dich bei den Server-Regeln`);

            setTimeout(() => {
                message.delete();
            }, 5 * 60 * 1000); 
        } catch (err) {
            console.error('Fehler beim Senden der Nachricht:', err);
        }

        const userData = await userdb.findOne({ userID: member.id })
        if (!userData) {
            const newUser = new userdb({
                userID: member.id,
                donation: 0,
                reactions: [],
                'birthday.tag': 0, 
                'birthday.monat': 0,
                
            });
            await newUser.save()
        }
    }
}