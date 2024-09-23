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

        const roleNationalität = {
            'Deutschland': ':flag_de:',
            'Österreich': ':flag_at:',
            'Schweiz': ':flag_ch:',
            'England': ':england:',
        };

        const roleGeschlecht = {
            'Männlich': ':male_sign:',
            'Weiblich': ':female_sign:',
            'Divers': ':heavy_equals_sign:',
        };

        const GameRoleIds = [
            '1232072165654794281', // Roblox
            '1232066510554529905', // Rocket League
            '1232066545492955136', // Grand Theft Auto V
            '1232066588216135880', // Minecraft
            '1232066657896108082', // FIFA
            '1273369483951734866', // League of Legends
            '1232066632491208704', // Valorant
            '1232070141127426058', // Fortnite
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

        let userNationalität = '❓';
        let userGeschlecht = '❓';
        let roleGamesList = [];
        let rolePingsList = [];

        const getBaseRoleName = (roleName) => {
            const separator = '»';
            if (roleName.includes(separator)) {
                return roleName.split(separator)[1].trim();
            }
            return roleName.trim();
        };

        member.roles.cache.forEach(role => {
            if (role.name === '@everyone') return;
        
            // Überprüfe, ob die Rollen-ID in der Liste der Spiele-Rollen ist
            if (GameRoleIds.includes(role.id)) {
                roleGamesList.push(`${role}`); // Spiele-Rollen als Erwähnung hinzufügen
            }
            
            // Überprüfe, ob die Rollen-ID in der Liste der Ping-Rollen ist
            if (PingRoleIDs.includes(role.id)) {
                rolePingsList.push(`${role}`); // Ping-Rollen als Erwähnung hinzufügen
            }
        });
        
        

        // Hole die Einladungen des Mitglieds
        const invites = await interaction.guild.invites.fetch();
        const userInvites = invites.filter(invite => invite.inviter && invite.inviter.id === member.id);
        const inviteUses = userInvites.reduce((acc, invite) => acc + invite.uses, 0);
        const totalLeft = userInvites.reduce((acc, invite) => acc + (invite.maxUses - invite.uses), 0);
        const totalBonus = inviteUses - totalLeft;

        // Hole die User-Daten
        const userData = await userdb.findOne({ userID: member.id });

        if (userData) {
            const embed = new EmbedBuilder()
                .setTitle(`\`👤\` × ${member.user.username}'s Profil`)
                .setDescription(`» **Alle Statistiken** von \`${member.user.username}\`\n\n> \`👤\` **» SERVER PROFIL**\n- \`📌\` » Geschlecht: ${userGeschlecht}\n- \`📌\` » Land: ${userNationalität}\n- \`🎮\` » Meine Spiele: ${roleGamesList.length > 0 ? roleGamesList.join(', ') : '**Keine Spiele**'}\n- \`🔔\` » Server-Pings: ${rolePingsList.length > 0 ? rolePingsList.join(', ') : '**Keine Server-Pings**'}\n\n> \`🏆\` **» ALLE STATISTIKEN**\n- \`🎁\` » Hat **${userData.giveaway.eventWins || '0'}** Events gewonnen\n- \`📚\` » Du hast bereits \`${userData.giveaway.messages || '0'}\` Nachrichten versendet.\n- \`🔊\` » \`${(userData.giveaway.voiceTime / (3.6e+6)).toFixed(0) || '0'} Stunden\` in Sprachkanälen verbracht.\n\n\`📡\` » Du hast **${inviteUses}** User eingeladen.\n(\`${inviteUses}\` Gesamt, \`${totalBonus}\` Bonus & \`${totalLeft}\` Verlassen)\n\n\`👥\` » Server-Mitglied seit: <t:${Math.floor(member.joinedTimestamp / 1000)}:f> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)\n\`⏰\` » Account erstellt am: <t:${Math.round(member.user.createdTimestamp / 1000)}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`)
                .setColor('Blurple')
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ content: `> \`❌\` » Ich konnte keine Statistiken über ${member} finden.`, ephemeral: true });
        }
    },
};
