const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const userdb = require("../../Datenbank/userdb");
const fs = require("fs")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji')
        .setDescription('» Lege eine eigene Ping-Reaktion fest. 📌')
        .addStringOption(option => option.setName('emoji').setDescription('» Wähle bis zu 3 Emojis').setRequired(true)),

        async execute(interaction) {

        const config = JSON.parse(fs.readFileSync("config.json", 'utf8'));

        let hasRole = config.emojiroles.some(roleId => member.roles.cache.has(roleId));

        if(!hasRole) return interaction.reply({ content: '> `❌` » Test', ephemeral: true })

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