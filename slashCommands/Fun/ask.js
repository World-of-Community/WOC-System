export default {
    name: "ask",
    description: "» Frage den magischen Bot etwas. ✨",
    type: 1,
    options: [
        {
            "type": 3,
            "name": "frage",
            "description": "Wie lautet deine Frage?",
            "required": true
        }
    ],

    async run(client, interaction) {

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
