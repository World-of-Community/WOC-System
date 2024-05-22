const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('brofist')
        .setDescription('» Verbünde dich mit deinem Bro. 👊')
        .addUserOption(option => option.setName('user').setDescription('Verbünde dich offiziell mit deinem besten Freund.').setRequired(true)),
        
    async execute(interaction) {
        const brofistgifs = [
            'https://tenor.com/de/view/ken-ryu-brofist-street-fighter-gif-9219109.gif',
            'https://tenor.com/de/view/bro-gif-26275846.gif',
            'https://tenor.com/de/view/free-anime-rin-matsuoka-sousuke-gif-18204553.gif',
            'https://tenor.com/de/view/army-fist-bump-friendship-army-of-two-the-devils-cartel-gif-6195745.gif',
            'https://tenor.com/de/view/bh187-conair-fist-bump-bro-bros-gif-19216041',
        ]
        const mitglied = await interaction.options.getUser('user')
        const gif = brofistgifs[Math.floor(Math.random() * brofistgifs.length)]
        await interaction.reply({
            content: `${mitglied}`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**${interaction.user}** hat mit **${mitglied}** eine Brofist vollzogen. Wie cool! <a:Cool:915211628755169301>`)
                    .setImage(gif)
                    .setColor('Aqua')
                    .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            ]
        })
    }
}