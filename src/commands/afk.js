const { SlashCommandBuilder } = require("discord.js");
const userdb = require("../../Datenbank/userdb");

const afktexte = [
    'Die Tür vom Nachbarn mit Brettern zunageln. <a:Ping_Hammer:1077295673289998417>',
    'Lädt sich ein Update fürs Real Life herunter! <a:Ladevorgang:1077295605501661375>',
    'Mal schauen was der Tag so von sich bringt. <a:drink:967313385127542854>'
]

module.exports = {
    data: new SlashCommandBuilder()
        .setName("afk")
        .setDescription("» Zeige allen das du gerade abwesend (AFK) bist. ⌛")
        .addStringOption(option => option.setName('grund').setDescription('Setze einen Grund dafür, dass du AFK bist!').setRequired(false)),
    async execute(interaction) {

        const timestamp = Math.floor(interaction.createdTimestamp / 1000); // Zeitstempel im UNIX-Zeitformat
        const discordTimestamp = `<t:${timestamp}:R>`;
        const grund = await interaction.options.getString("grund") ?? afktexte[Math.floor(Math.random() * afktexte.length)];
        const userData = await userdb.findOne({ userID: interaction.user.id })
        if (!userData) { return await interaction.reply({ content: "No userdata found" }) }
        if (userData.afk) { return await interaction.reply({ content: "You are already AFK" }) }
        userData.afk = true
        userData.afkReason = grund
        userData.afkStamp = discordTimestamp
        await userData.save()
        await interaction.reply({
            content: `<:AFK:1021086267557023775> | ${interaction.user} **ist nun abwesend**: <a:Neuigkeiten:1018910061348798564>\n> ${grund.replace("*", "")}`
        })

        await interaction.member.setNickname(`AFK | ${interaction.member.displayName}`).catch((err) => { })
    }
}