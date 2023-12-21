const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
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
                        .setColor('#ff7300')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779095284748408/WOC_Banner_Server_Erfolge.png')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [serverEmbed], ephemeral: true })
                } break;

                case 'spieler': {
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

                    const mitglied = await interaction.guild.roles.cache.get('815920703067914290')
                    const roleCountmitglied = mitglied.members.size

                    const spielerEmbed = new EmbedBuilder()
                        .setTitle('`👥` 𑁉 UNSERE MITGLIEDER-ROLLEN')
                        .setDescription(`» Du kannst **Kostenlos** die Epische-Rolle nach **2 Wochen** Onlinezeit dir Freischalten oder andere höhere Mitglieder-Rollen durch eine Spende oder durch Gewinnspiele erhalten.\n\n> \`🌟\` 𑁉 <@&815921105407574056> (\`${roleCountsupreme}👥\`)\n<:PfeilBlau:1119711275014955080> **Alle Features** von <@&917826787977871441>\n<:PfeilBlau:1119711275014955080> Wir schenken dir einmal <a:basic:1186636165567229972> **DISCORD NITRO BASIC!** <a:basic:1186636165567229972>\n\n> \`⭐\` 𑁉 <@&917826787977871441> (\`${roleCountpremium}👥\`)\n<:PfeilBlau:1119711275014955080> **Alle Features** von <@&815920452337139733>\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`🔮\` 𑁉 <@&815920452337139733> (\`${roleCountlegende}👥\`)\n<:PfeilBlau:1119711275014955080> **Alle Features** von <@&835775556611997697>\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich **jemand erwähnt!**\n\n> \`👻\` 𑁉 <@&835775556611997697> (\`${roleCountemerald}👥\`)\n<:PfeilBlau:1119711275014955080> **Alle Features** von <@&835775627721179167>\n<:PfeilBlau:1119711275014955080> **Schreibrechte** erhalten in dem Kanal: <#1172920374892183592>\n\n> \`💎\` 𑁉 <@&835775627721179167> (\`${roleCountdiamond}👥\`)\n<:PfeilBlau:1119711275014955080> **Alle Features** von <@&835775597446955048>\n<:PfeilBlau:1119711275014955080> **Dateien** hochladen & **Nicknamen** verändern.\n\n> \`🟣\` 𑁉 <@&835775597446955048> (\`${roleCountepisch}👥\`)\n<:PfeilBlau:1119711275014955080> **Alle Features** von <@&815920703067914290>\n<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einbetten.\n\n> \`👥\` 𑁉 <@&815920703067914290> (\`${roleCountmitglied}👥\`)\n<:PfeilBlau:1119711275014955080> **Standard-Rolle** auf dem Server.`)
                        .setColor('Grey')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1145779427477827614/WOC_Spieler_Range.png')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [spielerEmbed], ephemeral: true })
                } break;

                case 'exklusive': {
                    const vip = await interaction.guild.roles.cache.get('862708375698538507')
                    const roleCountvip = vip.members.size

                    const booster = await interaction.guild.roles.cache.get('843013551605284864')
                    const roleCountbooster = booster.members.size

                    const creator = await interaction.guild.roles.cache.get('815920219247214644')
                    const roleCountcreator = creator.members.size

                    const twitchsub = await interaction.guild.roles.cache.get('1067899186542018571')
                    const roleCounttwitchsub = twitchsub.members.size

                    const unterstützer = await interaction.guild.roles.cache.get('1010105569866174574')
                    const roleCountunterstützer = unterstützer.members.size


                    const exklusiveEmbed = new EmbedBuilder()
                        .setTitle('<a:krone:1112823594649665607> 𑁉 EXKLUSIVE ROLLEN FREISCHALTEN')
                        .setDescription(`» Alle **Ränge in dieser Liste** kannst du nur auf ganz **bestimmter Art und Weise** erhalten, dennoch haben sie **mächtige Vorteile.**\n\n> \`🔮\` 𑁉 <@&843013551605284864> (\`${roleCountbooster}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Booste diesen Server!\n\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`😎\` 𑁉 <@&862708375698538507> (\`${roleCountvip}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n<:PfeilBlau:1119711275014955080>  **Fremde Emojis** verwenden & **Links** einbetten.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`🎥\` 𑁉 <@&815920219247214644> (\`${roleCountcreator}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`💜\` 𑁉 <@&1067899186542018571> (\`${roleCounttwitchsub}👥\`)\n<:Pfeil:1119709908540076124> **Rang Freischalten:** Kaufe dir einen Sub bei [Red3405](https://www.twitch.tv/red340505tv) auf Twitch und erhalte diesen Rang auf unserem Discord Server.\n\n<:PfeilBlau:1119711275014955080>  **Fremde Emojis** verwenden & **Links** einbetten.\n<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n> \`💛\` 𑁉 <@&1010105569866174574> (\`${roleCountunterstützer}👥\`)\n<:Pfeil:1119709908540076124> **Rang freischalten:** im Status \`discord.gg/woc\` schreiben!\n\n<:PfeilBlau:1119711275014955080>  **Fremde Emojis** verwenden & **Links** einbetten.\n<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!`)
                        .setColor('#105f93')
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
                        .setDescription(`» Hier kannst du alle **unsere Team-Ränge** sehen und welche User **aktuell in unserem Server-Team** tätig sind.\n\n> \`🎯\` 𑁉 <@&959869691529154631> (\`${roleCountadmin}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Administration kümmert sich um die ganze Server-Verwaltung, die Organisation und um die Umsetzung neuer Ideen.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(admin.id)}\n\n> \`👨‍✈️\` 𑁉 <@&893423428558782465> (\`${roleCountleitung}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Leitung greifen größtenteils der Administration unter die Arme oder bearbeiten teilweise schon Bewerbungen mit uns.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(leitung.id)}\n\n> \`👨‍💻\` 𑁉 <@&929349039433056276> (\`${roleCountdeveloper}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Developer/Entwickler kümmern sich um die Entwicklung unserer Bots und helfen der Administrator bei der technischen Umsetzung.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(developer.id)}\n\n> \`🕵\` 𑁉 <@&816985466230145044> (\`${roleCountsrmoderator}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Senior-Mod's sind erfahrene Moderatoren und kümmern sich um die Pflege des Support-Teams. Sie agieren als eine Art von "Mentor" und führt neue Teammitglieder ein.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(srmoderator.id)}\n\n> \`👮\` 𑁉 <@&815920052385480754> (\`${roleCountmoderator}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Mods sind wichtige Bestandteile des Teams. Sie kümmern sich um Tickets, Moderation und administrieren kleinere Elemente (wie das Bann-System).\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(moderator.id)}\n\n> \`🧩\` 𑁉 <@&815920170371383366> (\`${roleCountsupporter}👥\`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Supporter sind neu in unserem Team. Sie kümmern sich um Support-Tickets, moderieren den Chat und gewöhnen sich ein.\n<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(supporter.id)}`)
                        .setColor('#ff2600')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1181732690458837083/WOC_Banner_Unser_Server-Team.jpg?ex=65949654&is=65822154&hm=4a077c7d4e3975ee38617cb9b3de6aa8fe7861c9e45c8c3665b2f9b50e045786&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [teamEmbed], ephemeral: true })
                } break;

                case 'bot': {
                    const botEmbed = new EmbedBuilder()
                        .setTitle('`🤖` 𑁉 UNSERE WICHTIGSTEN BOTS')
                        .setDescription('» Hier könnt ihr sehen **welche Aufgaben** unsere **wichtigsten Bots** haben, die speziell **von uns entwickelt** wurden.\n\n> `⚙️` 𑁉 <@1020023299448786955> (Eingeführt am `15.09.2022📝`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Die Aufgaben dieses Bots sind sehr vielfältig. Wir listen euch einmal die größten Dinge auf.\n\n<:PfeilBlau:1119711275014955080> **Info-& Stats-Kanäle aktuell halten**\n<:PfeilBlau:1119711275014955080> **Ideen-, Spielersuche-& Changelog-System**\n<:PfeilBlau:1119711275014955080> **Bewerbungs-& Rollen-Verwaltung**\n\n> \`🚑\` 𑁉 <@1031487336783028274> (Tickets bearbeitet: `10.000+🎫`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Erstellung, Verwaltung und Organisierung von Tickets.\n\n> \`🎁\` 𑁉 <@1030858684584169612> (Gewinnspiele beendet: `1.000+🎀`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Komplette Verwaltung aller Gewinnspiele.\n\n> \`✅\` 𑁉 <@1031487617193226300> (Verifiziert: `100+🌍`)\n<:Pfeil:1119709908540076124> **Aufgabe:** Verifizierung von Discord & Minecraft Account auf dem Server-Netzwerk.\n\n> \`🤖\` 𑁉 **DIE RESTLICHEN BOTS...**\n<:Pfeil:1119709908540076124> **Aufgaben:** Die restlichen Bots erfüllen nur noch kleine Aufgaben oder werden bald durch einen eigenen Bot von uns ersetzt.')
                        .setColor('#318c86')
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
                .setTitle('<:PointRed:1123612255800524940> » World Of Community - Regelwerk (Seite 2)')
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

        
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "partner-modal") {
                const partnerName = await interaction.fields.getTextInputValue('partner-name');
                const partnerBeschreibung = await interaction.fields.getTextInputValue('partner-beschreibung');

                const channel = await interaction.client.channels.fetch("1187028500461391984")

                await channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(`${interaction.user} möchte sich als Partner bewerben!
                
> **Server-Link**
\`${partnerName}\`

> **Server-Beschreibung**
\`${partnerBeschreibung}\``)
                            .setColor("Blue")
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
                await interaction.reply({ content: "Deine Anfrage wurde abgesendet!", ephemeral: true })


            }
        }
        if (interaction.isButton()) {

            if (interaction.customId === 'partner') {
                const partnerModal = new ModalBuilder()
                    .setTitle('BEWERBEN ALS PARTNER')
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
                        .setStyle(TextInputStyle.Short)
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
                            .setTitle("Anfrage angenommen")
                            .setDescription("Deine Partnerbewerbung auf WOC wurde angenommen.")
                            .setColor("Green")
                    ]
                })
                await interaction.message.edit({ components: [] })
                await interaction.reply("Anfrage angenommen!")

            }

            if (interaction.customId.startsWith("partner_deny_")) {
                const list = await interaction.customId.split("_")
                const id = list[2]
                const user = await interaction.client.users.fetch(id)
                await user.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Anfrage abgelehnt")
                            .setDescription("Deine Partnerbewerbung auf WOC wurde abgelehnt.")
                            .setColor("Red")
                    ]
                })
                await interaction.message.edit({ components: [] })
                await interaction.reply("Anfrage abgelehnt!")


            }
        }

        if (!interaction.isCommand()) return

        const command = client.commands.get(interaction.commandName)

        if (command) {
            try {
                await command.execute(interaction)
            } catch (error) {
                console.error(error)

                if (interaction.deferred || interaction.replied) {
                    interaction.editReply("Es ist ein Fehler beim ausführen aufgetreten!")
                }
                else {
                    interaction.reply("Es ist ein Fehler beim ausführen aufgetreten!")
                }
            }
        }
    }
}