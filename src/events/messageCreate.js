const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder, PermissionsBitField } = require("discord.js");
const fs = require('fs');
const serverdb = require("../../Datenbank/serverdb");
const userdb = require("../../Datenbank/userdb");
const messagedb = require("../../Datenbank/messagedb");
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
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

        // Auto Delete

        if (message.channelId === config.autoDelete) {
            setTimeout(async () => {
                try {
                    await message.delete();
                } catch (error) {
                    console.error('Fehler beim Löschen der Nachricht:', error);
                }
            }, 30000);
        }

        // Löschen der Bot Nachricht
        if (message.author.bot) {
            try {
                await message.delete();
            } catch (error) {
                console.error('Fehler beim Löschen der Bot Nachricht:', error);
            }
            return;
        }

        // Server Database

        const serverData = await serverdb.findOne({ guildID: message.guildId })
        if (!serverData) {
            const newServer = new serverdb({
                guildID: message.guildId,
                deactivated: [],
                updateMessage: '',
                updateWeek: '',
                support: [],
                system: [],
                gift: [],
                verify: [],
                minecraft: [],
            });
            await newServer.save()
        }

        // User Database

        const userData = await userdb.findOne({ userID: message.author.id })
        if (!userData) {
            const newUser = new userdb({
                userID: message.author.id,
                reactions: [],
            });
            await newUser.save()
        }

        // Ping Reaction

        if (message.mentions.users.size > 0) {
            if (message.author.bot) return;
            for (const [_, mentionedUser] of message.mentions.users) {
                const mentionData = await userdb.findOne({ userID: mentionedUser.id });

                if (mentionData && mentionData.reactions && mentionData.reactions.length > 0) {
                    mentionData.reactions.forEach(async (reaction) => {
                        await message.react(reaction).catch((err) => { });
                    });
                }
                if (mentionData && mentionData.afk && mentionedUser.id != message.author.id) {
                    const m = await message.reply(`<:AFK:1021086267557023775> | ${mentionedUser} **ist aktuell abwesend!**\n${mentionData.afkReason.replace("*", "")}`)

                    setTimeout(async () => {
                        try {
                            await m.delete()

                        } catch (error) {

                        }
                    }, 5000)
                }
            }
        }

        // Bot Ping / Erwähnung

        const pingmessage = [
            'Wenn du Hilfe brauchst öffne ein Ticket im Support <:pepeheart:974642478055555082>',
            'Ein Admin hat mir verboten dir zu antworten <a:warnung:1066110628705615914>',
            'Ja? <:Moin:915211924164210738>',
            'Was gibt es? <a:what:1119708325962055720>',
            'Grüße dich! <a:winken:1086560167442796544>',
        ];

        if (message.mentions.has(client.user) && !message.author.bot) {
            const randomPingMessage = pingmessage[Math.floor(Math.random() * pingmessage.length)];
            message.channel.send(randomPingMessage).then(sentMessage => {
                setTimeout(() => {
                    sentMessage.delete()
                        .catch(err => console.error('Fehler beim Löschen der Nachricht:', err));
                }, 3000); // 3000 Millisekunden = 3 Sekunden
            }).catch(err => console.error('Fehler beim Senden der Nachricht:', err));
        }

        // Spielersuche System

        if (message.channel.id === '896743941813207081') {
            try {
                // Reagiere mit einem bestimmten Emoji
                await message.react('🔍');
            } catch (error) {
                console.error('Fehler beim Hinzufügen der Reaktion:', error);
            }
        }

        // Werbung für alle

        if (message.channel.id === '1172920281526960238') {
            try {
                // Reagiere mit einem bestimmten Emoji
                await message.react('<a:woclink:1236232439022616658>');
            } catch (error) {
                console.error('Fehler beim Hinzufügen der Reaktion:', error);
            }
        }

        // Vorstellung

        if (message.channel.id === '1250047970116636756') {
            try {
                // Reagiere mit einem bestimmten Emoji
                await message.react('<a:wocheartbeat:1250054562912538724>');
            } catch (error) {
                console.error('Fehler beim Hinzufügen der Reaktion:', error);
            }
        }

        // Geburtstags-System

        if (message.channel.id === '1243964646449483788') {
            try {
                // Reagiere mit einem bestimmten Emoji
                await message.react('<a:herzen:974633994840854608>');
                await message.react('<a:Cool:915211628755169301>');
            } catch (error) {
                console.error('Fehler beim Hinzufügen der Reaktion:', error);
            }
        }

        // Suggestion Channel
        if (message.channelId === config.vorschläge) {
            if (message.author.bot) return;
            if (await serverdb.findOne({ guildID: message.guildId, deactivated: { $in: ['vorschläge'] } })) return message.reply({ content: '> `⛔` » Das Vorschläge System ist momentan deaktiviert.' })

            let content = message.content

            await message.delete().catch((err) => { }).then(async msg => {
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('einreichen')
                            .setLabel('Einreichen')
                            .setEmoji('✅')
                            .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                            .setCustomId('abbrechen')
                            .setLabel('Abbrechen')
                            .setEmoji('❌')
                            .setStyle(ButtonStyle.Secondary),
                    )

                await msg.channel.send({ content: `> Möchtest du den Vorschlag wirklich einreichen?\n\n> Dein Vorschlag:\n> **${content}**\n\n> Klicke auf die unteren Buttons`, components: [buttons] }).then(async interaction => {
                    await message.client.on('interactionCreate', async (inter) => {
                        if (inter.customId === 'einreichen') {
                            await interaction.delete().catch(error => console.log(error))
                            const vorschlagEmbed = new EmbedBuilder()
                                .setAuthor({ name: `Eingereicht von ${inter.user.displayName}` })
                                .setTitle('» `🔎` - NEUER VORSCHLAG!')
                                .setDescription(`> ${content}\n\n─────────────────────────\n\n`)
                                .addFields({ name: '`💡` - Vorschläge', value: '» Schreibe eigene Vorschläge in diesem Kanal\num sie für den WOC-Discord einzureichen.' })
                                .setColor('#515558')
                                .setThumbnail('https://images-ext-1.discordapp.net/external/5IVIzj8wJ6S4-jJ13JsBzKChdJeU0_Mg541jcWFomlo/https/i.imgur.com/emyqXev.png')
                                .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1190736182661882006/WOC_Banner_Server_Idee_Eingereicht.jpg?ex=65a2e27c&is=65906d7c&hm=b601ecc960883375ce6460df9f427fe42129698c8dd7e66f3f47bd01ee43cf44&')
                                .setFooter({ text: `» Eingereicht von ${inter.user.displayName} - ${inter.user.id}`, iconURL: inter.user.displayAvatarURL({ dynamic: true }) })
                            await inter.channel.send({ embeds: [vorschlagEmbed] }).then(int => {
                                int.react('<a:upvote:1033452503309758525>')
                                int.react('<a:downvote:1033452526340673596>')
                            })
                        } else if (inter.customId === 'abbrechen') {
                            await interaction.delete().catch((err) => { })
                            await inter.reply({ content: '> `❗` » Du hast den Vorschlag nicht eingereicht.', ephemeral: true })
                        }
                    });
                })
            })
        }

        // Ränge Info

        if (message.content === '!ränge-info') {
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
            await message.delete()

            const channel = message.guild.channels.cache.get("872063101640532008"); // Channel ID
            const msg = await channel.messages.fetch("1181152581838450719"); // Nachricht ID

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
                                description: '» Erhalte einzigartige Erfolge. 🏆',
                                emoji: '<a:trophe:1112823561992818859>',
                                value: 'server',
                            },
                            {
                                label: '× MITGLIEDER - ROLLEN',
                                description: '» Hier sind Alle Mitglieder-Rollen aufgelistet. 👥',
                                emoji: '<:members:1055964826960154625>',
                                value: 'spieler',
                            },
                            {
                                label: '× EXKLUSIVE - ROLLEN',
                                description: '» Besondere Rollen mit besonderen Vorteilen. 👑',
                                emoji: '<a:krone:1112823594649665607>',
                                value: 'exklusive',
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
                .setColor('#c53a2b')
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
                .setDescription('# `👥` - **SO WIRST DU EIN PARTNER!**\nEin **Server-Partner** von uns zu sein ist eine **einmalige Möglichkeit**, um eine **riesige Auswahl an Usern** zu erreichen.\n\n# `🔥` ᕁ **WAS SIND DIE BEDINGUNGEN?**\n\n<:Pfeil:1119709908540076124> Um ein Partner zu werden, musst du die **unteren Voraussetzungen** erfüllen, damit du dich bewerben kannst.\n\n- `👥` » Mindestens **100 Server-Mitglieder** besitzen!\n- `💬` » Hält <#815922286502346773> und die **[Discord ToS](https://discord.com/terms)** ein!\n- `💖` » Ist ein **vollständiger deutscher Discord-Server**!\n- `📢` » Muss unserem <#1177536720229650442> Kanal **folgen**!\n\n# `📡` ᕁ **WAS SIND DIE VORTEILE?**\n<:Pfeil:1119709908540076124> Wir veranstalten regelmäßig Events um die Server unserer Partner noch etwas bekannter zu machen.')
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
    }
}