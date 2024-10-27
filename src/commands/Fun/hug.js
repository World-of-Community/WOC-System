const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hug')
        .setDescription('» Umarme einen Freund von dir. Keine Fremden, Weirdo. 🤗')
        .addUserOption(option => option.setName('user').setDescription('Welchen User möchtest du umarmen?').setRequired(true)),
        
    async execute(interaction) {
        const mitglied = await interaction.options.getUser('user')

        // Überprüfen, ob der Benutzer versucht, sich selbst zu auszulachen
        if (mitglied.id === interaction.user.id) {
            return interaction.reply({ content: "> `✅` - **Keine Umarmung?** Will dich niemand umarmen? Na komm, ich umarme dich 🤗" });
        }
        
        const huggifs = [
            'https://tenor.com/view/so-cute-aww-gif-26434851',
            'https://tenor.com/view/hugs-cuddle-hug-gif-26074093',
            'https://tenor.com/de/view/love-hug-gif-25661526.gif',
            'https://tenor.com/view/moumik-hug-hug-taptap-gif-12415073493272629445',
            'https://tenor.com/view/bear-huggin-gif-11575590786421661505',
            'https://tenor.com/view/laverne-and-shirley-funny-cool-gif-27491810',
            'https://tenor.com/view/hug-gif-13257363607371008844',
            'https://tenor.com/view/hug-warm-hug-depressed-hug-gif-4585064738068342394',
            'https://tenor.com/view/squeeze-hug-love-strong-hug-back-hug-gif-11515906677115499191',
        ]

        const gif = huggifs[Math.floor(Math.random() * huggifs.length)]
        
        await interaction.reply({
            content: `${mitglied}`,
            embeds: [
                new EmbedBuilder()
                    .setDescription(`**${interaction.user}** hat **${mitglied}** umarmt. Einfach süß die beiden! <:dogsmiley:1037783082620698746>`)
                    .setImage(gif)
                    .setColor('Green')
                    .setFooter({ text: "© Alle Fun-Befehle von WOC siehst du mit /help", iconURL: `${interaction.guild.iconURL()}` })
            ]
        })
    }
}