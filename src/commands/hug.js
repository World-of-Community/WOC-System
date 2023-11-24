const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('» Umarme einen Freund von dir. 🤗')
        .addUserOption(option => option.setName('user').setDescription('Welchen User möchtest du umarmen?').setRequired(true)),
    async execute(interaction) {
        const huggifs = [
            'https://tenor.com/de/view/so-cute-aww-gif-26434851.gif',
            'https://tenor.com/de/view/hugs-cuddle-hug-gif-26074093.gif',
            'https://tenor.com/de/view/love-hug-gif-25661526.gif'
        ]
        const mitglied = await interaction.options.getUser('user')
        const gif = huggifs[Math.floor(Math.random() * huggifs.length)]
        await interaction.reply({
            content: `${mitglied}`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**${interaction.user}** hat **${mitglied}** umarmt. Einfach süß die beiden! <:dogsmiley:1037783082620698746>`)
                    .setImage(gif)
                    .setColor('Green')
                    .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            ]
        })

    }
}