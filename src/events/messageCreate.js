const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');
const serverdb = require("../../Datenbank/serverdb");
const userdb = require("../../Datenbank/userdb");
const messagedb = require("../../Datenbank/messagedb");

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {        
        if(!message.guild) return
        if (message.channel.id === '1250047970116636756' && !message.user.id === "1020023299448786955") {
            try {
                await message.react('<a:wocheartbeat:1250054562912538724>');
            } catch (error) {
                console.error('Fehler beim Hinzufügen der Reaktion:', error);
            }
        }

        if (message.author.bot) { return }
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        
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

        if (message.channelId === config.willkommen) {
            const messageData = await messagedb.findOne({ guildID: config.server })
            messageData.messages = parseInt(messageData.messages) + 1
            await messageData.save()
        }

        // Ränge Info
        if (message.content === '!ränge-info') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
            await message.delete()

            const channel = message.guild.channels.cache.get("872063101640532008"); // Channel ID
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
        }

        // Regelwerk
        if (message.content === '!regelwerk') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
            await message.delete()

            const regelwerkEmbed = new EmbedBuilder()
                .setTitle('`🚨` » World Of Community - Server-Regeln')
                .setDescription('» An diesen Regeln musst du dich jederzeit halten, damit wir eine friedliche Atmosphäre wahren können. Solltest du dies nicht tun, können Sanktionen gegen deinem Account folgen.\n\n <:Pfeil:1119709908540076124> **Bei der Nutzung dieses Discord Servers bist du automatisch mit den Regeln einverstanden.**\n\n─────────────────────────\n\n1️⃣ 𑁉 Behandle alle Mitglieder stets respektvoll. Wir tolerieren keine Streitigkeiten oder andere toxischen Inhalte im Chat!\n\n2️⃣ 𑁉 NSFW-Inhalte (Nacktheit, Gewalt & mehr) können verstörend auf Mitglieder wirken und sind daher untersagt.\n\n3️⃣ 𑁉 Übersteuerte Geräusche & flackernde Emojis sind verboten, da sie das Wohlempfinden beeinträchtigen können.\n\n4️⃣ 𑁉 Werbung ist nur in den dazugehörigen Textkanälen gestattet, um unsere Mitglieder nicht unnötig zu nerven.\n\n5️⃣ 𑁉 Spam jeglicher Art (Doppelte Nachrichten, Channelhopping & u.ä.) ist aufgrund von Levelvorteilen verboten.\n\n6️⃣ 𑁉 Das Ausgeben von andere Nutzer, Mitglieder oder Teammitglieder ist untersagt und führt zur Sperrung.\n\n7️⃣ 𑁉 Postet auf keinen Fall irgendwelche privaten Adressen oder Telefonnummern in den Öffentlichen Chat, egal ob von euch oder jemand anderen.\n\n8️⃣ 𑁉 Unwissenheit schützt nicht vor einer Strafe. Allerdings hast du das Recht, einen Antrag auf Entsperrung bei uns einzureichen.\n\n9️⃣ 𑁉 Das Betteln um Ränge oder Berechtigungen ist ebenfalls untersagt.\n\n🔟 𑁉 Stimmverzerrer oder Soundboards sind nur gestattet, wenn dies ein Teammitglied erlaubt.')
                .setColor('Red')
                .setImage('https://cdn.discordapp.com/attachments/943859953318371359/1045406350903095357/WOC_Server_Regeln.png')
                .setFooter({ text: 'Du erklärst dich mit diesen Regeln bei der Nutzung unseres Discord-Servers einverstanden.', iconURL: 'https://media.discordapp.net/attachments/943859953318371359/1055943224092532846/WOC_Orange.png' })

            const regelButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('seite-2')
                        .setLabel('📚 » Nächste Seite')
                        .setStyle(ButtonStyle.Danger)
                )
            await message.channel.send({ embeds: [regelwerkEmbed], components: [regelButton] })
        }

        // Partner bewerben
        if (message.content === '!partner') {
            if (!message.member.permissions.has('Administrator')) return;
            message.delete()

            const channel = message.guild.channels.cache.get("1172819623935221810"); // Channel ID
            const msg = await channel.messages.fetch("1187070677073801268"); // Nachricht ID

            const partnerEmbed = new EmbedBuilder()
                .setDescription('# `👥` - **SO WIRST DU EIN PARTNER!**\nEin **Server-Partner** von uns zu sein ist eine **einmalige Möglichkeit**, um eine **riesige Auswahl an Usern** zu erreichen.\n\n# `🔥` ᕁ **WAS SIND DIE BEDINGUNGEN?**\n\n<:Pfeil:1119709908540076124> Um ein Partner zu werden, musst du die **unteren Voraussetzungen** erfüllen, damit du dich bewerben kannst.\n\n- `👥` » Mindestens **100 Server-Mitglieder** besitzen!\n- `💬` » Hält <#815922286502346773> und die **[Discord ToS](https://discord.com/terms)** ein!\n- `💖` » Ist ein **vollständiger deutscher Discord-Server**!\n- `📢` » Muss unserem <#1177536720229650442> Kanal **folgen**!\n# `📡` ᕁ **WAS SIND DIE VORTEILE?**\n<:Pfeil:1119709908540076124> Wir veranstalten regelmäßig Events um die Server unserer Partner noch etwas bekannter zu machen.')
                .setColor('Blurple')
                .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1230394438497603624/WOC_Partner_werden_Banner.jpg?ex=6633291d&is=6620b41d&hm=6215f23decf0d736fa27dfd023943667d78792afbab6fe67ee44631bf62a430a&')

            const partnerButton = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('partner')
                        .setLabel('✅ » Als Partner bewerben')
                        .setStyle(ButtonStyle.Success)
                )
            await msg.edit({ embeds: [partnerEmbed], components: [partnerButton] })
        }

        // Discord Server Links im Haupt Chat löschen
        const CHANNEL_ID = '815922756918181898';

        if (message.channel.id === CHANNEL_ID && !message.author.bot) {
            const discordLinkPattern = /(https?:\/\/)?(www\.)?(discord\.gg|discordapp\.com\/invite)\/[^\s]+/;
            if (discordLinkPattern.test(message.content)) {
                try {
                    await message.delete();

                    const WarnEmbed = new EmbedBuilder()
                    .setTitle('⚠️ | WARNUNG')
                    .setDescription('> Das Teilen von (Discord)-Server-Links ist in diesem Kanal (<#815922756918181898>) nicht erlaubt.\n> Bitte nutze die erlaubten Kanäle wie z.b. <#1172920281526960238>')
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