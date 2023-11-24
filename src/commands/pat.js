const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('» Streichelt ein braves Mitglied des Servers. 👋')
        .addUserOption(option => option.setName('user').setDescription('Welchen User möchtest du streicheln?').setRequired(true)),
    async execute(interaction) {
        const patgifs = [
            'https://tenor.com/de/view/bunny-gif-4514864.gif',
            'https://tenor.com/de/view/good-boy-pat-on-head-stitch-gif-14742401.gif',
            'https://tenor.com/de/view/big-hero6-baymax-there-there-patting-head-pat-head-gif-4086973.gif'
        ]
        const mitglied = await interaction.options.getUser('user')
        const gif = patgifs[Math.floor(Math.random() * patgifs.length)]
        await interaction.reply({
            content: `${mitglied}`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**${interaction.user}** streichelt **${mitglied}**. Wie niedlich!`)
                    .setImage(gif)
                    .setColor('Purple')
                    .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            ]
        })

    }
}