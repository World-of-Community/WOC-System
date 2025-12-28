const { SlashCommandBuilder } = require("discord.js");
const userdb = require("../../../Datenbank/userdb");

const afktexte = [
  "Die Tür vom Nachbarn mit Brettern zunageln. <a:Ping_Hammer:1077295673289998417>",
  "Lädt sich ein Update fürs Real Life herunter! <a:Ladevorgang:1077295605501661375>",
  "Mal schauen was der Tag so von sich bringt. <a:drink:967313385127542854>",
  "Ich bin eingeschlafen! Glaube ich... <:pepesleeping:1280964663391031397>",
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("afk")
    .setDescription("» Zeige allen das du gerade abwesend (AFK) bist. ⌛")
    .addStringOption(option => option.setName("grund").setDescription("Setze einen Grund dafür, dass du AFK bist!").setRequired(false)),

  async execute(interaction) {
    try {
      const timestamp = Math.floor(Date.now() / 1000); // Aktueller Zeitstempel in Sekunden
      const grund = interaction.options.getString("grund") || afktexte[Math.floor(Math.random() * afktexte.length)];

      // Datenbankabfrage oder Erstellung eines neuen Eintrags
      let userData = await userdb.findOne({ userID: interaction.user.id });
      if (!userData) {
        userData = new userdb({
          userID: interaction.user.id,
          afk: true,
          afkReason: grund,
          afkStamp: timestamp,
        });
      } else if (userData.afk) {
        return await interaction.reply({ content: "> `❌` » Du bist bereits AFK!", ephemeral: true });
      } else {
        userData.afk = true;
        userData.afkReason = grund;
        userData.afkStamp = timestamp;
      }

      await userData.save();

      await interaction.reply({ content: `<:AFK:1021086267557023775> | ${interaction.user} **ist nun abwesend**: <a:Neuigkeiten:1018910061348798564>\n> ${grund.replace("*", "")}` });

      await interaction.member.setNickname(`AFK | ${interaction.member.displayName}`).catch(() => {});

    } catch (error) {
      console.error("Fehler beim AFK-Setzen:", error);
      await interaction.reply({ content: "> `❌` » Fehler, Falls dieser Fehler sich wiederholt, Melde dies bitte im Support (<#819555839362072606>) ", ephemeral: true });
    }
  },
};
