import userdb from "../../models/userdb.js";
import config from "../../json/config.json" with { type: "json" };

export default {
    name: "emoji",
    description: "» Lege eine eigene Ping-Reaktion fest. 📌",
    type: 1,
    options: [
        {
            "type": 3,
            "name": "emoji",
            "description": "» Wähle bis zu 3 Emojis",
            "required": true
        }
    ],

        async run(client, interaction) {

        let hasRole = config.emojiroles.some(roleId => interaction.member.roles.cache.has(roleId));

        if(!hasRole) return interaction.reply({ content: '> `❌` » Du hast keine Berechtigte Rolle um diesen Befehl zu benutzen.', ephemeral: true })

        const emojisInput = await interaction.options.getString('emoji')
        const userData = await userdb.findOne({ userID: interaction.user.id })

        if (!userData) return;

        const emojiRegex = /<a?:[a-zA-Z0-9_]+:[0-9]+>/g;
        const emojis = await emojisInput.match(emojiRegex);

        if (!emojis) return interaction.reply({ content: '> `❗` » Bitte füge min. 1 Emoji hinzu.', ephemeral: true })
        if (emojis.length > 3) return interaction.reply({ content: '> `❌` » Du kannst nicht mehr als **3 Emojis** auswählen.', ephemeral: true })

        const emojiArray = emojis ? emojis.map(emoji => emoji.toString()) : [];

        await userdb.findOneAndUpdate({ userID: interaction.user.id }, { $set: { reactions: emojiArray } })
        await interaction.reply({ content: '> `✅` » Die Emojis wurden erfolgreich hinzugefügt.', ephemeral: true })
    }
}
