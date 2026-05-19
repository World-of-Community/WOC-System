import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
    data: new SlashCommandBuilder()
        .setName('pat')
        .setDescription('» Streichelt ein braves Mitglied des Servers. 👋')
        .addUserOption(option => option.setName('user').setDescription('Welchen User möchtest du streicheln?').setRequired(true)),

    async execute(interaction) {
        const mitglied = await interaction.options.getUser('user')

        // Überprüfen, ob der Benutzer versucht, sich selbst zu streicheln
        if (mitglied.id === interaction.user.id) {
            return interaction.reply({ content: `🫂 | ${interaction.user} streichelt sich... selbst? <a:ehm:968876193828982854>` });
        }

        const patgifs = [
            'https://tenor.com/de/view/bunny-gif-4514864.gif',
            'https://tenor.com/de/view/good-boy-pat-on-head-stitch-gif-14742401.gif',
            'https://tenor.com/de/view/big-hero6-baymax-there-there-patting-head-pat-head-gif-4086973.gif'
        ]

        const gif = patgifs[Math.floor(Math.random() * patgifs.length)]

        await interaction.reply({
            content: `${mitglied}`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`${interaction.user} streichelt ${mitglied}. Wie niedlich! <a:pet_WOC:1120286364626333706>`)
                    .setImage(gif)
                    .setColor('Blurple')
                    .setFooter({ text: "Alle Fun-Befehle von WOC siehst du mit /help", iconURL: `${interaction.guild.iconURL()}` })
            ]
        })
    }
}
