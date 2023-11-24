const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cringe')
        .setDescription('» Zeig jemanden, das er sich peinlich verhält. 😑')
        .addUserOption(option => option.setName('user').setDescription('Welcher User hat sich blamiert?').setRequired(true)),
    async execute(interaction) {
        const cringegifs = [
            'https://tenor.com/de/view/homer-simpson-goodbye-bye-disappears-hide-in-the-bushes-gif-3394899.gif',
            'https://tenor.com/de/view/pedro-monkey-puppet-meme-awkward-gif-15268759.gif',
            'https://tenor.com/de/view/awkward-silence-what-gif-13940581.gif'
        ]
        const mitglied = await interaction.options.getUser('user')
        const gif = cringegifs[Math.floor(Math.random() * cringegifs.length)]
        await interaction.reply({
            content: `${mitglied}`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**${interaction.user} findet **${mitglied}** echt peinlich.`)
                    .setImage(gif)
                    .setColor('Blue')
                    .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            ]
        })

    }
}