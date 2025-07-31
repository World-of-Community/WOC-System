const { Events, EmbedBuilder, WebhookClient, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ChannelType, PermissionFlagsBits } = require("discord.js");
const userdb = require("../../Datenbank/userdb");
const config = require("../json/config.json")
const vorschlagEmitter = require('../custom_events/vorschlag');
const Advent = require("../../Datenbank/adventdb");
const NewsStatus = require("../../Datenbank/newsdb");
const Timeout = require('../../Datenbank/timeoutdb');
const Warn = require('../../Datenbank/warndb');
const bandb = require('../../Datenbank/bandb');

// Belohnungen definieren
const rewards = {
    1: { type: 'coins', value: 100 },
    2: { type: 'coins', value: 200 },
    3: { type: 'coins', value: 300 },
    4: { type: 'coins', value: 400 },
    5: { type: 'coins', value: 500 },
    6: { type: 'role', value: '1312780135530889326' }, // Adventskalender 2024
    7: { type: 'coins', value: 700 },
    8: { type: 'coins', value: 800 },
    9: { type: 'coins', value: 900 },
    10: { type: 'coins', value: 1000 },
    11: { type: 'coins', value: 1100 },
    12: { type: 'coins', value: 1200 },
    13: { type: 'coins', value: 1300 },
    14: { type: 'coins', value: 1400 },
    15: { type: 'coins', value: 1500 },
    16: { type: 'coins', value: 1600 },
    17: { type: 'coins', value: 1700 },
    18: { type: 'coins', value: 1800 },
    19: { type: 'coins', value: 1900 },
    20: { type: 'coins', value: 2000 },
    21: { type: 'coins', value: 2100 },
    22: { type: 'coins', value: 2200 },
    23: { type: 'coins', value: 2300 },
    24: { type: 'coins', value: 2400 },
};

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {

        if (interaction.isButton()) {

            const userId = interaction.user.id;
  
  try {
    const newsStatus = await NewsStatus.findOne({ userId });

    if (interaction.customId === 'disable_news') {
      if (newsStatus) {
        newsStatus.isNewsEnabled = false;
        await newsStatus.save();
      } else {
        await NewsStatus.create({ userId, isNewsEnabled: false });
      }

      await interaction.reply({ content: '> `🔕` » Du wirst keine weiteren Neuigkeiten per DM erhalten.', ephemeral: true });
    }

    if (interaction.customId === 'enable_news') {
      if (newsStatus) {
        newsStatus.isNewsEnabled = true;
        await newsStatus.save();
      } else {
        await NewsStatus.create({ userId, isNewsEnabled: true });
      }

      await interaction.reply({ content: '> `🔔` » Du wirst wieder Neuigkeiten per DM erhalten.', ephemeral: true });
    }
  } catch (error) {
    console.error('Fehler bei der Verarbeitung der Button-Interaktion:', error);
    await interaction.reply({ content: '> `❌` » Es gab einen Fehler bei der Verarbeitung der Interaktion.', ephemeral: true });
  }
            const now = new Date();
          
            // Event-Zeitspannen
            const eventPeriods = {
              easter: { start: new Date('2024-03-01T00:00:00Z'), end: new Date('2024-04-30T23:59:59Z') },
              halloween: { start: new Date('2024-10-27T00:00:00Z'), end: new Date('2024-11-02T23:59:59Z') },
              christmas: { start: new Date('2024-12-20T00:00:00Z'), end: new Date('2024-12-26T23:59:59Z') },
              newyear: { start: new Date('2024-12-27T00:00:00Z'), end: new Date('2025-01-02T23:59:59Z') },
            };
          
            // Aktuelle Event-Prüfung
            const isEventActive = (event) => now >= event.start && now <= event.end;
          
            switch (interaction.customId) {
               case 'easter_event':
                const OsterEmbed = new EmbedBuilder()
                  .setTitle('`🐇` Oster Event `🐇`')
                  .setDescription(isEventActive(eventPeriods.easter) ? '**Das Oster-Event ist aktuell aktiv! Viel Spaß beim Sammeln der Oster-Eier!**' : '**Dieses Event startet erst zwischen den Monaten `März` und `April`!**')
                  .setColor(isEventActive(eventPeriods.easter) ? 'Green' : 'Green');
          
                await interaction.reply({ embeds: [OsterEmbed], ephemeral: true });
                break;
          
              case 'halloween_event':
                const HalloweenEmbed = new EmbedBuilder()
                  .setTitle('`🎃` Halloween Event `🎃`')
                  .setDescription(isEventActive(eventPeriods.halloween) ? '**Das Halloween-Event ist aktiv! Viel Spaß beim Gruseln!**' : '**Dieses Event findet erst zwischen dem `27. Oktober` und dem `02. November` statt!**')
                  .setColor(isEventActive(eventPeriods.halloween) ? 'Orange' : 'Orange');
          
                await interaction.reply({ embeds: [HalloweenEmbed], ephemeral: true });
                break;
          
              case 'christmas_event':
                const WeihnachtsEmbed = new EmbedBuilder()
                  .setTitle('`🎄` Weihnachts-Event `🎄`')
                  .setDescription(isEventActive(eventPeriods.christmas) ? '**Das Weihnachts-Event ist aktiv! Genieße die festliche Stimmung!**' : '**Dieses Event findet erst zwischen dem `20. Dezember` und dem `26. Dezember` statt!**')
                  .setColor(isEventActive(eventPeriods.christmas) ? 'DarkBlue' : 'DarkBlue');
          
                await interaction.reply({ embeds: [WeihnachtsEmbed], ephemeral: true });
                break;
          
              case 'newyear_event':
                const SilvesterEmbed = new EmbedBuilder()
                  .setTitle('`🎆` Silvester Event `🎆`')
                  .setDescription(isEventActive(eventPeriods.newyear) ? '**Das Silvester-Event ist aktiv! Feiere das neue Jahr mit uns!**' : '**Dieses Event findet erst zwischen dem `27. Dezember` und dem `02. Januar` statt!**')
                  .setColor(isEventActive(eventPeriods.newyear) ? 'Grey' : 'Grey');
          
                await interaction.reply({ embeds: [SilvesterEmbed], ephemeral: true });
                break;
          
              case 'collect_event':
                const activeEvent = Object.keys(eventPeriods).find((key) =>
                  isEventActive(eventPeriods[key])
                );
          
                const eventItemEmbed = new EmbedBuilder()
                  .setDescription(activeEvent ? `**Du hast ein Item aus dem aktuellen Event (${activeEvent.toUpperCase()}-Event) eingesammelt!**` : '**Zum aktuellen Zeitpunkt findet gerade kein `Season-Event` statt!**')
                  .setColor(activeEvent ? 'Green' : 'Red');
          
                await interaction.reply({ embeds: [eventItemEmbed], ephemeral: true });
          
                if (activeEvent) {
                  await interaction.followUp({ content: '> `✅` » Du hast erfolgreich ein Event-Item eingesammelt!', ephemeral: true });
                }
                break;
            }
          }

        // Aktuelles Datum holen
        const currentDay = new Date().getDate(); // Gibt den aktuellen Tag des Monats zurück

        if (interaction.isButton() && interaction.customId.startsWith('advent_')) {
        const [, day] = interaction.customId.split('_');
        const dayNumber = parseInt(day);

        let userData = await Advent.findOne({ userId: interaction.user.id });
        if (!userData) {
            userData = await Advent.create({ userId: interaction.user.id, openedDays: [] });
        }

        // Überprüfen, ob der Tag bereits geöffnet wurde
        if (userData.openedDays.includes(dayNumber)) {
            return interaction.reply({ content: `> \`❗\` » Du hast diesen Tag (${dayNumber}. Dezember) bereits geöffnet!`, ephemeral: true });
        }

        // Überprüfen, ob der Tag in der Zukunft liegt
        if (dayNumber > currentDay) {
            return interaction.reply({ content: '> `❌` » Du kannst zukünftige Tage nicht öffnen!', ephemeral: true });
         }

        // Belohnungssystem verarbeiten
        userData.openedDays.push(dayNumber);
        await userData.save();

        let rewardMessage = ''; // Sicherstellen, dass rewardMessage immer einen Wert hat

        const reward = rewards[dayNumber];

        switch (reward?.type) {
            case 'coins':
                rewardMessage = `> \`🎉\` » Du hast **${reward.value} Coins** erhalten!\n> \`🎫\` » Öffne ein Ticket im Support, um deine Belohnung abzuholen.`;
            break;

            case 'role':
                const role = interaction.guild.roles.cache.find(r => r.id === reward.value);
            if (role) {
                await interaction.member.roles.add(role);
                rewardMessage = `> \`🎉\` » Du hast die Rolle **${role.name}** erhalten!`;
            } else {
                rewardMessage = '> `❗` » Rolle wurde nicht gefunden. Bitte melde dich im Support.';
            }
            break;

            case 'custom':
                rewardMessage = reward.value || '> `🎁` » Keine spezifische Belohnung verfügbar.'; // Sicherstellen, dass keine leere Nachricht gesendet wird
            break;

            default:
                rewardMessage = `> \`❗\` » Du hast den **${dayNumber}. Dezember** bereits geöffnet.`; // Standardnachricht
        }

        return interaction.reply({ content: rewardMessage, ephemeral: true }); // Antwort mit der Belohnung
    }

        const userData = await userdb.findOne({ userID: interaction.user.id })
        client = interaction.client

        // Adventskalender bearbeiten
        const now = new Date();
        const nextMidnight = new Date();
        nextMidnight.setHours(24, 0, 0, 0); // Setze auf Mitternacht
        const delay = nextMidnight - now;

        const emojiquizCommand = require('../commands/team/emoji-quiz.js');

        try {
          if (interaction.isModalSubmit()) {
            if(await emojiquizCommand.handleModalSubmit(interaction)) return;
          }
          if (interaction.isCommand()) {
            if(interaction.commandName === 'emojiquiz') {
              await emojiquizCommand.execute(interaction);
              return;
            }
          }
          if (interaction.isButton()) {
            if(await emojiquizCommand.handleButton(interaction)) return;
          }
        } catch(e) {
          console.error(e);
        }

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

                    const advent2024 = await interaction.guild.roles.cache.get('1312780135530889326')
                    const roleCountadvent = advent2024.members.size

                    const lucky = await interaction.guild.roles.cache.get('1124598019862573096')
                    const roleCountlucky = lucky.members.size

                    const serverEST = await interaction.guild.roles.cache.get('882240367632744508')
                    const roleCountSEST = serverEST.members.size

                    const serverEmbed = new EmbedBuilder()
                        .setTitle('<a:trophe:1112823561992818859> 𑁉 UNSERE SERVER-ERFOLGE')
                        .setDescription(
                            `» Mit **Erfolgen** kannst du **vor deinen Freunden** angeben und hast die Chance, in unserem Server **einzigartige Erfolge freizuschalten!**\n\n` +
                            `\`🧡\` 𑁉 <@&972193356333604874> (\`${roleCountY}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> Mitglied seit **einem Jahr** auf dem Server.\n\n` +
                            `\`💡\` 𑁉 <@&1147250265641201724> (\`${roleCountI}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> Reiche **10 Server-Ideen** ein.\n\n` +
                            `\`📢\` 𑁉 <@&1147250982967836823> (\`${roleCountU}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> Nimm an **20 Server-Umfragen** teil.\n\n` +
                            `\`💚\` 𑁉 <@&992008555987222548> (\`${roleCountSDES}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Seit 2021** auf World Of Community\n\n` +
                            `\`🎄\` 𑁉 <@&863034801036591114> (\`${roleCountC}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> Exklusiv an **Weihnachten 2021** erhalten\n\n` +
                            `\`📆\` 𑁉 <@&1312780135530889326> (\`${roleCountadvent}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> Beim **Adventskalender 2024** erhalten\n\n` +
                            `\`☘️\` 𑁉 <@&1124598019862573096> (\`${roleCountlucky}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Gewinne** bei einem Event auf WOC.\n\n` +
                            `\`🔓\` 𑁉 <@&882240367632744508> (\`${roleCountSEST}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> War bei der **Server-Eröffnung 2021** dabei.`
                        )
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
                        .setDescription(
                            `» Erhalte diese Ränge auf dem Discord-& Minecraft Server.\n\n` +
                            `> \`🌟\` 𑁉 <@&815921105407574056> (\`${roleCountsupreme}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Doppelsprung.\n\n` +
                            `> \`⭐\` 𑁉 <@&917826787977871441> (\`${roleCountpremium}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Doppelsprung\n\n` +
                            `> \`🔮\` 𑁉 <@&815920452337139733> (\`${roleCountlegende}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Doppelsprung\n\n` +
                            `> \`💎\` 𑁉 <@&835775627721179167> (\`${roleCountdiamond}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Doppelsprung\n\n` +
                            `> \`👻\` 𑁉 <@&835775556611997697> (\`${roleCountemerald}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Doppelsprung\n\n` +
                            `> \`🟣\` 𑁉 <@&835775597446955048> (\`${roleCountepisch}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Bald Verfügbar.`
                        )
                        .setColor('Green')
                        .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340189336010757/WOC_Banner_Minecraft_Range.png?ex=66b4faac&is=66b3a92c&hm=dbde292175421ce18dd4b7a1a067f1a5e164b65d5f23b12911bfc57b509f723c&')
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
                        .setDescription(
                            `» Chatte mit **anderen Server-Mitgliedern** oder **unterhalte dich** in unseren Sprachkanälen um **die folgenden Rollen** freizuschalten.\n\n` +
                            `> \`☢️\` 𑁉 <@&1258825307239219371> (\`${roleCounthyperaktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Wir schenken dir einmal <a:basic:1186636165567229972> **DISCORD NITRO BASIC!** <a:basic:1186636165567229972>\n\n` +
                            `> \`🤩\` 𑁉 <@&1258794321533075526> (\`${roleCountultraaktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich **jemand erwähnt!**\n\n` +
                            `> \`⚡️\` 𑁉 <@&1258825144697360485> (\`${roleCountextremaktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> **Eine eigene Rolle:** Name + Farbe selbst wählbar!\n\n` +
                            `> \`🥊\` 𑁉 <@&1258794405507240038> (\`${roleCountmegaaktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n` +
                            `> \`💪\` 𑁉 <@&1258827956634128467> (\`${roleCountstarkaktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> **Schreibrechte** erhalten in den Kanal: <#1243964646449483788>\n\n` +
                            `> \`👀\` 𑁉 <@&1258794479570124920> (\`${roleCountsehraktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> **Umfragen** in **öffentliche** Chats posten\n\n` +
                            `> \`🏃\` 𑁉 <@&1258794944953319534> (\`${roleCountaktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> **Dateien** hochladen & **Nicknamen** verändern.\n\n` + 
                            `> \`💤\` 𑁉 <@&1258827226846199808> (\`${roleCountinaktiv}👥\`)\n` +
                            `<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden`
                        )
                        .setColor('Orange')
                        .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340226862452896/WOC_Banner_Levelsystem.png?ex=66b4fab5&is=66b3a935&hm=56c41f63e7f2cb41f0fbb42cd8423b6f03e05e310af8afba5e7eb7f7437d7a3f&')
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
                        .setDescription(
                            `» Alle **Rollen in dieser Liste** kannst du nur auf ganz **bestimmer Art und Weise** erhalten, dennoch haben sie **mächtige Vorteile.**\n\n` +
                            `> \`🔮\` 𑁉 <@&843013551605284864> (\`${roleCountbooster}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Rang freischalten:** Booste diesen Server!\n\n` +
                            `<:PfeilBlau:1119711275014955080> **2X XP-Boost** in allen Chats!\n` +
                            `<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n` +
                            `<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n` +
                            `<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n` +
                            `> \`😎\` 𑁉 <@&862708375698538507> (\`${roleCountvip}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n` +
                            `<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n` +
                            `<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n` +
                            `<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n` +
                            `> \`🎥\` 𑁉 <@&815920219247214644> (\`${roleCountcreator}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Rang freischalten:** Dieser Rang wird von uns individuell vergeben.\n\n` +
                            `<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n` +
                            `<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n` +
                            `<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n` +
                            `> \`💜\` 𑁉 <@&1067899186542018571> (\`${roleCounttwitchsub}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Rang Freischalten:** Kaufe dir einen Sub bei [Red3405](https://www.twitch.tv/red340505tv) auf Twitch und erhalte diesen Rang auf unserem Discord Server.\n\n` +
                            `<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n` +
                            `<:PfeilBlau:1119711275014955080> Lege ein **Emoji** fest, wenn dich jemand **erwähnt!**\n` +
                            `<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!\n\n` +
                            `> \`👋\` 𑁉 <@&1222122625594294272> (\`${roleCountneuesmitglied}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Rang freischalten:** Erhält jeder für 24 Stunden nach Beitritt!\n\n` +
                            `<:PfeilBlau:1119711275014955080> Eine **auffallende & besondere** Chat-Farbe & **höher gelistet!**\n\n` +
                            `> \`🎂\` 𑁉 <@&1244945910262399046> (\`${roleCountbirthday}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Rang freischalten:** Heute Geburtstag feiern!\n\n` +
                            `<:PfeilBlau:1119711275014955080> Eine **auffallende & besondere** Chat-Farbe & **höher gelistet!**\n` +
                            `<:PfeilBlau:1119711275014955080> **Zugriff** auf <#1243964646449483788>\n\n` +
                            `> \`💛\` 𑁉 <@&1010105569866174574> (\`${roleCountunterstützer}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Rang freischalten:** im Status \`discord.gg/woc\` schreiben!\n\n` +
                            `<:PfeilBlau:1119711275014955080> **Fremde Emojis** verwenden & **Links** einsenden.\n` +
                            `<:PfeilBlau:1119711275014955080> **Keine Voraussetzung** erfüllen für **ALLE** Gewinnspiele!`
                        )
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

                    const developer = await interaction.guild.roles.cache.get('929349039433056276')
                    const roleCountdeveloper = developer.members.size

                    const srmoderator = await interaction.guild.roles.cache.get('816985466230145044')
                    const roleCountsrmoderator = srmoderator.members.size

                    const moderator = await interaction.guild.roles.cache.get('815920052385480754')
                    const roleCountmoderator = moderator.members.size

                    const supporter = await interaction.guild.roles.cache.get('815920170371383366')
                    const roleCountsupporter = supporter.members.size

                    const builder = await interaction.guild.roles.cache.get('1263645368441241700')
                    const roleCountbuilder = builder.members.size

                    const teamEmbed = new EmbedBuilder()
                        .setTitle('<a:security:1119708496670232646> 𑁉 UNSER SERVER-TEAM')
                        .setDescription(
                            `» Hier kannst du alle **unsere Team-Ränge** sehen und welche User **aktuell in unserem Server-Team** tätig sind.\n\n` +
                            `> \`🎯\` 𑁉 <@&959869691529154631> (\`${roleCountadmin}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Aufgabe:** Die Administration kümmert sich um die ganze Server-Verwaltung, die Organisation und um die Umsetzung neuer Ideen.\n` +
                            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(admin.id)}\n\n` +
                            `> \`👨‍💻\` 𑁉 <@&929349039433056276> (\`${roleCountdeveloper}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Aufgabe:** Die Developer/Entwickler kümmern sich um die Entwicklung unserer Bots sowie Plugins und helfen der Administrator bei der technischen Umsetzung.\n` +
                            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(developer.id)}\n\n` +
                            `> \`🕵\` 𑁉 <@&816985466230145044> (\`${roleCountsrmoderator}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Aufgabe:** Die Senior-Mod's sind erfahrene Moderatoren und kümmern sich um die Pflege des Support-Teams. Sie agieren als eine Art von "Mentor" und führen neue Teammitglieder ein.\n` + 
                            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(srmoderator.id)}\n\n` +
                            `> \`👮\` 𑁉 <@&815920052385480754> (\`${roleCountmoderator}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Aufgabe:** Die Mod's sind wichtige Bestandteile des Teams. Sie kümmern sich um Tickets, Moderation und administrieren kleinere Elemente (wie das Bann-System & Geburtstag ändern).\n` +
                            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(moderator.id)}\n\n` +
                            `> \`🧩\` 𑁉 <@&815920170371383366> (\`${roleCountsupporter}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Aufgabe:** Die Supporter sind neu in unserem Team. Sie kümmern sich um Support-Tickets, moderieren den Chat und gewöhnen sich ein.\n` +
                            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(supporter.id)}\n\n` +
                            `> \`🪓\` 𑁉 <@&1263645368441241700> (\`${roleCountbuilder}👥\`)\n` +
                            `<:Pfeil:1119709908540076124> **Aufgabe:** Neue Maps für die jeweiligen Spielmodi Bauen sowie Lobby & bei den anderen Builder unter die Arme greifen\n` +
                            `<:PfeilBlau:1119711275014955080> **Mitglieder:** ${await getMemberList(builder.id)}`
                        )
                        .setColor('Red')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1181732690458837083/WOC_Banner_Unser_Server-Team.jpg?ex=65949654&is=65822154&hm=4a077c7d4e3975ee38617cb9b3de6aa8fe7861c9e45c8c3665b2f9b50e045786&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [teamEmbed], ephemeral: true })
                } break;

                case 'bot': {
                    const botEmbed = new EmbedBuilder()
                        .setTitle('<a:pin:1119708768326914100> 𑁉 UNSERE WICHTIGSTEN BOTS')
                        .setDescription(
                            '» Hier könnt ihr sehen **welche Aufgaben** unsere **wichtigsten Bots** haben, die speziell **von uns entwickelt** wurden.\n\n' +
                            '> `⚙️` 𑁉 <@1020023299448786955> (Eingeführt am `15.09.2022📝`)\n' +
                            '<:Pfeil:1119709908540076124> **Aufgabe:** Die Aufgaben dieses Bots sind sehr vielfältig. Wir listen euch einmal die größten Dinge auf.\n\n' +
                            '<:PfeilBlau:1119711275014955080> **Info-& Stats-Kanäle aktuell halten**\n' +
                            '<:PfeilBlau:1119711275014955080> **Ideen-, Spielersuche-& Changelog-System**\n' +
                            '<:PfeilBlau:1119711275014955080> **Bewerbungs-& Rollen-Verwaltung**\n' +
                            '<:PfeilBlau:1119711275014955080> **Verwaltung der Gewinnspiele**\n\n' +
                            '> \`🚑\` 𑁉 <@1031487336783028274> (Tickets bearbeitet: `10.000+🎫`)\n' +
                            '<:Pfeil:1119709908540076124> **Aufgabe:** Erstellung, Verwaltung und Organisierung von Tickets.\n\n' +
                            '> <a:pin:1119708768326914100> 𑁉 **DIE RESTLICHEN BOTS...**\n' +
                            '<:Pfeil:1119709908540076124> **Aufgaben:** Die restlichen Bots erfüllen nur noch kleine Aufgaben oder werden bald durch einen eigenen Bot von uns ersetzt.'
                        )
                        .setColor('Aqua')
                        .setImage('https://cdn.discordapp.com/attachments/1145779055644393592/1181732786554540183/WOC_Banner_Discord_Bots.jpg?ex=6594966b&is=6582216b&hm=e036aa4455500313ff188c610bdbc1981f0190d78f5e6cde9490b91ad56ecec1&')
                        .setFooter({ text: 'Öffne ein Ticket im Support bei Fragen oder Problemen.', iconURL: 'https://cdn.discordapp.com/attachments/969637733033205851/1117815438177480754/WOC_Orange.png' })
                        .setTimestamp()
                    await interaction.reply({ embeds: [botEmbed], ephemeral: true })
                } break;
            }
        }

        if (!interaction.isButton()) return;

        const messageID = interaction.message.id;
        const teamData = await serverdb.findOne({ guildID: interaction.guildId });
        if (!teamData || !teamData.meetings) return;
      
        const meeting = teamData.meetings.find(m => m.messageID === messageID);
        if (!meeting) {
          return interaction.reply({ content: '> `❌` » Meeting nicht gefunden.', ephemeral: true });
        }
      
        const userId = interaction.user.id;
      
        switch (interaction.customId) {
          case 'attend':
            if (!meeting.attendees.includes(userId)) {
              meeting.attendees.push(userId);
              meeting.nonAttendees = meeting.nonAttendees.filter(id => id !== userId);
            }
            await serverdb.updateOne(
              { guildID: interaction.guildId, "meetings.messageID": messageID },
              { $set: { "meetings.$.attendees": meeting.attendees, "meetings.$.nonAttendees": meeting.nonAttendees } }
            );
            await interaction.reply({ content: '> `✅` » Du hast deine Teilnahme bestätigt.', ephemeral: true });
            break;
      
          case 'decline':
            if (!meeting.nonAttendees.includes(userId)) {
              meeting.nonAttendees.push(userId);
              meeting.attendees = meeting.attendees.filter(id => id !== userId);
            }
            await serverdb.updateOne(
              { guildID: interaction.guildId, "meetings.messageID": messageID },
              { $set: { "meetings.$.attendees": meeting.attendees, "meetings.$.nonAttendees": meeting.nonAttendees } }
            );
            await interaction.reply({ content: '> `✅` » Du hast abgesagt.', ephemeral: true });
            break;
      
          case 'remindMe':
            if (!meeting.reminders.includes(userId)) {
              meeting.reminders.push(userId);
              await serverdb.updateOne(
                { guildID: interaction.guildId, "meetings.messageID": messageID },
                { $set: { "meetings.$.reminders": meeting.reminders } }
              );
              await interaction.reply({ content: '> `🔔` » Du wirst **10 Minuten vor dem Meeting** erinnert.', ephemeral: true });
            } else {
              await interaction.reply({ content: '> `ℹ️` » Du wirst bereits erinnert.', ephemeral: true });
            }
            break;
      
          case 'list':
            const attendeesList = meeting.attendees.map(id => `<@${id}>`).join('\n') || 'Niemand';
            const nonAttendeesList = meeting.nonAttendees.map(id => `<@${id}>`).join('\n') || 'Niemand';
          
            const listEmbed = new EmbedBuilder()
              .setTitle('📋 Teilnehmerliste')
              .addFields(
                { name: '✅ Teilnehmen', value: attendeesList, inline: true },
                { name: '❌ Nicht teilnehmen', value: nonAttendeesList, inline: true }
              )
              .setColor(0x00b0f4)
              .setFooter({ text: 'Stand: ' + new Date().toLocaleString('de-DE') });
          
            await interaction.reply({
              embeds: [listEmbed],
              ephemeral: true,
            });
            break;
        }

        // Server-Regeln Seite 2
        if (interaction.customId === 'seite-2') {
            const seite2Embed = new EmbedBuilder()
                .setTitle('`🚨` » World Of Community - Server-Regeln (Seite 2)')
                .setDescription('» An diesen Regeln musst du dich jederzeit halten, damit wir eine friedliche Atmosphäre wahren können. Solltest du dies nicht tun, können Sanktionen gegen deinem Account folgen.\n\n───────────────────────── \n\n1️⃣1️⃣ 𑁉 Jegliche Inhalte sind in angemessener Form & Formattierung zu teilen. Dies betrifft zum Beispiel Nicknamen & Nachrichten.\n\n1️⃣2️⃣ 𑁉 Die Verbreitung von Viren oder unerlaubten Clientmodifikationen für Anwendungen ist nicht gestattet.\n\n1️⃣3️⃣ 𑁉 Im Zweifelsfall ist das Team berechtigt nach eigenem Ermessen zu handeln, eine Strafe muss nicht anhand einer Regel gerechtfertigt sein.\n\n1️⃣4️⃣ 𑁉 Das Ausnutzen von Bot-Systemen (Support, Server-Ideen, o.ä.) ist untersagt, um unsere Arbeit nicht zu behindern.\n\n 1️⃣5️⃣ 𑁉 Unterhaltungen sollten immer auf Deutsch (gelegentlich auf Englisch) geführt werden, damit unser Team alle Konversationen nachvollziehen kann.')
                .setColor('Red')
                .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340748256514153/WOC_Banner_Server-Regeln.png?ex=66db36b1&is=66d9e531&hm=cb89a6e2c1d545ed5bd515c5e624c58c200d71920c3febed6238ee18a0997996&')

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
                await interaction.client.once('interactionCreate', async (inter) => {
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

        //if (interaction.isButton()) {
        //    const { customId } = interaction;

        //    if (customId === 'shoppass_buy') {
        //      await interaction.reply({ content: '🛍️ Vorteile kaufen – Coming soon!', ephemeral: true });
        //    } else if (customId === 'shoppass_account') {
        //      await interaction.reply({ content: '🪙 Dein Konto – bald verfügbar!', ephemeral: true });
        //    } else if (customId === 'shoppass_help') {
        //      await interaction.reply({ content: '❓ Hilfe zum Shop-System – bald verfügbar!', ephemeral: true });
        //    } else if (customId === 'shoppass_shop') {
        //      await interaction.reply({ content: '🏪 Der Shop öffnet bald!', ephemeral: true });
        //    }
        //}

        if (interaction.isButton()) {
          if (interaction.customId.startsWith('editBanReason_')) {
              const userId = interaction.customId.split('_')[1];
      
              const modal = new ModalBuilder()
                  .setCustomId(`banReasonModal_${userId}`)
                  .setTitle('Ban-Grund bearbeiten');
      
              const banReasonInput = new TextInputBuilder()
                  .setCustomId('banReasonInput')
                  .setLabel("Neuer Ban-Grund")
                  .setStyle(TextInputStyle.Paragraph)
                  .setPlaceholder("Gib hier den neuen Ban-Grund ein")
                  .setRequired(true);
      
              const firstActionRow = new ActionRowBuilder().addComponents(banReasonInput);
      
              modal.addComponents(firstActionRow);
      
              await interaction.showModal(modal);
          }
        } else if (interaction.isModalSubmit()) {
            if (interaction.customId.startsWith('banReasonModal_')) {
              const userId = interaction.customId.split('_')[1];
              const newReason = interaction.fields.getTextInputValue('banReasonInput');
      
              let userData = await bandb.findOne({ userId: userId });
              if (!userData) {
                  userData = new bandb({
                      userId: userId,
                      reason: newReason
                  });
              } else {
                  userData.reason = newReason;
              }
              await userData.save();
      
              const guild = interaction.guild;
              const user = await client.users.fetch(userId);
              const member = await guild.members.fetch(userId).catch(() => null);
      
              const [timeoutCount, warnCount] = await Promise.all([
                  Timeout.countDocuments({ userId, guildId: guild.id }).catch(() => 0),
                  Warn.countDocuments({ userId, guildId: guild.id }).catch(() => 0)
              ]);
      
              const banColor = 0xED4245;
              const banEmoji = '`🔴`';
      
              const createdAt = `<t:${Math.floor(user.createdTimestamp / 1000)}>`;
              const joinedAt = member?.joinedTimestamp
                  ? `<t:${Math.floor(member.joinedTimestamp / 1000)}>`
                  : '`Nicht auf dem Server`';
      
              // Neuen Embed bauen
              const embed = new EmbedBuilder()
                  .setTitle(`\`👤\` Informationen über ${member?.displayName || user.username}`)
                  .setColor(banColor)
                  .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                  .setDescription(
                      `**\`📌\` Benutzerinformationen**\n` +
                      `> \`👤\` » Benutzername: \`${user.username}\`\n` +
                      `> \`🆔\` » Benutzer-ID: \`${user.id}\`\n` +
                      `> \`🏷️\` » Anzeigename: \`${member?.displayName || 'Nicht auf dem Server'}\`\n\n` +
                      `**\`⏰\` Mitglied Seit**\n` +
                      `> \`📅\` » Erstellt: ${createdAt}\n` +
                      `> \`📅\` » Beigetreten: ${joinedAt}\n\n` +
                      `**\`👮\` Moderation**\n` +
                      `> \`⛔\` » Bannstatus: ${banEmoji} **Gebannt**\n` +
                      `> \`📄\` » Grund: \`${newReason}\`\n` +
                      `> \`🔇\` » Timeouts: \`${timeoutCount}\`\n` +
                      `> \`❗\` » Warnungen: \`${warnCount}\``
                  )
                  .setFooter({ text: `${guild.name} | Userinfo`, iconURL: guild.iconURL() || user.displayAvatarURL() })
                  .setTimestamp();
      
              // Button zum erneuten Bearbeiten anbieten
              const components = [
                  new ActionRowBuilder().addComponents(
                      new ButtonBuilder()
                          .setCustomId(`editBanReason_${user.id}`)
                          .setLabel('📝 Ban-Grund ändern')
                          .setStyle(ButtonStyle.Secondary)
                  )
              ];
      
              // Antwort mit neuem Embed aktualisieren (falls Modal von ephemeral Nachricht kommt, musst du interaction.message holen)
              try {
                  if (interaction.message) {
                      // Falls Modal von Message kommt (z.B. modal response to ephemeral)
                      await interaction.update({ embeds: [embed], components });
                  } else {
                      // Falls Modal separat ohne Message, einfach antworten
                      await interaction.reply({ content: 'Ban-Grund wurde aktualisiert.', ephemeral: true });
                  }
              } catch {
                  // Fallback, falls update nicht klappt
                  await interaction.reply({ content: 'Ban-Grund wurde aktualisiert.', ephemeral: true });
              }
            }
        }

        if (interaction.isButton() && interaction.customId === 'create_feedback_ticket') {
            const feedbackModal = new ModalBuilder()
                .setTitle('Feedback einreichen')
                .setCustomId('feedback-modal');
        
            const titleInput = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('feedback-title')
                    .setLabel('Kurztitel des Themas')
                    .setPlaceholder('z.B. "Spielmodi", "Event-Idee", "Feature-Wunsch"')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
            );
        
            const descriptionInput = new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('feedback-description')
                    .setLabel('Detaillierte Beschreibung')
                    .setPlaceholder('Beschreibe hier dein Feedback ausführlich...')
                    .setMinLength(50)
                    .setMaxLength(4000)
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
            );
        
            feedbackModal.addComponents(titleInput, descriptionInput);
            await interaction.showModal(feedbackModal);
        }

        // Modal wurde abgeschickt
        if (interaction.isModalSubmit() && interaction.customId === 'feedback-modal') {
            const title = interaction.fields.getTextInputValue('feedback-title');
            const description = interaction.fields.getTextInputValue('feedback-description');
        
            const ticketName = `feedback-${interaction.user.username.toLowerCase()}`;
            const categoryId = '886985648714682439'; // Feedback-Kategorie
            const supportRoleId = '1011207481357238272'; // Team-Rolle
        
            const existingChannel = interaction.guild.channels.cache.find(c => c.name === ticketName);
            if (existingChannel) {
                return interaction.reply({ content: '> ⚠️ Du hast bereits ein offenes Feedback-Ticket.', ephemeral: true });
            }
        
            const ticketChannel = await interaction.guild.channels.create({
                name: ticketName,
                type: ChannelType.GuildText,
                parent: categoryId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AttachFiles],
                    },
                    {
                        id: supportRoleId,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
                    },
                ],
            });
        
            const ticketEmbed = new EmbedBuilder()
                .setDescription(`**Hey ${interaction.user}!**\n\nDanke für dein Feedback!\nDein Ticket wird zeitnah von unserem Server-Team bearbeitet.`)
                .setColor('Aqua')
                .setImage('https://imgur.com/kekDug7.png')

            const ticketEmbed2 = new EmbedBuilder()
                .setDescription(`**Kurztitel des Themas**\n${title}\n\n**Detaillierte Beschreibung**\n${description}`)
                .setColor('Aqua')
                .setImage('https://imgur.com/kekDug7.png')
        
            const closeButtonRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('close_feedback_ticket')
                    .setLabel('❌ Ticket schließen')
                    .setStyle(ButtonStyle.Secondary)
            );
        
            await ticketChannel.send({
                embeds: [ticketEmbed, ticketEmbed2],
                components: [closeButtonRow]
            });
        
            await interaction.reply({ content: `> \`✅\` » Dein **Feedback-Ticket** wurde erstellt: ${ticketChannel}`, ephemeral: true });
        }
        
        // Ticket schließen Button
        if (interaction.isButton() && interaction.customId === 'close_feedback_ticket') {
            const decisionEmbed = new EmbedBuilder()
                .setTitle('`❓` » Schließ-Anfrage')
                .setDescription(`${interaction.user} hat das Schließen dieses Tickets angefordert.\n\nBitte akzeptiere oder verweigere mit den untenstehenden Schaltflächen.`)
                .setColor('Blurple');
        
            const decisionButtons = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('feedback_accept_close')
                    .setLabel('Akzeptieren & schließen')
                    .setEmoji("☑️")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('feedback_reject_open')
                    .setLabel('Ablehnen & offen lassen')
                    .setEmoji("❌")
                    .setStyle(ButtonStyle.Secondary)
            );
        
            await interaction.reply({
                content: `<@${interaction.user.id}>`,
                embeds: [decisionEmbed],
                components: [decisionButtons],
                ephemeral: false
            });
        }
        
        // Akzeptieren & Ticket schließen
        if (interaction.isButton() && interaction.customId === 'feedback_accept_close') {
            const acceptEmbed = new EmbedBuilder()
                .setTitle('`🗑️` » Ticket wird geschlossen')
                .setDescription('Dieses Ticket wird in **5 Sekunden** geschlossen.')
                .setColor('Green');
        
            await interaction.update({
                embeds: [acceptEmbed],
                components: []
            });
        
            setTimeout(() => {
                interaction.channel.delete().catch(console.error);
            }, 5000);
        }
        
        // Ablehnen & Ticket bleibt offen
        if (interaction.isButton() && interaction.customId === 'feedback_reject_open') {
            const rejectEmbed = new EmbedBuilder()
                .setTitle('`🔓` » Ticket bleibt weiterhin offen')
                .setDescription('Das Ticket bleibt weiterhin geöffnet.')
                .setColor('Red');
        
            await interaction.update({
                embeds: [rejectEmbed],
                components: []
            });
        }    
        
        // Bann System
         if (interaction.isButton()) {
            if (interaction.customId === 'ticket_erledigt') {
                const mention = interaction.message.content
                const embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription("Danke für deine Meldung, wir haben es erledigt oder in Bearbeitung genommen.")
                
                interaction.reply({ content: mention, embeds: [embed] })
            }
            else if (interaction.customId === 'ticket_close_deny') {
                const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`${interaction.user} hat sich dazu entschieden nicht das Ticket zu schließen`)
                
                interaction.update({ embeds: [embed], components: [] })
            }
            else if (interaction.customId === 'ticket_close_accept') {
                const embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Das Ticket wird in \`5 Sekunden\` geschlossen.`)
                
                interaction.update({ embeds: [embed], components: [] })
                setTimeout(async () => {
                    await interaction.channel.delete();
                }, 5000);
            }
            else if (interaction.customId === 'ticket_schliessen') {
                const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle("`❓` » Schließ Anfrage")
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
                
                interaction.reply({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [buttons] })
            }
            else if (interaction.customId === 'gebannt-ticket') {
                const gebanntModal = new ModalBuilder()
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

                gebanntModal.addComponents(BanngrundInput, EntbannungsbeschreibungInput);

                await interaction.showModal(gebanntModal)
            }
        }
        
        if (interaction.isModalSubmit()) {
            if (interaction.customId === "gebannt-modal") {
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
                        .setLabel('✅ » Erledigt')
                        .setStyle(ButtonStyle.Success),
                        new ButtonBuilder()
                        .setCustomId('ticket_schliessen')
                        .setLabel('❌ » Schließen')
                        .setStyle(ButtonStyle.Secondary)
                    )
                    
                    const bannsupport = await interaction.guild.roles.cache.get('1209101841015504916')
                        
                    const bannEmbed = new EmbedBuilder()
                    .setTitle("`⛔` 𑁉 Entbannungsantrag")
                    .setDescription(
                        `Ein neuer Entbannungsantrag wurde erstellt.\n\n` +
                        `> \`📄\` » **Banngrund**\n${bannInfo}\n\n` +
                        `> \`📝\` » **Entbannungsbeschreibung**\n${bannDescription}\n\n` +
                        `> \`👤\` » **Antragsteller**\n<@${interaction.user.id}>\n\n` +
                        `> \`📅\` » **Erstellungsdatum**\n<t:${Math.floor(Date.now() / 1000)}:F>`
                    )
                    .setColor("Red")
                    .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })) // Profilbild des Users hinzufügen
                    .setFooter({ text: `» Antrag von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

                    channel.send({ content: `<@&${bannsupport.id}>`, embeds: [bannEmbed], components: [buttons] }).then(async msg => {

                        const InfoBannEmbed = new EmbedBuilder()
                            .setDescription(`\`✅\` » Du hast **erfolgreich** ein Ticket für deinen Entbannungsantrag erstellt, du kannst diesen hier erreichen: ${channel}`)
                            .setColor('Green');

                        interaction.reply({ embeds: [InfoBannEmbed], ephemeral: true })
                    })
                })
            }}
        
        // Partner System
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
                        .setMaxLength(4000)
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
        }

        if (interaction.isChatInputCommand() || interaction.type === 2 || interaction.type === 3) {

        const command = client.commands.get(interaction.commandName)

        if (command) {
            try {
                await command.execute(interaction)
                
            } catch (error) {
                console.error(error)

                if (interaction.deferred || interaction.replied) {
                    interaction.editReply({content: "> `❌` » Es ist ein Fehler beim ausführen aufgetreten!\n> `📌` » Bitte gebe einem Teammitglied bescheid oder Öffne ein Ticket im <#819555839362072606>", ephemeral: true })
                }
                else {
                    interaction.reply({content: "> `❌` » Es ist ein Fehler beim ausführen aufgetreten!\n> `📌` » Bitte gebe einem Teammitglied bescheid oder Öffne ein Ticket im <#819555839362072606>", ephemeral: true })
                }
            }
        }
        } else if (interaction.isAutocomplete()) {
                const command = interaction.client.commands.get(interaction.commandName);
              
                if (!command) return;
              
                try {
                  await command.autocomplete(interaction);
                } catch (error) {
                  console.error(error);
                }
        }
    }
}