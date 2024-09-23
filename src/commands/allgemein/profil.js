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

        const roleGames = {
            'Roblox': 'Roblox',
            'Rocket League': 'Rocket League',
            'Grand Theft Auto V': 'Grand Theft Auto V',
            'Minecraft': 'Minecraft',
            'FIFA': 'FIFA',
            'League of Legends': 'League of Legends',
            'Valorant': 'Valorant',
            'Fortnite': 'Fortnite',
        };

        const rolePings = {
            'Umfragen': 'Umfragen',
            'Neuigkeiten': 'Neuigkeiten',
            'Gewinnspiel': 'Gewinnspiel',
            'Server-Events': 'Server-Events',
            'Changelog': 'Changelog',
            'Änderungen': 'Änderungen',
            'Dead Chat Ping': 'Dead Chat Ping',
            'Gratis Spiele': 'Gratis Spiele',
            'Gaming News': 'Gaming News',
            'Mediathek': 'Mediathek',
            'Welt News': 'Welt News',
        };

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

            const baseRoleName = getBaseRoleName(role.name);
            console.log(`Rolle gefunden: ${baseRoleName}`); // Debug-Ausgabe der gefundenen Rolle

            if (roleNationalität[baseRoleName]) {
                userNationalität = roleNationalität[baseRoleName];
            }
            if (roleGeschlecht[baseRoleName]) {
                userGeschlecht = roleGeschlecht[baseRoleName];
            }
            if (roleGames[baseRoleName]) {
                console.log(`Spielerolle gefunden: ${roleGames[baseRoleName]}`); // Debug-Ausgabe der Spiele-Rolle
                roleGamesList.push(`${role}`); // Spiele-Rollen als Erwähnung
            }
            if (rolePings[baseRoleName]) {
                rolePingsList.push(`${role}`); // Ping-Rollen als Erwähnung
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

