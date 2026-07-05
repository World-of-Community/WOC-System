import client from "../index.js";
import { Events, ActivityType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import serverdb from "../models/serverdb.js";
import userdb from "../models/userdb.js";
import InviteCacheModel from "../models/inviteCachedb.js";

client.on(Events.GuildMemberAdd, async (member) => {

        //try {
        //    const WillkommenDMEmbed = new EmbedBuilder()
        //        .setTitle('Herzlich Willkommen!')
        //        .setDescription(`Hallo ${member.displayName}, \`💖\`-lich Willkommen auf **${member.guild.name}**!\n\nSchau dich in aller Ruhe um und vor allem, hab viel Spaß hier.\n\nDu möchtest dein Geburtstag mit der Community feiern?\nKein Problem! Besuche den Kanal <#979431125053227068> und Benutze: \`/birthday set\` (**MIT JAHR** für eine Altersrolle!) und trage dein Geburtstag ein.\n\n:information_source: | Du möchtest ein Mitglied melden?\n» Benutze: \`/report <user> <grund>\`\n» Das ausnutzen des Report Befehls wird bestraft!\n\nBitte verifiziere dich noch bei den <#815922286502346773> damit wir ein sicheres Umfeld sowie Atmosphäre bewahren können.\n\nSollten irgendwelche Fragen oder sonstigen Probleme auftauchen, dann wende dich gerne an unseren Support unter <#819555839362072606>`)
        //        .setThumbnail(member.displayAvatarURL({ dynamic: true }))
        //        .setColor('Orange')
        //        .setFooter({ text: 'Viel Spaß auf dem Server!', iconURL: member.guild.iconURL({ dynamic: true }) })
        //        .setTimestamp();

        //    await member.send({ embeds: [WillkommenDMEmbed] }); // Sende die DM an den User

        //    console.log(`DM mit Willkommens-Embed an ${member.user.tag} gesendet.`);
        //} catch (error) {
        //    console.error(`Konnte kein Willkommens-Embed DM an ${member.user.tag} senden:`, error);
        //}

        const serverData = await serverdb.findOne({ guildID: member.guild.id })
        if (member.user.bot) return;
        if (serverData.deactivated.includes("willkommensnachrichten")) return;

        const welcomeChannel = await member.guild.channels.cache.get('1433189396475023380') // Willkommenskanal

        // Falls man Mitgliederzahl sehen möchte bei Willkommensnachrichten -> (\`#${member.guild.memberCount}\`)

        const contents = [
            `<a:Join:1375559039098032299> ${member} **ist gerade auf den Server geschlittert** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Ein wildes** ${member} **erscheint!** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> ${member} **hat den weg gefunden** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> ${member} **ist gelandet** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> ${member} **ist auf den Server gehüpft** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> ${member} **bringt Kekse** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Kann jemand** ${member} **etwas herumführen?** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Huch!** ${member} **ist zu uns gestolpert** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Heißen wir** ${member} **Willkommen bei uns!** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> ${member} **gibt allen eine Runde aus, Willkommen** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Willkommen** ${member} **Wir hoffen, du hast Pizza mitgebracht.** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Hey** ${member} **sind wir froh das du uns gefunden hast** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Juhu,** ${member} **du hast es zu uns geschafft!** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Herzlich Willkommen** ${member} **Sag hallo** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> ${member} **Hilft uns die Welt zu erobern.** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Danke dass du uns eine Chance gibst,** ${member} **Willkommen!** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Wir begrüßen** ${member} **in der Community** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Diese Entscheidung war kein Fehler,** ${member} **- Willkommen!** <a:winken:1086560167442796544>`,
            `<a:Join:1375559039098032299> **Schön, dass du da bist,** ${member} <a:winken:1086560167442796544>`
        ]
        const rndContent = Math.floor(Math.random() * contents.length)

        await welcomeChannel.send({ content: `${contents[rndContent]}` })

        const logchannel = await member.guild.channels.cache.get("1263436406655680513");

        const join = new EmbedBuilder()
            .setTitle('<:user_join:1228329348470407198> | NUTZER BEIGETRETEN')
            .setDescription(`**${member.user.displayName}** ist dem Server beigetreten.\n\n\`📌\` | **INFORMATIONEN**\n> Username: ${member.user.username}\n> Anzeigename: ${member.user.displayName} (${member})\n> Nutzer-ID: \`${member.user.id}\`\n> Server beigetreten: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n> Account erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
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

    // Fake Bot Account System
    const suspiciousRoleID = '886989738244964362'; // Bann Rolle
    const threadID = '1269998219266490538'; // ID des Moderation Logs

    const username = member.user.username.toLowerCase();
    const joinedRecently = (Date.now() - member.user.createdTimestamp) < 7 * 24 * 60 * 60 * 1000; // Account jünger als 7 Tage
    const noAvatar = member.user.displayAvatarURL().includes('default');

    // Kriterien für verdächtige Fake-Bots
    const isSuspicious = !member.user.bot &&
        (username.includes('bot') || username.includes('assistant')) &&
        (joinedRecently || noAvatar);

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
                await thread.send({ embeds: [embed] });
                console.log(`Embed in Thread gesendet: ${thread.name}`);
            } else {
                console.error('Thread mit der angegebenen ID wurde nicht gefunden oder ist kein Thread.');
            }
        } catch (error) {
            console.error(`Fehler bei der Verarbeitung von ${member.user.tag}:`, error);
        }
    }
        // Invite System
        const guild = member.guild;
        const newInvites = await guild.invites.fetch();

        let inviteCache = await InviteCacheModel.findOne({ guildID: guild.id });

        if (!inviteCache) {
          inviteCache = await InviteCacheModel.create({
            guildID: guild.id,
            invites: newInvites.map(i => ({ code: i.code, uses: i.uses }))
          });
        } else {
          inviteCache.invites = newInvites.map(i => ({ code: i.code, uses: i.uses }));
          await inviteCache.save();
        }

        // Finde die Einladung mit geänderter Nutzungszahl
        const usedInvite = newInvites.find(i => {
          const cachedInvite = inviteCache.invites.find(c => c.code === i.code);
          return cachedInvite && i.uses > cachedInvite.uses;
        });

        if (!usedInvite) return;

        // Update Einladungs-Statistik im User-Dokument
        await userdb.findOneAndUpdate(
          { userID: usedInvite.inviter.id },
          { $inc: { 'invites.joins': 1 } },
          { upsert: true }
        );

        // Speichere, von wem der Member eingeladen wurde
        await userdb.findOneAndUpdate(
          { userID: member.id },
          { invitedBy: usedInvite.inviter.id },
          { upsert: true }
        );

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

        try {
          const userId = member.id;
          let userData = await Coin.findOne({ userId });

          if (!userData) {
            console.log(`[DAILY-STREAK] ${member.user.tag} tritt neu bei – kein Datensatz vorhanden, kein Reset nötig.`);
            return;
          }

          // Streak bleibt 0, falls sie schon zurückgesetzt wurde
          if (userData.streak !== 0) {
            userData.streak = 0;
            await userData.save();
            console.log(`[DAILY-STREAK] ${member.user.tag} ist zurückgekehrt – Streak auf 0 gesetzt.`);
          } else {
            console.log(`[DAILY-STREAK] ${member.user.tag} ist zurückgekehrt – Streak war bereits 0.`);
          }
        } catch (error) {
          console.error('Fehler beim Zurücksetzen der Streak beim Beitritt:', error);
        }
    });
