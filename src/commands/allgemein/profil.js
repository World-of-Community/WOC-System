const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const userdb = require("../../Datenbank/userdb");
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
            'Österreich': 'Österreich',
            'Schweiz': 'Schweiz',
            'England': 'Englisch',
        };

        const roleGeschlecht = {
            'Männlich': 'Männlich',
            'Weiblich': 'Weiblich',
            'Divers': 'Divers'
        };

        const roleGames = {
            'Roblox': 'Roblox',
            'Rocket League': 'Rocket League',
            'GTA 5': 'GTA 5',
            'Minecraft': 'Minecraft',
            'FIFA': 'FIFA',
            'League of Legends': 'League of Legends',
            'VALORANT': 'VALORANT',
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

        member.roles.cache.forEach(role => {
            if (roleNationalität[role.name]) {
                userNationalität = roleNationalität[role.name]; 
            }
            if (roleGeschlecht[role.name]) {
                userGeschlecht = roleGeschlecht[role.name]; 
            }
            if (roleGames[role.name]) {
                rolegamesList.push(roleGames[role.name]); 
            }
            if (rolePings[role.name]) {
                rolePingsList.push(rolePings[role.name]);
            }
        });

        if (member.user.bot) {
            return interaction.reply({ content: "> \`❌\` » Du kannst keine Statistiken über Bots abrufen!", ephemeral: true });
        }

        const userData = await userdb.findOne({ userID: member.id })

        if (userData) {
            const embed = new EmbedBuilder()
            .setTitle(`\`👤\` × ${member.user.displayName}'s Profil`)
            .setDescription(`» **Alle Statistiken** von \`${member.user.username}\`\n\n> \`👤\` **» SERVER PROFIL**\n\`📌\` » Name: ${member.displayName}\n\`📌\` » Geschlecht: ${userGeschlecht}\n\`📌\` » Land: ${userNationalität}\n\`🎮\` » Meine Spiele: ${rolegamesList.length > 0 ? rolegamesList.join(', ') : '**Keine Spiele**'}\n\`🔔\` » Server-Pings: ${rolePingsList.length > 0 ? rolePingsList.join(', ') : '**Keine Server-Pings**'}\n\n> \`🏆\` **» ALLE STATISTIKEN**\n\`🎁\` » Hat **${userData.eventWins || '0'}** Events gewonnen\n\`📚\` » Du hast bereits \`${userData.messages || '0'}\` Nachrichten versendet.\n\`🔊\` » \`${(userData.voiceTime / (3.6e+6)).toFixed(0) || '0'} Stunden\` in Sprachkanälen verbracht.\n\n\`👥\` » Server-Mitglied seit: <t:${Math.floor(member.joinedTimestamp / 1000)}:f> (<t:${Math.round(member.joinedTimestamp / 1000)}:R>)\n\`⏰\` » Account erstellt am: <t:${Math.round(member.user.createdTimestamp / 1000)}> (<t:${Math.round(member.user.createdTimestamp / 1000)}:R>)`)
            .setColor('Blurple')
            .setThumbnail(`${member.user.displayAvatarURL({ dynamic: true })}`)
            .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true })
        } else return await interaction.reply({ content: `> \`❌\` » Ich konnte keine Statistiken über ${member} finden.`, ephemeral: true })
    }
}
