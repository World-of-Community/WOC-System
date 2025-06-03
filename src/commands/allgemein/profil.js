const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('» Zeigt dir nützliche Stats über einen Account. 👤')
        .addUserOption(option => option.setName('mitglied').setDescription('» Welches Profil möchtest du Abrufen?').setRequired(false)),

    async execute(interaction) {
        const member = interaction.options.getMember('mitglied') || interaction.member;

        if (member.user.bot) {
            return interaction.reply({ content: "> \`❌\` » Du kannst keine Statistiken über Bots abrufen!", ephemeral: true });
        }

        //const roleNationalität = {
        //    'Deutschland': ':flag_de:',
        //    'Österreich': ':flag_at:',
        //    'Schweiz': ':flag_ch:',
        //    'England': ':england:',
        //};

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
            'Österreich': 'Österreich',
            'Schweiz': '🇨Schweiz',
            'Sonstiges': 'Sonstiges',
        };

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

        const ExklusivRoleIds = [
            '815920219247214644', // Creator
            '862708375698538507', // VIP
            '1249802165501952053', // Geldgeber (Sponsor)
            '946040266266144768', // Kooperation
            '1187144777595101225', // Server-Partner
            '1150753421339676722', // Minenarbeiter (Event)
            '1155235780541821009', // Designer
        ]

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
            '1231257309313765396', // Welt News Ping
        ];

        let userBundesland = '❓';
        let userGeschlecht = '❓';
        let roleGamesList = [];
        let rolePingsList = [];
        let teamRoleMention = '';
        let bundeslandRoleMention = '';
        let exklusivRoleMention = '';
        let memberRoleMention = '';

        // Überprüfe, ob das Mitglied eine Teamrolle hat und erstelle eine Liste für Mitgliederrollen
        const hasTeamRole = TeamRoleIds.some(roleId => {
            const role = member.roles.cache.get(roleId); // Rolle abrufen
            if (role) {
                teamRoleMention = `<@&${roleId}>`; // Rolle als Erwähnung speichern
                return true;
            }
            return false;
        });
        const hasBundeslandRole = BundeslandRoleIds.some(roleId => {
            const role = member.roles.cache.get(roleId);
            if (role) {
                bundeslandRoleMention = `<@&${roleId}>`;
                return true;
            }
            return false;
        });
        const hasExklusivRole = ExklusivRoleIds.some(roleId => {
            const role = member.roles.cache.get(roleId); // Rolle abrufen
            if (role) {
                exklusivRoleMention = `<@&${roleId}>`; // Rolle als Erwähnung speichern
                return true;
            }
            return false;
        });
        const hasMemberRole = MitgliederRoleIds.some(roleId => {
            const role = member.roles.cache.get(roleId); // Rolle abrufen
            if (role) {
                memberRoleMention = `<@&${roleId}>`; // Rolle als Erwähnung speichern
                return true;
            }
            return false;
        });

        member.roles.cache.forEach(role => {
            if (role.name === '@everyone') return;

            // Bundesland zuweisen
            if (BundeslandRoleIds.includes(role.id)) {
                userBundesland = roleBundesland[role.name] || '❓';
            }

            // Überprüfe Geschlecht
            if (GeschlechtRoleIds.includes(role.id)) {
                userGeschlecht = roleGeschlecht[role.name] || '❓';
            }

            // Überprüfe, ob die Rollen-ID in der Liste der Spiele-Rollen ist
            if (GameRoleIds.includes(role.id)) {
                roleGamesList.push(`${role}`); // Spiele-Rollen als Erwähnung hinzufügen
            }

            // Überprüfe, ob die Rollen-ID in der Liste der Ping-Rollen ist
            if (PingRoleIDs.includes(role.id)) {
                rolePingsList.push(`${role}`); // Ping-Rollen als Erwähnung hinzufügen
            }
        });

        // User-Daten abrufen
        const userData = await userdb.findOne({ userID: member.id }) || {
            giveaway: {
                eventWins: 0,
                messages: 0,
                voiceTime: 0
            }
        };

        const badgeIcons = {
            "ActiveDeveloper": "https://discord.com/assets/4c4d9e6f2f5936f67e1c72d7ad5b7c6f.svg",
            "BugHunterLevel1": "https://discord.com/assets/f61c4a2b62ad6d5cbd00aa839a413ce9.svg",
            "BugHunterLevel2": "https://discord.com/assets/a22a6f99f6c5ef1e52a0f51fa2fe17db.svg",
            "CertifiedModerator": "https://discord.com/assets/f2ddfb0ff9d8e8d8b42675542ceab2f8.svg",
            "HypeSquadOnlineHouse1": "https://discord.com/assets/1cbd08c76f8af6dddce02c5138971129.svg", // Bravery
            "HypeSquadOnlineHouse2": "https://discord.com/assets/6e33a9a94e4c89b61bb28e8c56452b4c.svg", // Brilliance
            "HypeSquadOnlineHouse3": "https://discord.com/assets/f49e7c60891f3d66a6ef48ec4f62b752.svg", // Balance
            "Hypesquad": "https://discord.com/assets/01d8f5f41e50e3a8448d45b1ce2c68d7.svg",
            "Partner": "https://discord.com/assets/3ecb8b92c8e8013b7ef85cb8cb2435ff.svg",
            "PremiumEarlySupporter": "https://discord.com/assets/e04e152fdd9c2b4d17005e88ef86f125.svg",
            "Staff": "https://discord.com/assets/e3d2a5d289f07057fbc7d06a483b1e52.svg",
            "VerifiedDeveloper": "https://discord.com/assets/4c4d9e6f2f5936f67e1c72d7ad5b7c6f.svg"
        };

        const userFlags = await member.user.fetchFlags();
        const flagsArray = userFlags.toArray();
        
        const badgeImages = flagsArray.map(flag => {
            if (badgeIcons[flag]) {
                return `[](${badgeIcons[flag]})`; // Unsichtbares Zeichen als "Platzhalter" für das Badge-Bild
            }
        }).filter(Boolean).join("");
        
        const badgeDisplay = badgeImages || "**Keine Abzeichen**";

        // Invite System
        const invites = userData.invites || { joins: 0, left: 0, bonus: 0 };
        const inviteJoins = invites.joins || 0;
        const inviteBonus = invites.bonus || 0;
        const inviteLeft = invites.left || 0;
        const totalInvites = inviteJoins + inviteBonus - inviteLeft;

        if (userData) {
            const embed = new EmbedBuilder()
                .setTitle(`\`👤\` × ${member.user.displayName}'s Profil`)
                .setDescription(
                    `» **Alle Statistiken** von \`${member.user.username}\`\n\n` +
                    `> \`👤\` **» SERVER PROFIL**\n` +
                    `- \`📌\` » Rang: ${hasTeamRole ? teamRoleMention : (hasExklusivRole ? exklusivRoleMention : (hasMemberRole ? memberRoleMention : 'Keine Rolle'))}\n` +
                    `- \`📌\` » Abzeichen: ${badgeDisplay}\n` +
                    `- \`📌\` » Geschlecht: ${userGeschlecht}\n` +
                    `- \`📌\` » Bundesland: ${userBundesland}\n` +
                    `- \`🎮\` » Meine Spiele: ${roleGamesList.length > 0 ? roleGamesList.join(', ') : '**Keine Spiele**'}\n` +
                    `- \`🔔\` » Server-Pings: ${rolePingsList.length > 0 ? rolePingsList.join(', ') : '**Keine Server-Pings**'}\n\n` +
                    `> \`🏆\` **» ALLE STATISTIKEN**\n` +
                    `- \`🎁\` » Hat **${userData.giveaway.eventWins || '0'}** Events gewonnen\n` +
                    `- \`📚\` » Du hast bereits \`${userData.giveaway.messages || '0'}\` Nachrichten versendet.\n` +
                    `- \`🔊\` » \`${(userData.giveaway.voiceTime / (3.6e+6)).toFixed(0) || '0'} Stunden\` in Sprachkanälen verbracht.\n\n` +
                    `\`📡\` » Du hast **${inviteJoins}** User eingeladen.\n` +
                    `(\`${totalInvites}\` Gesamt, \`${inviteBonus}\` Bonus & \`${inviteLeft}\` Verlassen)\n\n` +
                    `\`👥\` » Server-Mitglied seit: <t:${Math.floor(member.joinedTimestamp / 1000)}:f> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)\n` +
                    `\`⏰\` » Account erstellt am: <t:${Math.round(member.user.createdTimestamp / 1000)}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`
                )
                .setColor('Blurple')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
                .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ content: `> \`❌\` » Ich konnte keine Statistiken über ${member} finden.`, ephemeral: true });
        }
    },
};
