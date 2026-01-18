const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("send-embed")
        .setDescription('» Hier können die verschienden Embeds gesendet werden. 📋')
        .addStringOption(option => option.setName('embed').setDescription('Welches Embed?').setRequired(true)
        .addChoices(
            { name: 'Ränge Info (Rollen Info)', value: 'ränge-info' }, 
            { name: 'Regelwerk (Server-regeln)', value: 'regelwerk' }, 
            { name: 'Partner (Partner werden)', value: 'partner' }, 
            { name: 'Bann-Bereich Embed (Gebannt)', value: 'gebannt' },
            { name: 'SeasonPass (SeasonPass)', value: 'seasonpass' }
        ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const embedType = interaction.options.getString('embed');

        if (embedType === 'ränge-info') {
            const channel = interaction.guild.channels.cache.get("872063101640532008"); // Channel ID
            const msg = await channel.messages.fetch("1260234136665194567"); // Nachricht ID

            const rängeEmbed = new EmbedBuilder()
                .setTitle('`🏆` 𑁉 ERHALTE NEUE RÄNGE & VORTEILE!')
                .setDescription('<:Pfeil:1119709908540076124> Jeder Rang hat seine eigenen Vorteile und seine eigene Art und Weise wie man diesen erhalten kann.\n\n`🏆` - **WELCHE VORTEILE GIBT ES?**\n<:Pfeil:1119709908540076124> Sie sind sehr **zahlreich:** von Discord-Nitro Basic, bis hin zu einem **Ping-Emoji für Nachrichten** auf unserem Discord-Server!\n\n- `⭐` **Server-Erfolge:** Diese sind nur für das Sammeln gedacht und bieten keine direkten Vorteile\n- `🏆` **Level-Rollen:** Sei ein aktives Mitglied und steige dadurch **neue Level auf** - dadurch erhältst du viele Vorteile!\n- `💎` **Exklusive Rollen:** Jeder Rang aus dieser Liste hat einen eigenen Weg um freigeschaltet zu werden!\n\n`❓` - **WELCHE ROLLEN BESITZT IHR?**\n<:Pfeil:1119709908540076124> `📌` » Klicke auf das **untere Menü** um alle Rollen zu sehen!\n<:Pfeil:1119709908540076124> `🚑` » Öffne ein Ticket im Support bei Fragen oder Problemen.')
                .setColor('Orange')
                .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1181151183314898944/WOC_Banner_Rollen_Information.jpg?ex=662620c2&is=6613abc2&hm=e50bf7e18d53287338fa0f2db99b156eba265188edd269f026226ec091f192b0&')
                .setFooter({ text: 'Klicke auf eine Kategorie, um dir die Rollen anzusehen!', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })

            const rängeMenu = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('ränge-menu')
                        .setPlaceholder('📚 » ROLLEN - INFORMATIONEN')
                        .addOptions(
                            {
                                label: '× SERVER - ERFOLGE',
                                description: '» Erhalte einzigartige Erfolge. ⭐',
                                emoji: '<a:wocstar:1260236276758478950>',
                                value: 'server',
                            },
                            {
                                label: '× MINECRAFT - RÄNGE',
                                description: '» Erhalte einzigartige Ränge. 🌍',
                                emoji: '<a:MinecraftGrassBlock:872034424181637171>',
                                value: 'minecraft',
                            },
                            {
                                label: '× LEVEL - ROLLEN',
                                description: '» Hier sind Alle Level-Rollen aufgelistet. 🏆',
                                emoji: '<a:trophe:1112823561992818859>',
                                value: 'level',
                            },
                            {
                                label: '× EXKLUSIVE - ROLLEN',
                                description: '» Besondere Rollen mit besonderen Vorteilen. 👑',
                                emoji: '<a:krone:1112823594649665607>',
                                value: 'exklusiv',
                            },
                            {
                                label: '× TEAM - ROLLEN',
                                description: '» Schau dir unser Server-Team an. 🚨',
                                emoji: '<:StaffAbzeichen:1056602972789948466>',
                                value: 'team',
                            },
                            {
                                label: '× BOT - ROLLEN',
                                description: '» Sieh dir die Aufgaben unserer Bots an. 🤖',
                                emoji: '<a:pin:1112823671363473468>',
                                value: 'bot',
                            },
                        )
                )
            await msg.edit({ embeds: [rängeEmbed], components: [rängeMenu] })

        } else if (embedType === 'regelwerk') {
            const channel = interaction.guild.channels.cache.get("815922286502346773"); // Channel ID
            const msg = await channel.messages.fetch("1151068177845977148"); // Nachricht ID

            const regelwerkEmbed = new EmbedBuilder()
                .setTitle('`🚨` » World Of Community - Server-Regeln')
                .setDescription(
                    '» An diesen Regeln musst du dich jederzeit halten, damit wir eine friedliche Atmosphäre wahren können. Solltest du dies nicht tun, können Sanktionen gegen deinem Account folgen.\n\n' +
                    '<:Pfeil:1119709908540076124> **Bei der Nutzung dieses Discord Servers bist du automatisch mit den Regeln einverstanden.**\n\n' +
                    '─────────────────────────\n\n' +
                    '1️⃣ 𑁉 Behandle alle Mitglieder stets respektvoll. Wir tolerieren keine Streitigkeiten oder andere toxischen Inhalte im Chat!\n\n' +
                    '2️⃣ 𑁉 NSFW-Inhalte (Nacktheit, Gewalt & mehr) können verstörend auf Mitglieder wirken und sind daher untersagt.\n\n' +
                    '3️⃣ 𑁉 Übersteuerte Geräusche & flackernde Emojis sind verboten, da sie das Wohlempfinden beeinträchtigen können.\n\n' +
                    '4️⃣ 𑁉 Werbung ist nur in den dazugehörigen Textkanälen gestattet, um unsere Mitglieder nicht unnötig zu nerven.\n\n' +
                    '5️⃣ 𑁉 Spam jeglicher Art (Doppelte Nachrichten, Channelhopping & u.ä.) ist aufgrund von Levelvorteilen verboten.\n\n' +
                    '6️⃣ 𑁉 Das Ausgeben von andere Nutzer, Mitglieder oder Teammitglieder ist untersagt und führt zur Sperrung.\n\n' +
                    '7️⃣ 𑁉 Postet auf keinen Fall irgendwelche privaten Adressen oder Telefonnummern in den Öffentlichen Chat, egal ob von euch oder jemand anderen.\n\n' +
                    '8️⃣ 𑁉 Unwissenheit schützt nicht vor einer Strafe. Allerdings hast du das Recht, einen Antrag auf Entsperrung bei uns einzureichen.\n\n' +
                    '9️⃣ 𑁉 Das Betteln um Ränge oder Berechtigungen ist ebenfalls untersagt.\n\n' +
                    '🔟 𑁉 Stimmverzerrer oder Soundboards sind nur gestattet, wenn dies ein Teammitglied erlaubt.'
                )
                .setColor('Red')
                .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340748256514153/WOC_Banner_Server-Regeln.png?ex=66c575f1&is=66c42471&hm=e9b95fe842b4290f67f9802066feafbf86d7d9270f437b589858621e26ec5b73&')
                .setFooter({ text: 'Du erklärst dich mit diesen Regeln bei der Nutzung unseres Discord-Servers einverstanden.', iconURL: 'https://media.discordapp.net/attachments/943859953318371359/1055943224092532846/WOC_Orange.png' })

            const regelButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('seite-2')
                        .setLabel('📚 » Nächste Seite')
                        .setStyle(ButtonStyle.Danger)
                )
            await msg.edit({ embeds: [regelwerkEmbed], components: [regelButton] })

        } else if (embedType === 'partner') {
            const channel = interaction.guild.channels.cache.get("1172819623935221810"); // Channel ID
            const msg = await channel.messages.fetch("1187070677073801268"); // Nachricht ID

            const partnerEmbed = new EmbedBuilder()
                .setDescription(
                    '# `👥` - **SO WIRST DU EIN PARTNER!**\n' +
                    'Ein **Server-Partner** von uns zu sein ist eine **einmalige Möglichkeit**, um eine **riesige Auswahl an Usern** zu erreichen.\n\n' +
                    '# `🔥` ᕁ **WAS SIND DIE BEDINGUNGEN?**\n\n' +
                    '<:Pfeil:1119709908540076124> Um ein Partner zu werden, musst du die **unteren Voraussetzungen** erfüllen, damit du dich bewerben kannst.\n\n' +
                    '- `👥` » Mindestens **100 Server-Mitglieder** besitzen!\n' +
                    '- `💬` » Hält <#815922286502346773> und die **[Discord ToS](https://discord.com/terms)** ein!\n' +
                    '- `💖` » Ist ein **vollständiger deutscher Discord-Server**!\n' +
                    '- `📢` » Muss unserem <#1177536720229650442> Kanal **folgen**!\n' +
                    '# `📡` ᕁ **WAS SIND DIE VORTEILE?**\n' +
                    '<:Pfeil:1119709908540076124> Wir veranstalten regelmäßig Events um die Server unserer Partner noch etwas bekannter zu machen.'
                )
                .setColor('Blurple')
                .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269341195310469200/WOC_Partner_werden_Banner.png?ex=66c5765c&is=66c424dc&hm=32f98edaa2aa32418c879199d7fe5f03562fbace9b105396d6df475005cf4674&')

            const partnerButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('partner')
                        .setLabel('✅ » Als Partner bewerben')
                        .setStyle(ButtonStyle.Success)
                )
            await msg.edit({ embeds: [partnerEmbed], components: [partnerButton] })

        } else if (embedType === 'gebannt') {
            const channel = interaction.guild.channels.cache.get("886989426583044117"); // Channel ID
            const msg = await channel.messages.fetch("1208816459535482961"); // Nachricht ID

            const gebanntEmbed = new EmbedBuilder()
                .setTitle('⠀⠀ ⠀⠀⠀⠀ ⠀⠀ ⛔ Du wurdest vom Server gebannt!  ⛔⠀⠀ ⠀⠀⠀⠀ ⠀⠀')
                .setDescription(
                    'Anscheinend wurdest du vom **Server Gebannt** und bist nun im **Bann-Bereich.**\n\n' +
                    '> » Falls dies eine **Falsche Entscheidung** gewesen ist, **melde dich** bei **einem Teammitglied** und gebe deine **Unschuld** an.\n\n' +
                    '> Öffne ein Ticket für den Bann-Support.'
                )
                .setColor('Red')

            const gebanntButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('gebannt-ticket')
                        .setLabel('⛔ » Bann Ticket')
                        .setStyle(ButtonStyle.Primary)
                )
            await msg.edit({ embeds: [gebanntEmbed], components: [gebanntButton] })

        } else if (embedType === 'seasonpass') {
            const channel = interaction.guild.channels.cache.get("1403497460332232745"); // Channel ID
            const msg = await channel.messages.fetch("1462195899584217315"); // Nachricht ID

            const seasonpassEmbed = new EmbedBuilder()
                .setTitle('🎟️ SeasonPass')
                .setDescription( 
                 'Schreibe jeden Tag mindestens 1x - erhalte jeden Monat bis zu 20 Rewards!\n\n' +
                 '**Auf einen Blick**:\n' +
                 '» Alle 30 Tage ein Pass mit 20 Rewards\n' +
                 '» Davon 7 Free, 13 Premium\n' +
                 '» Schreibe aktiv, um deine Rewards freizuschalten\n\n' +
                 '**So Geht\'s**:\n' +
                 '» Schreibe jeden Tag mindestens 1x\n' +
                 '» Du erhältst XP, mit denen du Rewards freischaltest\n' +
                 '» 150 XP wenn du am vorherigen Tag auch geschrieben hast\n' +
                 '» Ansonsten nur 100 XP - aktives Schreiben wird belohnt!\n\n' +
                 '`📌` » **Premium Pass**: Alle Rewards inkl. **5000 Coins**!\n'
                )
                .setColor('Blurple')

            const row = new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId('shoppass_show')
                .setLabel('SeasonPass anzeigen')
                .setEmoji('🎟️')
                .setStyle(ButtonStyle.Primary),
        
              new ButtonBuilder()
                .setCustomId('shoppass_buy')
                .setLabel('Alle Rewards freischalten')
                .setEmoji('💎')
                .setStyle(ButtonStyle.Secondary)
            );
            await msg.edit({ embeds: [seasonpassEmbed], components: [row] })

        } else {
            await interaction.reply({ content: `> \`❌\` » Embed wurde nicht gefunden.`, ephemeral: true });
        } 

        await interaction.reply({ content: `> \`✅\` » das \`${embedType}\`-Embed wurde gesendet oder bearbeitet.`, ephemeral: true })
    }
}