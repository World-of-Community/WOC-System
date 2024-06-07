const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('» Lass dir den Avatar eines Server-Mitglieds anzeigen. 👤')
        .addUserOption(option => option.setName('user').setDescription('Wähle einen User aus').setRequired(true)),
        
    async execute(interaction) {
        
        const texte = [
            '*Schon etwas einzigartig. :)*',
            '*Ich weiß nicht was ich davon halten soll...*',
            '*So wunderschön, besser geht es nicht. :)*',
            '*Dieser Avatar gefällt mir sehr!*',
            '*Kenne schon bessere Avatare.*'
        ]

        const text = texte[Math.floor(Math.random() * texte.length)]
        const user = await interaction.options.getUser('user')
        
        const avatarEmbed = new EmbedBuilder()
            .setTitle("Avatar von " + user.displayName)
            .setDescription(`${text}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
            .setColor('Blurple')
            .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: "https://cdn.discordapp.com/attachments/1145779055644393592/1151073428099575858/WOC_Orange.png" })
        
            interaction.reply({ embeds: [avatarEmbed] })
    }
}