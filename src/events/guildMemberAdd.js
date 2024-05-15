const { Events, ActivityType, EmbedBuilder, ChannelType } = require("discord.js");
const client = require('../index');
const fs = require('fs')
const file = fs.readFileSync('src/json/config.json', 'utf-8');
const config = JSON.parse(file);
module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
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
            `<a:Join:978633410992021524> **Danke dass du uns eine Chance gibst,** ${member} (\`#${member.guild.memberCount}\`) **Willkommen!** <a:winken:1086560167442796544>`
        ]
        const rndContent = Math.floor(Math.random() * contents.length)

        await welcomeChannel.send({ content: `${contents[rndContent]}` })

        // Server-Regeln Erwähnung neue Mitglieder

        const channel = member.guild.channels.cache.get('815922286502346773');
        if (!channel) return console.error('Kanal wurde nicht gefunden.');

        try {
            const message = await channel.send(`Willkommen auf unserem Discord-Server, ${member}! Bitte Verifiziere dich bei den Server-Regeln`);

            setTimeout(() => {
                message.delete();
            }, 1 * 60 * 60 * 1000); // 1 Stunde in Millisekunden
        } catch (err) {
            console.error('Fehler beim Senden der Nachricht:', err);
        }
        
        const logChannelId = '886269505330896926';

        member.client.on('guildMemberAdd', (member) => {
            const join = new EmbedBuilder()
                .setTitle('NUTZER BEIGETRETEN')
                .setColor('Green')
                .setDescription(`${member.user.displayName} ist dem Server beigetreten.`);

            const logChannel = member.guild.channels.cache.get(logChannelId);
            if (logChannel) logChannel.send({ embeds: [join] });
        });

        member.client.on('guildMemberRemove', (member) => {
            const leave = new EmbedBuilder()
                .setTitle('NUTZER VERLASSEN')
                .setColor('Red')
                .setDescription(`${member.user.displayName} hat den Server verlassen.`);

            const logChannel = member.guild.channels.cache.get(logChannelId);
            if (logChannel) logChannel.send({ embeds: [leave] });
        });
    }
}