const { SlashCommandBuilder } = require("discord.js");
const userdb = require("../../Datenbank/userdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji-remove')
        .setDescription('» Entferne deine Ping-Reactions. 📌'),
    async execute(interaction) {
        const userData = await userdb.findOne({ userID: interaction.user.id })
        if (!userData) return;
        if (userData.reactions.length == 0) {
            return await interaction.reply({ content: '> `❌` » Du hast keine aktiven Emojis.', ephemeral: true })
        }
        await userdb.findOneAndUpdate({ userID: interaction.user.id }, { $set: { reactions: [] } })
        await interaction.reply({ content: '> `✅` » Die Emojis wurden erfolgreich entfernt.', ephemeral: true })
    }
}