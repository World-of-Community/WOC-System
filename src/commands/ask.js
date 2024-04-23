const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ask')
        .setDescription('» Frage den magischen Bot etwas. ✨')
        .addStringOption(option => option.setName('frage').setDescription('Wie lautet deine Frage?').setRequired(true)),
    async execute(interaction) {
        const texte = [
            'Also wenn das wahr ist dann bin ich weg...',
            'Huch! Das stimmt auf keinen Fall!',
            'Wenn du Meinst...',
            'Hoffentlich nicht!',
            'Ja, da gebe ich dir zu 100% Recht :)',
            'Nein oh bitte nicht, das darf nicht wahr sein!'
        ]
        const text = texte[Math.floor(Math.random() * texte.length)]
        await interaction.reply({
            content: `${text}`
        })
    }
}