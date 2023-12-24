const { SlashCommandBuilder } = require("discord.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName('verify')
    .setDescription('» Verifiziere dich mit Discord & Twitch. ✅')
    .addStringOption(option => option.setName('code').setDescription('Gebe hier deinen erhaltenen Verifizierungscode ein.').setRequired(true)),
}