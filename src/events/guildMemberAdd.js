const { Events, ActivityType } = require("discord.js");
const fs = require('fs')

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        const welcomeChannel = await member.client.channels.fetch(config.willkommen)
        const client = member.client

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
        
        // Rolle für 24 Stunden
        const newRole = member.guild.roles.cache.get("1222122625594294272");
        if (!newRole) return console.error('Rolle wurde nicht gefunden.');
        const interval = 24 * 60 * 60 * 1000; // 24 Stunden in Millisekunden

        try {
            await member.roles.add(newRole);
            console.log(`Rolle ${newRole.name} wurde ${member.user.username} zugewiesen.`);

            startRoleProcess();
        } catch (err) {
            console.error('Fehler beim Zuweisen der Rolle:', err);
        }

        async function startRoleProcess() {
             
            const guild = client.guilds.cache.first(); 
            let initialRole = guild.roles.cache.get("1222122625594294272");
            let newRole = guild.roles.cache.get("815920703067914290");

          
            if (!initialRole || !newRole) {
              console.error('Rolle nicht gefunden.');
              return;
            }
          
            setInterval(async () => {
              const membersWithInitialRole = initialRole.members; 
              membersWithInitialRole.forEach(async (member) => {
                // Erste Rolle entfernen
                await member.roles.remove(initialRole);
                console.log(`Rolle ${initialRole.name} wurde von ${member.user.username} entfernt.`);
          
                // Zweite Rolle hinzufügen
                await member.roles.add(newRole);
                console.log(`Rolle ${newRole.name} wurde ${member.user.username} zugewiesen.`);
              });
            }, interval);
          }
    }
}