import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('laugh')
        .setDescription('» Lache einen Freund aus. 😂')
        .addUserOption(option => option.setName('user').setDescription('Welchen User möchtest du auslachen?').setRequired(true)),

    async execute(interaction) {
        const mitglied = await interaction.options.getUser('user')

        // Überprüfen, ob der Benutzer versucht, sich selbst zu auszulachen
        if (mitglied.id === interaction.user.id) {
            return interaction.reply({ content: "> `❌` - **Seltsamer Move:** Du lachst dich selbst aus? Das finde ich seltsam. <a:what:1119708325962055720>" });
        }

        const laughgifs = [
            'https://tenor.com/de/view/funny-laughing-hysterically-crying-gif-21624342.gif',
            'https://tenor.com/de/view/el-risitas-juan-joya-borja-ratones-coloraos-laugh-meme-laughing-man-gif-24899295.gif',
            'https://tenor.com/de/view/laugh-gif-20137505.gif',
            'https://tenor.com/de/view/smile-laughing-laugh-gif-26377590.gif',
            'https://tenor.com/de/view/laughing-laugh-haha-happy-lol-gif-17298893.gif'
        ]

        const laughgif = laughgifs[Math.floor(Math.random() * laughgifs.length)]

        await interaction.reply({
            content: `${mitglied}`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`${interaction.user} lacht ${mitglied} aus. Autsch!`)
                    .setImage(laughgif)
                    .setColor('Orange')
                    .setFooter({ text: "Alle Fun-Befehle von WOC siehst du mit /help", iconURL: `${interaction.guild.iconURL()}` })
            ]
        })
    }
}
