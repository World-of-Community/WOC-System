const { Events, EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType } = require("discord.js");
const userdb = require("../../Datenbank/userdb");
const config = require("../json/config.json")

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        const userData = await userdb.findOne({ userID: interaction.user.id })
        client = interaction.client

        // Ränge Menu
        if (interaction.customId === 'ränge-menu') {
            switch (interaction.values[0]) {
                case 'server': {
                    const year = await interaction.guild.roles.cache.get('972193356333604874')
                    const roleCountY = year.members.size

                    const informant = await interaction.guild.roles.cache.get('1147250265641201724')
                    const roleCountI = informant.members.size

                    const umfrage = await interaction.guild.roles.cache.get('1147250982967836823')
                    const roleCountU = umfrage.members.size

                    const SDES = await interaction.guild.roles.cache.get('992008555987222548')
                    const roleCountSDES = SDES.members.size

                    const christmas = await interaction.guild.roles.cache.get('863034801036591114')
                    const roleCountC = christmas.members.size

                    const lucky = await interaction.guild.roles.cache.get('1124598019862573096')
                    const roleCountlucky = lucky.members.size

                    const serverEST = await interaction.guild.roles.cache.get('882240367632744508')
                    const roleCountSEST = serverEST.members.size

                    const serverEmbed = new EmbedBuilder()
                        .setTitle('<a:trophe:1112823561992818859> 𑁉 UNSERE SERVER-ERFOLGE')
                        .setDescription(`» Mit **Erfolgen** kannst du **vor deinen Freunden** angeben und hast die Chance, in unserem Server **einzigartige Erfolge freizuschalten!**\n\n\`🧡\` 𑁉 <@&972193356333604874> (\`${roleCountY}👥\`)\n<:Pfeil:1119709908540076124> Mitglied seit **einem Jahr** auf dem Server.\n\n\`💡\` 𑁉 <@&1147250265641201724> (\`${roleCountI}👥\`)\n<:Pfeil:1119709908540076124> Reiche **10 Server-Ideen** ein.\n\n\`📢\` 𑁉 <@&1147250982967836823> (\`${roleCountU}👥\`)\n<:Pfeil:1119709908540076124> Nimm an **20 Server-Umfragen** teil.\n\n \`💚\` 𑁉 <@&992008555987222548> (\`${roleCountSDES}👥\`)\n<:Pfeil:1119709908540076124> **Seit 2021** auf World Of Community\n\n \`🎄\` 𑁉 <@&863034801036591114> (\`${roleCountC}👥\`)\n<:Pfeil:1119709908540076124> Exklusiv an **Weihnachten 2021** erhalten\n\n \`☘️\` 𑁉 <@&1124598019862573096> (\`${roleCountlucky}👥\`)\n<:Pfeil:1119709908540076124> **Gewinne** bei einem Event auf WOC.\n\n \`🔓\` 𑁉 <@&882240367632744508> (\`${roleCountSEST}👥\`)\n<:Pfeil:1119709908540076124> War bei der **Server-Eröffnung 2021** dabei.`)
                        .setColor('Orange')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1190736340531302450/WOC_Banner_Unsere_Server_Erfolge.jpg?ex=65ac1d22&is=6599a822&hm=48316e7dc0ac8328953f6fcb6685bc2f1fbf53f286de7f8f864258a6ca81af85&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [serverEmbed], ephemeral: true })
                } break;

                case 'minecraft': {
                    const supreme = await interaction.guild.roles.cache.get('815921105407574056')
                    const roleCountsupreme = supreme.members.size

                    const premium = await interaction.guild.roles.cache.get('917826787977871441')
                    const roleCountpremium = premium.members.size

                    const legende = await interaction.guild.roles.cache.get('815920452337139733')
                    const roleCountlegende = legende.members.size

                    const emerald = await interaction.guild.roles.cache.get('835775556611997697')
                    const roleCountemerald = emerald.members.size

                    const diamond = await interaction.guild.roles.cache.get('835775627721179167')
                    const roleCountdiamond = diamond.members.size

                    const episch = await interaction.guild.roles.cache.get('835775597446955048')
                    const roleCountepisch = episch.members.size

                    const spielerEmbed = new EmbedBuilder()
                        .setTitle('`🌍` 𑁉 UNSERE MINECRAFT-RÄNGE')
                        .setDescription(`» Erhalte diese Ränge auf dem Discord-& Minecraft Server.\n\n> \`🌟\` 𑁉 <@&815921105407574056> (\`${roleCountsupreme}👥\`)\n<:PfeilBlau:1119711275014955080> Bald verfügbar.\n\n> \`⭐\` 𑁉 <@&917826787977871441> (\`${roleCountpremium}👥\`)\n<:PfeilBlau:1119711275014955080> Bald verfügbar.\n\n> \`🔮\` 𑁉 <@&815920452337139733> (\`${roleCountlegende}👥\`)\n<:PfeilBlau:1119711275014955080> Bald verfügbar.\n\n> \`💎\` 𑁉 <@&835775627721179167> (\`${roleCountdiamond}👥\`)\n<:PfeilBlau:1119711275014955080> Bald verfügbar.\n\n> \`👻\` 𑁉 <@&835775556611997697> (\`${roleCountemerald}👥\`)\n<:PfeilBlau:1119711275014955080> Bald verfügbar.\n\n> \`🟣\` 𑁉 <@&835775597446955048> (\`${roleCountepisch}👥\`)\n<:PfeilBlau:1119711275014955080> Bald verfügbar.`)
                        .setColor('Green')
                        .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1262119507451838585/WOC_Banner_Minecraft_Range.png?ex=66956fe3&is=66941e63&hm=f1a3339e9563e54d9eb1290c911cbf31ed72fcbae7babecb67e172080deb8dae&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [spielerEmbed], ephemeral: true })
                } break;

                case 'level': {
                    const hyperaktiv = await interaction.guild.roles.cache.get('1258825307239219371')
                    const roleCounthyperaktiv = hyperaktiv.members.size

                    const ultraaktiv = await interaction.guild.roles.cache.get('1258794321533075526')
                    const roleCountultraaktiv = ultraaktiv.members.size

                    const extremaktiv = await interaction.guild.roles.cache.get('1258825144697360485')
                    const roleCountextremaktiv = extremaktiv.members.size

                    const megaaktiv = await interaction.guild.roles.cache.get('1258794405507240038')
                    const roleCountmegaaktiv = megaaktiv.members.size

                    const starkaktiv = await interaction.guild.roles.cache.get('1258827956634128467')
                    const roleCountstarkaktiv = starkaktiv.members.size

                    const sehraktiv = await interaction.guild.roles.cache.get('1258794479570124920')
                    const roleCountsehraktiv = sehraktiv.members.size

                    const aktiv = await interaction.guild.roles.cache.get('1258794944953319534')
                    const roleCountaktiv = aktiv.members.size

                    const inaktiv = await interaction.guild.roles.cache.get('1258827226846199808')
                    const roleCountinaktiv = inaktiv.members.size

                    const levelEmbed = new EmbedBuilder()
                        .setTitle('`👥` 𑁉 UNSERE LEVEL-ROLLEN')
                        .setDescription(`» Chatte mit **anderen Server-Mitgliedern** oder **unterhalte dich** in unseren Sprachkanälen um **die folgenden Rollen** freizuschalten.\n\n> \`☢️\` 𑁉 <@&1258825307239219371> (\`${roleCounthyperaktiv}👥\`)\n<:PfeilBlau:1119711275014955080> Wir schenken dir einmal <a:basic:1186636165567229972> **DISCORD NITRO BASIC!** <a:basic:1186636165567229972>\n\n> \`🤩\` 𑁉 <@&1258794321533075526> (\`${roleCountultraaktiv}👥\`)\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich **jemand erwähnt!**\n\n> \`⚡️\` 𑁉 <@&1258825144697360485> (\`${roleCountextremaktiv}👥\`)\n<:PfeilBlau:1119711275014955080> **Eine eigene Rolle:** Name + Farbe selbst wählbar!\n\n> \`🥊\` 𑁉 <@&1258794405507240038> (\`${roleCountmegaaktiv}👥\`)\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`💪\` 𑁉 <@&1258827956634128467> (\`${roleCountstarkaktiv}👥\`)\n<:PfeilBlau:1119711275014955080> **Schreibrechte** erhalten in den Kanal: <#1243964646449483788>\n\n> \`👀\` 𑁉 <@&1258794479570124920> (\`${roleCountsehraktiv}👥\`)\n<:PfeilBlau:1119711275014955080> **Umfragen** in **öffentliche** Chats posten\n\n> \`🏃\` 𑁉 <@&1258794944953319534> (\`${roleCountaktiv}👥\`)\n<:PfeilBlau:1119711275014955080> **Dateien** hochladen & **Nicknamen** verändern.\n\n> \`💤\` 𑁉 <@&1258827226846199808> (\`${roleCountinaktiv}👥\`)\n<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden`)
                        .setColor('Orange')
                        .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1262116986335395880/WOC_Banner_Levelsystem.jpg?ex=66956d8a&is=66941c0a&hm=645bcc731bec6f4ec658201f777dccb771ebcd313ea9a34ff51e209c766852ce&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [levelEmbed], ephemeral: true })
                } break;

                case 'exklusiv': {
                    const vip = await interaction.guild.roles.cache.get('862708375698538507')
                    const roleCountvip = vip.members.size

                    const booster = await interaction.guild.roles.cache.get('843013551605284864')
                    const roleCountbooster = booster.members.size

                    const creator = await interaction.guild.roles.cache.get('815920219247214644')
                    const roleCountcreator = creator.members.size

                    const twitchsub = await interaction.guild.roles.cache.get('1067899186542018571')
                    const roleCounttwitchsub = twitchsub.members.size

                    const neuesmitglied = await interaction.guild.roles.cache.get('1222122625594294272')
                    const roleCountneuesmitglied = neuesmitglied.members.size

                    const birthday = await interaction.guild.roles.cache.get('1244945910262399046')
                    const roleCountbirthday = birthday.members.size

                    const unterstützer = await interaction.guild.roles.cache.get('1010105569866174574')
                    const roleCountunterstützer = unterstützer.members.size


                    const exklusiveEmbed = new EmbedBuilder()
                        .setTitle('<a:krone:1112823594649665607> 𑁉 EXKLUSIVE ROLLEN FREISCHALTEN')
                        .setDescription(`» Alle **Rollen in dieser Liste** kannst du nur auf ganz **bestimmer Art und Weise** erhalten, dennoch haben sie **mächtige Vorteile.**\n\n> \`🔮\` 𑁉 <@&843013551605284864> (\`${roleCountbooster}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Booste diesen Server!\n\n<:PfeilBlau:1119711275014955080> **2X XP-Boost** in allen Chats!\n<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`😎\` 𑁉 <@&862708375698538507> (\`${roleCountvip}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`🎥\` 𑁉 <@&815920219247214644> (\`${roleCountcreator}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`💜\` 𑁉 <@&1067899186542018571> (\`${roleCounttwitchsub}👥\`)\n<:Pfeil:1119709908540076124> **Rang Freischalten:** Kaufe dir einen Sub bei [Red3405](https://www.twitch.tv/red340505tv) auf Twitch und erhalte diesen Rang auf unserem Discord Server.\n\n<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`👋\` 𑁉 <@&1222122625594294272> (\`${roleCountneuesmitglied}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Erhält jeder für 24 Stunden nach Beitritt!\n\n<:PfeilBlau:1119711275014955080> Eine **auffallende & besondere** Chat-Farbe & **höher gelistet!**\n\n> \`🎂\` 𑁉 <@&1244945910262399046> (\`${roleCountbirthday}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Heute Geburtstag feiern!\n\n<:PfeilBlau:1119711275014955080> Eine **auffallende & besondere** Chat-Farbe & **höher gelistet!**\n<:PfeilBlau:1119711275014955080> **Zugriff** auf <#1243964646449483788>\n\n> \`💛\` 𑁉 <@&1010105569866174574> (\`${roleCountunterstützer}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** im Status \`discord.gg/woc\` schreiben!\n\n<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!`)
                        .setColor('DarkBlue')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1181732753243381870/WOC_Banner_Exklusive_Rollen.jpg?ex=65949663&is=65822163&hm=72a1632efc783e7be7d34cfc055637a1e344e9b56fd0e6f051b89fd60da868d1&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [exklusiveEmbed], ephemeral: true })
                } break;

                case 'team': {
                    async function getMemberList(roleID) {
                        var liste = ""
                        const role = interaction.guild.roles.cache.find((r) => r.id === roleID);
                        const rolemember = role.members
                        rolemember.forEach(async element => {
                            liste += `<@${element.user.id}> , `
                        });
                        if (liste.length == 0) { return 'Niemand' }
                        return liste.slice(0, -2);
                    }
                    const admin = await interaction.guild.roles.cache.get('959869691529154631')
                    const roleCountadmin = admin.members.size

                    const leitung = await interaction.guild.roles.cache.get('893423428558782465')
                    const roleCountleitung = leitung.members.size

                    const developer = await interaction.guild.roles.cache.get('929349039433056276')
                    const roleCountdeveloper = developer.members.size

                    const srmoderator = await interaction.guild.roles.cache.get('816985466230145044')
                    const roleCountsrmoderator = srmoderator.members.size

                    const moderator = await interaction.guild.roles.cache.get('815920052385480754')
                    const roleCountmoderator = moderator.members.size

                    const supporter = await interaction.guild.roles.cache.get('815920170371383366')
                    const roleCountsupporter = supporter.members.size

                    const teamEmbed = new EmbedBuilder()
                        .setTitle('<a:security:1119708496670232646> 𑁉 UNSER SERVER-TEAM')
                        .setDescription(`» Hier kannst du alle **unsere Team-Ränge** sehen und welche User **aktuell in unserem Server-Team** tätig sind.\n\n> \`🎯\` 𑁉 <@&959869691529154631> (\`${roleCountadmin}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Administration kümmert sich um die ganze Server-Verwaltung, die Organisation und um die Umsetzung neuer Ideen.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(admin.id)}\n\n> \`👨‍✈️\` 𑁉 <@&893423428558782465> (\`${roleCountleitung}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Leitung greifen größtenteils der Administration unter die Arme oder bearbeiten teilweise schon Bewerbungen mit uns.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(leitung.id)}\n\n> \`👨‍💻\` 𑁉 <@&929349039433056276> (\`${roleCountdeveloper}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Developer/Entwickler kümmern sich um die Entwicklung unserer Bots und helfen der Administrator bei der technischen Umsetzung.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(developer.id)}\n\n> \`🕵\` 𑁉 <@&816985466230145044> (\`${roleCountsrmoderator}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Senior-Mod's sind erfahrene Moderatoren und kümmern sich um die Pflege des Support-Teams. Sie agieren als eine Art von "Mentor" und führen neue Teammitglieder ein.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(srmoderator.id)}\n\n> \`👮\` 𑁉 <@&815920052385480754> (\`${roleCountmoderator}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Mods sind wichtige Bestandteile des Teams. Sie kümmern sich um Tickets, Moderation und administrieren kleinere Elemente (wie das Bann-System & Geburtstag ändern).\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(moderator.id)}\n\n> \`🧩\` 𑁉 <@&815920170371383366> (\`${roleCountsupporter}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Supporter sind neu in unserem Team. Sie kümmern sich um Support-Tickets, moderieren den Chat und gewöhnen sich ein.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(supporter.id)}`)
                        .setColor('Red')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1181732690458837083/WOC_Banner_Unser_Server-Team.jpg?ex=65949654&is=65822154&hm=4a077c7d4e3975ee38617cb9b3de6aa8fe7861c9e45c8c3665b2f9b50e045786&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [teamEmbed], ephemeral: true })
                } break;

                case 'bot': {
                    const botEmbed = new EmbedBuilder()
                        .setTitle('`🤖` 𑁉 UNSERE WICHTIGSTEN BOTS')
                        .setDescription('» Hier könnt ihr sehen **welche Aufgaben** unsere **wichtigsten Bots** haben, die speziell **von uns entwickelt** wurden.\n\n> `⚙️` 𑁉 <@1020023299448786955> (Eingeführt am `15.09.2022📝`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Aufgaben dieses Bots sind sehr vielfältig. Wir listen euch einmal die größten Dinge auf.\n\n<:PfeilBlau:1119711275014955080> **Info-& Stats-Kanäle aktuell halten**\n<:PfeilBlau:1119711275014955080> **Ideen-, Spielersuche-& Changelog-System**\n<:PfeilBlau:1119711275014955080> **Bewerbungs-& Rollen-Verwaltung**\n\n> \`🚑\` 𑁉 <@1031487336783028274> (Tickets bearbeitet: `10.000+🎫`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Erstellung, Verwaltung und Organisierung von Tickets.\n\n> \`🎁\` 𑁉 <@1030858684584169612> (Gewinnspiele beendet: `1.000+🎀`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Komplette Verwaltung aller Gewinnspiele.\n\n> \`🤖\` 𑁉 **DIE RESTLICHEN BOTS...**\n<:Pfeil:1119709908540076124> **Aufgaben:** Die restlichen Bots erfüllen nur noch kleine Aufgaben oder werden bald durch einen eigenen Bot von uns ersetzt.')
                        .setColor('Aqua')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1181732786554540183/WOC_Banner_Discord_Bots.jpg?ex=6594966b&is=6582216b&hm=e036aa4455500313ff188c610bdbc1981f0190d78f5e6cde9490b91ad56ecec1&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [botEmbed], ephemeral: true })
                } break;
            }
        }

        // Seite 2
        if (interaction.customId === 'seite-2') {
            const seite2Embed = new EmbedBuilder()
                .setTitle('`🚨` » World Of Community - Server-Regeln (Seite 2)')
                .setDescription('» An diesen Regeln musst du dich jederzeit halten, damit wir eine friedliche Atmosphäre wahren können. Solltest du dies nicht tun, können Sanktionen gegen deinem Account folgen.\n\n───────────────────────── \n\n1️⃣1️⃣ 𑁉 Jegliche Inhalte sind in angemessener Form & Formattierung zu teilen. Dies betrifft zum Beispiel Nicknamen & Nachrichten.\n\n1️⃣2️⃣ 𑁉 Die Verbreitung von Viren oder unerlaubten Clientmodifikationen für Anwendungen ist nicht gestattet.\n\n1️⃣3️⃣ 𑁉 Im Zweifelsfall ist das Team berechtigt nach eigenem Ermessen zu handeln, eine Strafe muss nicht anhand einer Regel gerechtfertigt sein.\n\n1️⃣4️⃣ 𑁉 Das Ausnutzen von Bot-Systemen (Support, Server-Ideen, o.ä.) ist untersagt, um unsere Arbeit nicht zu behindern.\n\n 1️⃣5️⃣ 𑁉 Unterhaltungen sollten immer auf Deutsch (gelegentlich auf Englisch) geführt werden, damit unser Team alle Konversationen nachvollziehen kann.\n\n1️⃣6️⃣ 𑁉 Unwissenheit schützt nicht vor einer Strafe. Allerdings hast du das Recht, einen Antrag auf Entsperrung bei uns einzureichen.')
                .setColor('#c53a2b')
                .setImage('https://cdn.discordapp.com/attachments/943859953318371359/1045406350903095357/WOC_Server_Regeln.png')

            const regelButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('verifizieren')
                        .setLabel('✅ » Verifizieren')
                        .setStyle(ButtonStyle.Success)
                )
            await interaction.reply({ embeds: [seite2Embed], components: [regelButton], ephemeral: true })
        }

        // Verifizierung
        if (interaction.customId === 'verifizieren') {
            const rndNumber = Math.floor(Math.random() * 999) + 1000
            let verifyNumber = rndNumber.toString()
            const verifyModal = new ModalBuilder()
                .setTitle('Verifiziere dich!')
                .setCustomId('verify-modal');

            const verifyInput = new TextInputBuilder()
                .setCustomId('verifyInput')
                .setLabel(`Dein Verifizierungscode: ${verifyNumber}`)
                .setMinLength(4)
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(verifyInput);
            verifyModal.addComponents(row);
            await interaction.showModal(verifyModal).then(async msg => {
                await interaction.client.on('interactionCreate', async (inter) => {
                    if (inter.customId === 'verify-modal') {
                        const input = await inter.fields.getTextInputValue('verifyInput')

                        if (input !== verifyNumber) {
                            await await inter.reply({ content: '> \`❌\` » Dieser Verifizierungscode war falsch, Bitte versuche es erneut.', ephemeral: true })
                        }
                        if (input === verifyNumber) {
                            await inter.member.roles.add(config.verifyRolle)
                            await await inter.reply({ content: `> \`✅\` » Die Verifizierung war **erfolgreich**, du hast die <@&${config.verifyRolle}>-Rolle bekommen. Viel Spaß auf dem Server.`, ephemeral: true })
                        }
                    }
                });
            });
        }

        const roleId = '1242417592530894848';

        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
        
        if (commandName === 'bump') {
            const role = interaction.guild.roles.cache.get(roleId); // Rolle anhand der ID finden
            if (!role) return interaction.reply({ text: `> \`❗\` »  Die Rolle existiert nicht.`, ephemeral: true });

            const member = interaction.member;

            try {
                await member.roles.add(role);
                await interaction.reply(`> \`✅\` » Du hast die Rolle ${role} für **2 Stunden** erhalten!`);

                // Entferne die Rolle nach 2 Stunden (7200000 ms)
                setTimeout(async () => {
                    await member.roles.remove(role);
                    member.send({ text: `> \`❗\` » Deine Rolle ${role} ist gerade abgelaufen (Du hattest die Rolle für: \`2 Stunden\`)`, ephemeral: true })
                }, 7200000);
            } catch (error) {
                console.error(error);
                interaction.reply({ text: '> `❗` » Es gab einen Fehler beim Zuweisen der Rolle.', ephemeral: true });
            }
        }
        
        // Bann Button
         if (interaction.isButton()) {
            if(interaction.customId === 'ticket_erledigt') {
                const mention = interaction.message.content
                const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription("Danke für deine Meldung, wir haben es erledigt oder in Bearbeitung genommen.")
                
                interaction.reply({ content: mention, embeds: [embed] })
            }
            else if(interaction.customId === 'ticket_close_deny') {
                const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`${interaction.user} hat sich dazu entschieden nicht das Ticket zu schließen`)
                
                interaction.update({ embeds: [embed], components: [] })
            }
            else if(interaction.customId === 'ticket_close_accept') {
                const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Das Ticket wird in \`5 Sekunden\` geschlossen.`)
                
                interaction.update({ embeds: [embed], components: [] })
                setTimeout(async () => {
                    await interaction.channel.delete();
                }, 5000);
            }
            else if(interaction.customId === 'ticket_schliessen') {
                const mention = interaction.message.content
                const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle("Schließ Anfrage")
                .setDescription(`${interaction.user} hat das Schließen dieses Tickets angefordert.\n\nBitte akzeptiere oder verweigere mit den untenstehenden Schaltflächen.`)
                
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('ticket_close_accept')
                        .setLabel('✅ » Akzeptieren & Schließen')
                        .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                        .setCustomId('ticket_close_deny')
                        .setLabel('❌ » Ablehnen & Offen lassen')
                        .setStyle(ButtonStyle.Secondary)
                    )
                
                interaction.reply({ content: mention, embeds: [embed], components: [buttons] })
            }
            else if (interaction.customId === 'bann-ticket') {
                const bannModal = new ModalBuilder()
                .setTitle('⛔ - ENTBANNUNGSTICKET')
                .setCustomId('bann-modal');

                const BanngrundInput = new ActionRowBuilder().addComponents(
                   new TextInputBuilder() 
                    .setCustomId('banngrund')
                    .setLabel('Gebe deinen Banngrund an')
                    .setPlaceholder('Wieso wurdest du gebannt?')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                )

                const EntbannungsbeschreibungInput = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                    .setCustomId('entbannungsbeschreibung')
                    .setLabel('Wieso möchtest du wieder Entbannt werden?')
                    .setPlaceholder('Gebe hier deine Entbannungsbeschreibung an.')
                    .setMinLength(5)
                    .setMaxLength(4000)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                )

                bannModal.addComponents(BanngrundInput, EntbannungsbeschreibungInput);

                await interaction.showModal(bannModal)
            }
        }
        
        if (interaction.isModalSubmit()) {
            if(interaction.customId === "bann-modal") {
                const bannInfo = await interaction.fields.getTextInputValue('banngrund');
                const bannDescription = await interaction.fields.getTextInputValue('entbannungsbeschreibung');
                
                interaction.guild.channels.create({
                    name: `unban-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: "886985648714682439",
                    
                }).then(async channel => {
                    const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setCustomId('ticket_erledigt')
                        .setLabel('Erledigt')
                        .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                        .setCustomId('ticket_schliessen')
                        .setLabel('Schließen')
                        .setStyle(ButtonStyle.Danger)
                    )
                    
                    const bannsupport = await interaction.guild.roles.cache.get('1209101841015504916')
                        
                    const bannEmbed = new EmbedBuilder()
                    .setTitle("Entbannungsantrag")
                    .setDescription("Es wurde erfolgreich ein Ticket für einen Entbannungsantrag erstellt. Hier sind einige Infos:")
                    .setColor("Red")
                    .addFields(
                        {
                        	name: "Banngrund-Info",
                            value: `\`${bannInfo}\``
                    	},
                        {
                            name: "Entbannungs-Beschreibung",
                            value: `\`${bannDescription}\``
                        }
                    )
                    channel.send({ content: `${interaction.user} | <@&${bannsupport.id}>`, embeds: [bannEmbed], components: [buttons] }).then(async msg => {
                        interaction.reply({ content: `Du hast **erfolgreich** ein Ticket für deinen Entbannungsantrag erstellt, du kannst diesen **[hier](${msg.url})** finden.`, ephemeral: true })
                    })
                })
            }}
        
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "partner-modal") {
                const partnerName = await interaction.fields.getTextInputValue('partner-name');
                const partnerBeschreibung = await interaction.fields.getTextInputValue('partner-beschreibung');

                const channel = await interaction.client.channels.fetch("1187028500461391984")

                await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('`🤝` » NEUE SERVER PARTNER ANFRAGE')
                            .setDescription(`${interaction.user} möchte sich als **Server-Partner** bewerben!\n\n> \`🔗\` » **Server-Link**\n\`${partnerName}\`\n\n> \`💬\` » **Server-Beschreibung**\n\`${partnerBeschreibung}\``)
                            .setColor("Orange")
                    ],
                    components: [
                        new ActionRowBuilder()
                            .addComponents(
                                new ButtonBuilder()
                                    .setCustomId(`partner_accept_${interaction.user.id}`)
                                    .setLabel("Akzeptieren")
                                    .setStyle(ButtonStyle.Success),
                                new ButtonBuilder()
                                    .setCustomId(`partner_deny_${interaction.user.id}`)
                                    .setLabel("Ablehnen")
                                    .setStyle(ButtonStyle.Danger)
                            )
                    ]
                })
                await interaction.reply({ content: "> `✅` » Deine Anfrage wurde abgesendet, Bitte habe etwas Geduld!", ephemeral: true })
            }
        }
        
        if (interaction.isButton()) {
            if (interaction.customId === 'partner') {
                const partnerModal = new ModalBuilder()
                    .setTitle('🤝 - BEWERBEN ALS PARTNER')
                    .setCustomId('partner-modal');
    
                const partnernameInput = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('partner-name')
                        .setLabel('🔗 - WIE IST DER EINLADUNGSLINK DES SERVERS?')
                        .setPlaceholder('https://discord.gg/VxhFXjkrPW')
                        .setStyle(TextInputStyle.Short)
                        .setRequired(true)
                )
    
                const partnerbeschreibungInput = new ActionRowBuilder().addComponents(
                    new TextInputBuilder()
                        .setCustomId('partner-beschreibung')
                        .setLabel('✍️ - BESCHREIBUNG DES SERVERS')
                        .setPlaceholder('Wir sind ein allgemeiner Deutscher Discord Server mit Gaming, Community und vielem mehr!')
                        .setMinLength(25)
                        .setMaxLength(500)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                )
    
                partnerModal.addComponents(partnernameInput, partnerbeschreibungInput);
    
                await interaction.showModal(partnerModal);
            }
            if (interaction.customId.startsWith("partner_accept_")) {
                const list = await interaction.customId.split("_")
                const id = list[2]
                const user = await interaction.client.users.fetch(id)
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("`✅` » ANFRAGE ANGENOMMEN")
                            .setDescription(`> » Deine Server-Partner Bewerbung auf **[${interaction.guild.name}](https://discord.gg/686M8Cxsaa)** wurde angenommen.\n\n> Bitte Öffne noch ein Ticket und wähle \`Normaler Support\` aus.`)
                            .setColor("Green")
                    ]
                })
                await interaction.message.edit({ components: [] })
                await interaction.reply(`> \`❗\` » Die Server-Partner Anfrage wurde von **${interaction.user.displayName}** angenommen. \`✅\``)

            }

            if (interaction.customId.startsWith("partner_deny_")) {
                const list = await interaction.customId.split("_")
                const id = list[2]
                const user = await interaction.client.users.fetch(id)
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("`❌` » ANFRAGE ABGELEHNT")
                            .setDescription(`> » Deine Server-Partner Bewerbung auf **${interaction.guild.name}** wurde abgelehnt. \`❌\``)
                            .setColor("Red")
                    ]
                })
                await interaction.message.edit({ components: [] })
                await interaction.reply(`> \`❗\` » Die Server-Partner Anfrage wurde von **${interaction.user.displayName}** abgelehnt.`)
            }

            if(interaction.customId === "vorschlag_accept") {
                const modal = new ModalBuilder()
                .setCustomId("acceptreason")
                .setTitle("✅〡Aktzeptieren");
          
              const textInputAccept = new TextInputBuilder()
                .setCustomId("grund")
                .setLabel("» Grund")
                .setPlaceholder("Wir haben uns dein Vorschlag...")
                .setMaxLength(60)
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
          
          
              modal.addComponents(new ActionRowBuilder().addComponents(textInputAccept));
          
              await interaction.showModal(modal).then(async msg => {
                await interaction.client.once('interactionCreate', async (inter) => {
                    if (inter.customId === 'acceptreason') {
                        const channel = inter.channel
                                const message = await inter.channel.fetchStarterMessage();
                                const grund = inter.fields.getTextInputValue("grund")
                                const vorschlagsembed = message.embeds[0];

                                const embed = new EmbedBuilder()
                                embed.setColor("Green")
                                embed.setTitle(vorschlagsembed.title)
                                embed.setDescription(vorschlagsembed.description)
                                embed.setAuthor({ name: `» Aktzeptiert von ${inter.member.user.tag}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                                embed.addFields([
                                    {
                                        name: "`🚪` » **Status**",
                                        value: "› Dieser Vorschlag wurde vom Team akzeptiert.\n**Grund:** `" + grund +"`"
                                    }
                                ]
                                )
                                embed.setFooter(vorschlagsembed.footer);
                                await message.edit({ embeds: [embed], components: [] });
                            
                                channel.setLocked(true)

                                await inter.reply({
                                    content: "`✅` » Der Vorschlag wurde angenommen",
                                    ephemeral: true,
                                });
                            }
                        })
                })
            }
            if(interaction.customId === "vorschlag_edit") {
                const modal = new ModalBuilder()
                .setCustomId("editreason")
                .setTitle("⚙️〡In Planung");
          
              const textInputAccept = new TextInputBuilder()
                .setCustomId("grund")
                .setLabel("» Grund")
                .setMaxLength(60)
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
          
          
              modal.addComponents(new ActionRowBuilder().addComponents(textInputAccept));
    
              await interaction.showModal(modal).then(async msg => {
                await interaction.client.once('interactionCreate', async (inter) => {
                    if (inter.customId === 'editreason') {
                        const channel = inter.channel
                                const message = await inter.channel.fetchStarterMessage();
                                const grund = inter.fields.getTextInputValue("grund")
                                const vorschlagsembed = message.embeds[0];

                                const embed = new EmbedBuilder()
                                embed.setColor("Grey")
                                embed.setTitle(vorschlagsembed.title)
                                embed.setDescription(vorschlagsembed.description)
                                embed.setAuthor({ name: `» Bearbeitet von ${inter.member.user.tag}`, iconURL: inter.member.user.displayAvatarURL(), url: `https://discordapp.com/users/${inter.member.user.id}` })
                                embed.addFields([
                                    {
                                        name: "`🚪` » **Status**",
                                        value: "› Dieser Vorschlag ist bereits in Planung und wird bald umgesetzt.\n**Grund:** `" + grund +"`"
                                    }
                                ]
                                )
                                embed.setFooter(vorschlagsembed.footer);
                                await message.edit({ embeds: [embed], components: [] });
                            
                                channel.setLocked(true)

                                await inter.reply({
                                    content: "`✅` » Der Vorschlag wurde in Planung gesetzt.",
                                    ephemeral: true,
                                });
                            }
                        })
                })
            }
            if(interaction.customId === "vorschlag_delice") {
                const modal = new ModalBuilder()
                .setCustomId("delicereason")
                .setTitle("❌〡Ablehnen");
          
              const textInputAccept = new TextInputBuilder()
                .setCustomId("grund")
                .setLabel("» Grund")
                .setPlaceholder("Existiert schon")
                .setMaxLength(60)
                .setRequired(true)
                .setStyle(TextInputStyle.Short);
          
          
              modal.addComponents(new ActionRowBuilder().addComponents(textInputAccept));
          
              await interaction.showModal(modal).then(async msg => {
                await interaction.client.once('interactionCreate', async (inter) => {
                    if (inter.customId === 'delicereason') {
                    const channel = inter.channel
                    const message = await inter.channel.fetchStarterMessage();
                    const grund = inter.fields.getTextInputValue("grund")
                    const vorschlagsembed = message.embeds[0];
                
                    const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle(vorschlagsembed.title)
                    .setDescription(vorschlagsembed.description)
                    .setAuthor({
                      name: `» Abgelehnt von ${inter.member.user.tag}`,
                      iconURL: inter.member.user.displayAvatarURL(),
                      url: `https://discordapp.com/users/${inter.member.user.id}`,
                    })
                    .addFields([
                      {
                          name: "`🚪` » **Status**",
                          value: "» Dieser Vorschlag wurde vom Team abgelehnt.\n**Grund:** `" + grund +"`"
                      }
                    ])
                    embed.setFooter(vorschlagsembed.footer);
                    await message.edit({ embeds: [embed], components: [] });
                
                    channel.setLocked(true)
            
                    await inter.reply({
                        content: "`✅` »  Der Vorschlag wurde abgelehnt",
                        ephemeral: true,
                      });
                    }
                })
                })
            }}

        if(interaction.isChatInputCommand()) {

        const command = client.commands.get(interaction.commandName)

        if (command) {
            try {
                await command.execute(interaction)
            } catch (error) {
                console.error(error)

                if (interaction.deferred || interaction.replied) {
                    interaction.editReply({content: "> `❌` » Es ist ein Fehler beim ausführen aufgetreten!"})
                }
                else {
                    interaction.reply({content: "> `❌` » Es ist ein Fehler beim ausführen aufgetreten!", ephemeral: true})
                }
            }
        }
        } else if (interaction.isAutocomplete()) {
                const command = interaction.client.commands.get(interaction.commandName);
              
                if(!command) return;
              
                try {
                  await command.autocomplete(interaction);
                } catch (error) {
                  console.error(error);
                }
        }
    }
}