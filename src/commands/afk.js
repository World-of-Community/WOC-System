const { SlashCommandBuilder } = require("discord.js");
const userdb = require("../../Datenbank/userdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("» Zeige allen das du gerade abwesend (AFK) bist. ⌛")
        .addStringOption(option => option.setName('grund').setDescription('Setze einen Grund dafür, dass du AFK bist!').setRequired(false)),
        async execute(interaction) {
        const userData = await userdb.findOne({ userID: interaction.user.id })
        if (!userData) { return await interaction.reply({ content: "No userdata found" }) }
        if (userData.afk) { return await interaction.reply({ content: "You are already AFK" }) }
        userData.afk = true
        await userData.save()
        await interaction.reply({ content: `<:AFK:1021086267557023775> | ${interaction.user} **ist nun abwesend**: <a:Neuigkeiten:1018910061348798564>` })
    }
}