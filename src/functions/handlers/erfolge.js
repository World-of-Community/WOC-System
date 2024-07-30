const {
  EmbedBuilder,
  Events,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  Permissions,
  interaction,
} = require("discord.js");
const erfolgDB = require("../../../Datenbank/erfolgdb");
const vorschlagEmitter = require("../../custom_events/vorschlag");
const cron = require("node-cron");

module.exports = (client) => {
  client.handleErfolg = async () => {

  //Intervall for Presence

    client.on("messageCreate", async (message) => {
      if (!message.guild || message.author.bot) return;

      try {
        let userAchievements = await erfolgDB.findOne({
          userID: message.author.id,
        });

        if (!userAchievements || !userAchievements.firstMessage) {
          await erfolgDB.findOneAndUpdate(
            { userID: message.author.id },
            { firstMessage: true },
            { upsert: true }
          );

          //Todo: Economy System einbinden. ~ @vxnsin
          const button = new ButtonBuilder()
            .setCustomId("first_message_reward" + message.author.id)
            .setLabel("» Belohnung abholen")
            .setStyle(ButtonStyle.Success)
            .setEmoji("968876390982234202");

          const actionRow = new ActionRowBuilder().addComponents(button);
          //await message.reply({ content: `Du hast so eben deine **erste Nachricht** geschrieben, Glückwunsch!`, components: [actionRow] });
        }
      } catch (err) {
        console.error("Fehler bei der Verarbeitung der ersten Nachricht:", err);
      }
    });


  
    // 1 Jahr Server mitglied
    cron.schedule("0 0 * * *", async () => {
      const guild = await client.guilds.fetch("815919809379172354");
      if (!guild) return console.error('Guild wurde nicht gefunden.');
  
        const members = await guild.members.fetch();

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const roletoAdd = await guild.roles.cache.find(role => role.id === "972193356333604874");
            await members.forEach(member => {
              if (!member.roles.cache.has(roletoAdd)) {
                if (member.joinedAt <= oneYearAgo) {
                    member.roles.add(roletoAdd).then(() => {
                        console.log(`Added role to ${member.user.tag}`);
                    }).catch(console.error);
                }}
            });
      });

    // 10 Vorschläge (Accepted)
    vorschlagEmitter.on("accept", async (inter) => {
      const channel = inter.channel;
      const message = await inter.channel.fetchStarterMessage();
      const vorschlagsembed = message.embeds[0];

      const footerText = vorschlagsembed.footer.text;
      const regex = /»\s+(\d{17,19})$/;
      const userIDMatch = footerText.match(regex);
      const userID = userIDMatch ? userIDMatch[1] : null;
      if (!userID) {
        console.error("Fehler bei der Verarbeitung des UserIDs:", err);
        return;
      }

      let userErfolge = await erfolgDB.findOne({ userID: userID });

      if (userErfolge.idee >= 10) {
        return;
      }

      userErfolge.idee += 1;
      await userErfolge.save();

      if (userErfolge.idee === 10) {
        const user = await inter.client.users.fetch(userID);
        if (user) {
          const embed = new EmbedBuilder()
              .setTitle('<a:checkgreen:1154702583202578472> 𑁉 ERFOLG ERHALTEN')
              .setDescription('» `💕`**-lichen Glückwunsch zu diesem Erfolg!**\n\n<:Pfeil:1119709908540076124> **Erfolg freigeschaltet:** `💡〢 Informant (10 Server-Ideen)`\n<:PfeilBlau:1119711275014955080> Vielen Dank dass du den Server und uns dabei unterstützt mit deinen Kreativen Ideen!\n\n<a:wocbook:1178664700469317692> » Schalte noch **mehr Erfolge** frei: https://discord.com/channels/815919809379172354/872063101640532008')
              .setColor('Green')
              .setImage('https://cdn.discordapp.com/attachments/815983648574275584/1267143249248649297/WOC_Banner_Server_Erfolg_Erhalten.jpg?ex=66a7b69d&is=66a6651d&hm=c96a175b36c826801303d40d10c22d1f7f25136616574a8f66edfc42d8d520f0&')
              .setFooter({ text: `» Erfolg freigeschaltet auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
              .setTimestamp();
          user.send({ content: "<a:Cool:915211628755169301> **ERFOLG FREIGESCHALTET!** <a:Cool:915211628755169301>", embeds: [embed] });
        }
      }
    });
  };
};
