const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");
const ms = require("ms");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profil')
        .setDescription('» Zeigt dir nützliche Stats über einen Account. 👤')
        .addUserOption(option => option.setName('mitglied').setDescription('Welches Profil möchtest du Abrufen?').setRequired(false)),

    async execute(interaction) {
        const member = await interaction.options.getMember('mitglied') || interaction.member


        const roleNationalität = {
            'Deutschland': ':flag_de:',
            'Österreich': ':flag_at:',
            'Schweiz': ':flag_ch:',
            'England': ':england:',
        };

        const roleGeschlecht = {
            'Männlich': ':male_sign:',
            'Weiblich': ':femal_sign:',
            'Divers': '❓'
        };

        const roleGames = {
            'Roblox': 'Roblox',
            'Rocket League': 'Rocket League',
            'GTA 5': 'GTA 5',
            'Minecraft': 'Minecraft',
            'FIFA': 'FIFA',
            'League of Legends': 'League of Legends',
            'VALORANT': 'Valorant',
            'Fortnite': 'Fortnite',
        };

        const rolePings = {
            'Umfragen': 'Umfragen',
            'Neuigkeiten': 'Neuigkeiten',
            'Änderungen': 'Änderungen',
            'Gewinnspiel': 'Gewinnspiel',
            'Event': 'Event',
            'Dead Chat': 'Dead Chat',
            'Changelog': 'Changelog',
            'Welt News': 'Welt News',
            'Gratis Spiele': 'Gratis Spiele',
            'Gaming News': 'Gaming News',
            'Mediathek': 'Mediathek',
        };

        let userNationalität = '❓';
        let userGeschlecht = '❓';
        let rolegamesList = [];
        let rolePingsList = [];

        const removeSymbols = (str) => {
            return str.replace(/[^\w\s]/gi, ''); // Entfernt alle nicht-alphanumerischen Zeichen
        };

        ember.roles.cache.forEach(role => {
            const cleanedRoleName = removeSymbols(role.name); // Rolle bereinigen
            
            if (roleNationalität[cleanedRoleName]) {
                userNationalität = roleNationalität[cleanedRoleName]; 
            }
            if (roleGeschlecht[cleanedRoleName]) {
                userGeschlecht = roleGeschlecht[cleanedRoleName]; 
            }
            if (roleGames[cleanedRoleName]) {
                rolegamesList.push(roleGames[cleanedRoleName]); 
            }
            if (rolePings[cleanedRoleName]) {
                rolePingsList.push(rolePings[cleanedRoleName]);
            }
        });

        if (member.user.bot) {
            return interaction.reply({ content: "> \`❌\` » Du kannst keine Statistiken über Bots abrufen!", ephemeral: true });
        }

        const userData = await userdb.findOne({ userID: member.id })

        if (userData) {
            const embed = new EmbedBuilder()
            .setTitle(`\`👤\` × ${member.user.displayName}'s Profil`)
            .setDescription(`» **Alle Statistiken** von \`${member.user.username}\`\n\n> \`👤\` **» SERVER PROFIL**\n\`📌\` » Geschlecht: ${userGeschlecht}\n\`📌\` » Land: ${userNationalität}\n\`🎮\` » Meine Spiele: ${rolegamesList.length > 0 ? rolegamesList.join(', ') : '**Keine Spiele**'}\n\`🔔\` » Server-Pings: ${rolePingsList.length > 0 ? rolePingsList.join(', ') : '**Keine Server-Pings**'}\n\n> \`🏆\` **» ALLE STATISTIKEN**\n\`🎁\` » Hat **${userData.giveaway.eventWins || '0'}** Events gewonnen\n\`📚\` » Du hast bereits \`${userData.giveaway.messages || '0'}\` Nachrichten versendet.\n\`🔊\` » \`${(userData.giveaway.voiceTime / (3.6e+6)).toFixed(0) || '0'} Stunden\` in Sprachkanälen verbracht.\n\n\`👥\` » Server-Mitglied seit: <t:${Math.floor(member.joinedTimestamp / 1000)}:f> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)\n\`⏰\` » Account erstellt am: <t:${Math.round(member.user.createdTimestamp / 1000)}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`)
            .setColor('Blurple')
            .setThumbnail(`${member.user.displayAvatarURL({ dynamic: true })}`)
            .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true })
        } else return await interaction.reply({ content: `> \`❌\` » Ich konnte keine Statistiken über ${member} finden.`, ephemeral: true })
    }
}
