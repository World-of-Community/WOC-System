const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userdb = require('../../../Datenbank/userdb');
const { Coin, CoinConfig } = require("../../../Datenbank/coindb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('» Zeigt dir nützliche Stats über einen Account. 👤')
        .addUserOption(option => option.setName('mitglied').setDescription('» Welches Profil möchtest du Abrufen?').setRequired(false)),

    async execute(interaction) {
        const member = interaction.options.getMember('mitglied') || interaction.member;

        if (member.user.bot) {
            return interaction.reply({ content: "> `❌` » Du kannst keine Statistiken über Bots abrufen!", ephemeral: true });
        }

        const roleBundesland = {
            'Baden-Württemberg': 'Baden-Württemberg',
            'Bayern': 'Bayern',
            'Berlin': 'Berlin',
            'Brandenburg': 'Brandenburg',
            'Bremen': 'Bremen',
            'Hamburg': 'Hamburg',
            'Hessen': 'Hessen',
            'Mecklenburg-Vorpommern': 'Mecklenburg-Vorpommern',
            'Niedersachsen': 'Niedersachsen',
            'Nordrhein-Westfalen': 'Nordrhein-Westfalen',
            'Rheinland-Pfalz': 'Rheinland-Pfalz',
            'Saarland': 'Saarland',
            'Sachsen': 'Sachsen',
            'Sachsen-Anhalt': 'Sachsen-Anhalt',
            'Schleswig-Holstein': 'Schleswig-Holstein',
            'Thüringen': 'Thüringen',
        };

        const roleNationalität = {
            'Österreich': 'Österreich',
            'Schweiz': 'Schweiz',
            'Sonstiges': 'Sonstiges',
        }

        const roleGeschlecht = {
            'Männlich': ':male_sign:',
            'Weiblich': ':female_sign:',
            'Divers': ':heavy_equals_sign:',
        };

        const TeamRoleIds = [
            '959869691529154631', // Admin
            '893423428558782465', // Team-leitung
            '929349039433056276', // Developer
            '816985466230145044', // Sr-Moderator
            '815920052385480754', // Moderator
            '815920170371383366', // Supporter
            '1263645368441241700', // Builder
        ];

        const LeitungRoleIds = [
            '1399454355349835917', // Team Leitung
            '1154345358030282782', // Dev Leitung
            '1155080722466488351', // Support Leitung
            '1258773853249863734', // Builder Leitung
            '1269384021402714263', // Creator Leitung
            '1269383970349650087', // Clan Leitung
            '1175879013688954980', // Partner Leitung
            '1290377533984079923', // Social Media Leitung
            '1399156593802612908', // Content Leitung
            '1246368940318392411', // Event Leitung
            '1269370651500609586', // Bewerbung Leitung
            '1400183875774185554', // Emoji Quiz Leitung
        ];

        const ExklusivRoleIds = [
            '815920219247214644', // Creator
            '862708375698538507', // VIP
            '1249802165501952053', // Geldgeber (Sponsor)
            '946040266266144768', // Kooperation
            '1187144777595101225', // Server-Partner
            '1150753421339676722', // Minenarbeiter (Event)
            '1155235780541821009', // Designer
        ];

        const MitgliederRoleIds = [
            '815921105407574056', // Supreme
            '917826787977871441', // Premium
            '815920452337139733', // Legende
            '835775627721179167', // Diamond
            '835775556611997697', // Emerald
            '835775597446955048', // Episch
            '815920703067914290', // Mitglied
        ];

        const BundeslandRoleIds = [
            '1379411398827704362', // Baden-Württemberg
            '1379411504394141758', // Bayern
            '1379411613240528936', // Berlin
            '1379411641958924338', // Brandenburg
            '1379411675773538404', // Bremen
            '1379411700931104830', // Hamburg
            '1379411767452762233', // Hessen
            '1379411797353955379', // Mecklenburg-Vorpommern
            '1379411848482390128', // Niedersachsen
            '1379411880828735568', // Nordrhein-Westfalen
            '1379411970020605982', // Rheinland-Pfalz
            '1379412016447492096', // Saarland
            '1370492716001132699', // Sachsen
            '1379412047103660092', // Sachsen-Anhalt
            '1379412115240124517', // Schleswig-Holstein
            '1379412160194805810', // Thüringen
        ];

        const NationalitätRoleIds = [
            '848163749637914674', // Österreich
            '848163753139896330', // Schweiz
            '1127923622653210654', // Sonstiges
        ];

        const GeschlechtRoleIds = [
            '848173921630945320', // Männlich
            '848173917767991377', // Weiblich
            '870646828348080159', // Divers 
        ];

        const GameRoleIds = [
            '1232072165654794281', // Roblox
            '1232066510554529905', // Rocket League
            '1232066545492955136', // Grand Theft Auto V
            '1232066588216135880', // Minecraft
            '1232066657896108082', // FIFA
            '1273369483951734866', // League of Legends
            '1232066632491208704', // Valorant
            '1232070141127426058', // Fortnite
            '1300487353990647881', // Clash of Clans
        ];

        const PingRoleIDs = [
            '847805121839890463', // Umfragen Ping
            '848085701449744394', // Neuigkeiten Ping
            '870297686467817492', // Gewinnspiel Ping
            '870683971846041650', // Server-Events Ping
            '963838152815050763', // Änderungen Ping
            '1147093175186493490', // Changelog Ping
            '1246190426646642698', // Dead Chat Ping
            '1230568420240527462', // Gratis Spiele Ping 
            '1231257421016469596', // Gaming News Ping
            '1231257532844998666', // Mediathek Ping
        ];

        const LevelRoleIds = [
          "1258827226846199808", // Level 5
          "1258794944953319534", // Level 10
          "1258794479570124920", // Level 20
          "1258827956634128467", // Level 30
          "1258794405507240038", // Level 40
          "1258825144697360485", // Level 50
          "1258794321533075526", // Level 75
          "1258825307239219371", // Level 100
        ];

        // Initial Werte
        let userBundesland = '`❓`';
        let userNationalität = '`❓`';
        let userGeschlecht = '`❓`';
        let roleGamesList = [];
        let rolePingsList = [];
        let leitungRoleMentions = [];
        let teamRoleMention = '';
        let bundeslandRoleMention = '';
        let nationalitätRoleMention = '';
        let exklusivRoleMention = '';
        let memberRoleMention = '';
        let outputText = '';

        // Rollen-Prüfungen für Team, Bundesland, Nationalität, Exklusiv, Mitglied
        const hasTeamRole = TeamRoleIds.some(roleId => {
            if (member.roles.cache.has(roleId)) {
                teamRoleMention = `<@&${roleId}>`;
                return true;
            }
            return false;
        });

        const hasLeitungRole = LeitungRoleIds.some(roleId => {
            if (member.roles.cache.has(roleId)) {
                leitungRoleMentions.push(`<@&${roleId}>`);
                return true;
            }
            return false;
        });

        const hasBundeslandRole = BundeslandRoleIds.some(roleId => {
            if (member.roles.cache.has(roleId)) {
                bundeslandRoleMention = `<@&${roleId}>`;
                return true;
            }
            return false;
        });

        const hasNationalitätRole = NationalitätRoleIds.some(roleId => {
            if (member.roles.cache.has(roleId)) {
                nationalitätRoleMention = `<@&${roleId}>`;
                return true;
            }
            return false;
        });

        const hasExklusivRole = ExklusivRoleIds.some(roleId => {
            if (member.roles.cache.has(roleId)) {
                exklusivRoleMention = `<@&${roleId}>`;
                return true;
            }
            return false;
        });

        const hasMemberRole = MitgliederRoleIds.some(roleId => {
            if (member.roles.cache.has(roleId)) {
                memberRoleMention = `<@&${roleId}>`;
                return true;
            }
            return false;
        });

        // Level-Rollen anhand der ID erkennen
        const levelRoles = member.roles.cache
          .filter(role => LevelRoleIds.includes(role.id))
          .sort((a, b) => LevelRoleIds.indexOf(a.id) - LevelRoleIds.indexOf(b.id))
          .map(role => `<@&${role.id}>`);

        // Über alle Rollen iterieren, um spezifische Infos zu finden
        for (const role of member.roles.cache.values()) {
            if (role.name === '@everyone') continue;

            // Bundesland aus Mapping ermitteln
            if (BundeslandRoleIds.includes(role.id)) {
                userBundesland = roleBundesland[role.name] || `<@&${role.id}>`;
            }

            // Nationalität aus Mapping ermitteln
            if (NationalitätRoleIds.includes(role.id)) {
                userNationalität = roleNationalität[role.name] || '`❓`';
            }

            // Geschlecht aus Mapping ermitteln
            if (GeschlechtRoleIds.includes(role.id)) {
                userGeschlecht = roleGeschlecht[role.name] || '`❓`';
            }

            // Spiele-Rollen sammeln
            if (GameRoleIds.includes(role.id)) {
                roleGamesList.push(`<@&${role.id}>`);
            }

            // Ping-Rollen sammeln
            if (PingRoleIDs.includes(role.id)) {
                rolePingsList.push(`<@&${role.id}>`);
            }
        }

        // outputText bauen
        if (nationalitätRoleMention) {
            outputText = `- \`📌\` » Land: ${nationalitätRoleMention}`;
        } else if (bundeslandRoleMention) {
            outputText = `- \`📌\` » Bundesland: ${bundeslandRoleMention}`;
        } else if (userNationalität !== '❓') {
            outputText = `- \`📌\` » Land: ${userNationalität}`;
        } else if (userBundesland !== '❓') {
            outputText = `- \`📌\` » Bundesland: ${userBundesland}`;
        } else {
            outputText = `- \`📌\` » Land/Bundesland: \`❓\``;
        }

        // User-Daten abrufen
        const userData = await userdb.findOne({ userID: member.id }) || {
          giveaway: { eventWins: 0, messages: 0, voiceTime: 0 },
          invites: { joins: 0, left: 0, bonus: 0 },
          onlineTime: 0,
          lastOnline: null
        };

        // lastOnline speichern, wenn offline/invisible
        await userdb.updateOne(
          { userID: member.id },
          { $set: { lastOnline: new Date() } },
          { upsert: true }
        );

        // Invite-Daten
        const invites = userData.invites || { joins: 0, left: 0, bonus: 0 };
        const inviteJoins = invites.joins || 0;
        const inviteBonus = invites.bonus || 0;
        const inviteLeft = invites.left || 0;
        const totalInvites = inviteJoins + inviteBonus - inviteLeft;

        // Suche nach den Coins des Benutzers in der Datenbank
        let memberCoins = await Coin.findOne({ userId: member.user.id });

        if (!memberCoins) {
          memberCoins = new Coin({
            userId: member.user.id,
            coins: 0
          });
          await memberCoins.save();
        }
        
        // Formatierung der Coins mit Tausendertrennzeichen
        const formattedCoins = memberCoins.coins.toLocaleString('de-DE');

        let lastOnlineText = '';

        const isOffline = !member.presence; // offline ODER unsichtbar
        
        if (isOffline && userData?.lastOnline) {
          const lastOnline = new Date(userData.lastOnline);
        
          if (!isNaN(lastOnline)) {
            const date = lastOnline.toLocaleDateString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });
        
            const time = lastOnline.toLocaleTimeString('de-DE', {
              hour: '2-digit',
              minute: '2-digit',
            });
        
            lastOnlineText =
              `- \`📅\` » Zuletzt online: \`${date} - ${time}\`\n`;
          }
        }

        // Embed
        const embed = new EmbedBuilder()
            .setTitle(`\`👤\` × ${member.user.displayName}'s Profil`)
            .setDescription(
                `» **Alle Statistiken** von \`${member.user.username}\`\n\n` +
                `> \`👤\` **» SERVER PROFIL**\n` +
                `- \`📌\` » Rang: ${hasTeamRole ? teamRoleMention : (hasExklusivRole ? exklusivRoleMention : (hasMemberRole ? memberRoleMention : 'Keine Rolle'))} ${leitungRoleMentions.length > 0 ? ` (${leitungRoleMentions.join(', ')})` : ''}\n` +
                `- \`📌\` » Geschlecht: ${userGeschlecht}\n` +
                `${outputText}\n` +
                `- \`⭐\` » Nutzer-Level: ${levelRoles.length > 0 ? levelRoles.join(', ') : '**Keine Levelrolle**'}\n` +
                `- \`🪙\` » Konto: **${formattedCoins} Coins**\n` +
                `- \`🎮\` » Meine Spiele: ${roleGamesList.length > 0 ? roleGamesList.join(', ') : '**Keine Spiele**'}\n` +
                `- \`🔔\` » Server-Pings: ${rolePingsList.length > 0 ? rolePingsList.join(', ') : '**Keine Server-Pings**'}\n\n` +
                `> \`📊\` **» ALLE STATISTIKEN**\n` +
                (lastOnlineText || '') + // wird nur angezeigt, wenn gesetzt
                `- \`🎁\` » Hat **${userData.giveaway.eventWins || '0'}** Events gewonnen\n` +
                `- \`📚\` » Du hast bereits \`${userData.giveaway.messages || '0'}\` Nachrichten versendet.\n` +
                `- \`🔊\` » \`${(userData.giveaway.voiceTime / 3600000).toFixed(0) || '0'} Stunden\` in Sprachkanälen verbracht.\n\n` +
                `\`📡\` » Du hast **${inviteJoins}** User eingeladen.\n` +
                `(\`${totalInvites}\` Gesamt, \`${inviteBonus}\` Bonus & \`${inviteLeft}\` Verlassen)\n\n`
            )
            .addFields(
                { name: '\`👥\` » Server-Mitglied seit:'
                    , value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:f> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)`, inline: false  },
                { name: '\`⏰\` » Account erstellt am:'
                    , value: `<t:${Math.round(member.user.createdTimestamp / 1000)}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`, inline: false
                 }
            )
            .addFields(
                { name: '\u200B', value: '> `📌` » Hinweis: Einige Daten können unvollständig sein, wenn der Nutzer kürzlich dem Server beigetreten ist oder Rollen geändert wurden.' }
            )
            .setColor('Blurple')
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
            .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        //// --- Adventskalender Button im Dezember ---
        //const now = new Date();
        //let components = [];
        //if (now.getMonth() === 11) { // Dezember
        //    const adventButton = new ButtonBuilder()
        //        .setCustomId('advent_progress')
        //        .setLabel('🎁 Adventskalender')
        //        .setStyle(ButtonStyle.Primary);
        //    components.push(new ActionRowBuilder().addComponents(adventButton));
        //}

        await interaction.reply({ embeds: [embed], ephemeral: true });

        //if (components.length>0){
        //    await interaction.reply({ embeds:[embed], components, ephemeral:true });
        //} else {
        //    await interaction.reply({ embeds:[embed], ephemeral:true });
        //}
    },
};
