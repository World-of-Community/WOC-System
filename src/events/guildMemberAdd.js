const { Events, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const client = require('../index');
const fs = require('fs');
const serverdb = require("../../Datenbank/serverdb");
const userdb = require("../../Datenbank/userdb");
//const { welcomechannel } = require('../json/config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {

        const serverData = await serverdb.findOne({ guildID: member.guild.id })
        if (member.user.bot) return; 
        if (serverData.deactivated.includes("willkommensnachrichten")) return;
        
        const welcomeChannel = await member.guild.channels.cache.get('815922756918181898') // Willkommenskanal

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

        // Server Regeln Ping
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

        try {
            // Embed-Nachricht erstellen
            const WillkommenDMEmbed = new EmbedBuilder()
                .setTitle('`💖`-lich Willkommen!')
                .setDescription(`Hallo ${member.user.username}, herzlich Willkommen auf **${member.guild.name}**!\n\nSchau dich in aller Ruhe um und vor allem, hab viel Spaß hier.\n\nDu möchtest dein Geburtstag mit der Community feiern? Kein Problem! benutze den Befehl \`/birthday set\` (**MIT JAHR** für eine Altersrolle!) und trage dein Geburtstag ein.\n\nDu willst ein Regelbrecher melden der sich nicht an die Regeln hält? Benutze: \`/report <user> <grund>\`\n\nBitte verifiziere dich noch bei den <#815922286502346773> damit wir ein sicheres Umfeld sowie Atmosphäre bewahren können.\n\nSollten irgendwelche Fragen oder sonstigen Probleme auftauchen, dann wende dich gerne an unseren Support unter <#819555839362072606>`)
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setColor('Orange')
                .setFooter({ text: 'Viel Spaß auf dem Server!', iconURL: member.guild.iconURL({ dynamic: true }) })
                .setTimestamp();

            // Sende die DM an den User
            await member.send({ embeds: [WillkommenDMEmbed] });

            console.log(`DM mit Willkommens-Embed an ${member.user.tag} gesendet.`);
        } catch (error) {
            console.error(`Konnte kein Willkommens-Embed DM an ${member.user.tag} senden:`, error);
        }

        // Meilenstein 1.000+ Mitglieder erreicht
        const guild = member.guild;

        // Prüfen, ob die Mitgliederanzahl ein Vielfaches von 1000 ist
        if (guild.memberCount % 1000 === 0) {
            const channel = guild.channels.cache.get('981190525774336020'); // Neuigkeiten Kanal
            if (channel) {
                // Mitgliederanzahl mit Punkt als Tausendertrennzeichen formatieren
                const formattedCount = guild.memberCount.toLocaleString('de-DE');
                channel.send(`🎉 Der Server hat nun die **${formattedCount} Mitglieder** erreicht! Vielen Dank an die Community! 🎉`);
            } else {
                console.log('Kanal mit der angegebenen ID wurde nicht gefunden. (Glückwunsch-System 1000+ Mitglieder)');
              }
        }

    // Fake Bot Account System
    const suspiciousRoleID = '886989738244964362'; // Bann Rolle
    const threadID = '1269998219266490538'; // ID des Moderation Logs


    const username = member.user.username.toLowerCase();
    const joinedRecently = (Date.now() - member.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000; // Account jünger als 7 Tage
    const noAvatar = member.user.displayAvatarURL().includes('default');

    // Kriterien für verdächtige Fake-Bots
    const isSuspicious = !member.user.bot && // Keine echten Bots
        (username.includes('bot') || username.includes('assistant')) && // Verdächtige Namen
        (joinedRecently || noAvatar); // Kürzlich erstellt oder Standard-Avatar

    if (isSuspicious) {
        try {
            // Rolle zuweisen
            const role = member.guild.roles.cache.get(suspiciousRoleID);
            if (role) {
                await member.roles.add(role);
                console.log(`Rolle "Gebannt" zugewiesen an: ${member.user.tag}`);
            } else {
                console.error('Die Rolle "Gebannt" wurde nicht gefunden.');
            }

            // Embed erstellen
            const embed = new EmbedBuilder()
                .setTitle('⚠️ Verdächtiger Account erkannt')
                .setDescription(`Ein verdächtiger Account wurde erkannt und markiert.\n\nBenutzername: ${member.user.tag} (${member.user.displayName})\nBenutzer-ID: ${member.id}\nErstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
                .setColor('RED')
                .setThumbnail(member.user.displayAvatarURL())
                .setFooter({ text: 'Überprüfe den Account und treffe geeignete Maßnahmen.' })
                .setTimestamp();

            // Thread abrufen
            const thread = await member.guild.channels.fetch(threadID);
            if (thread && thread.isThread()) {
                // Embed in den Thread senden
                await thread.send({ embeds: [embed] });
                console.log(`Embed in Thread gesendet: ${thread.name}`);
            } else {
                console.error('Thread mit der angegebenen ID wurde nicht gefunden oder ist kein Thread.');
            }
        } catch (error) {
            console.error(`Fehler bei der Verarbeitung von ${member.user.tag}:`, error);
        }
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