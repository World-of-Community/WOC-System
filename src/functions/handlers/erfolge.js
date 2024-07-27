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


    client.once('ready', async () => {
      console.log(`Logged in as ${client.user.tag}!`);
  
      const guild = await client.guilds.fetch(815919809379172354);
      const members = await guild.members.fetch();
  
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
      members.forEach(member => {
          if (member.joinedAt <= oneYearAgo && !member.roles.cache.has(972193356333604874)) {
              member.roles.add(972193356333604874).then(() => {
                  console.log(`Added role to ${member.user.tag}`);
              }).catch(console.error);
          }
      });
  });
  
    /*
    //1 Jahr Server mitglied
    cron.schedule("0 0 * * *", async () => {
      const guild = await client.guilds.fetch("815919809379172354");
      if (!guild) return console.error('Guild wurde nicht gefunden.');
  
      await guild.members.cache.forEach(async (member) => {
          if (!member.roles.cache.has(972193356333604874)) {
              try {
                  if(member.joinedAt)
                  await member.roles.add(972193356333604874);
              } catch (err) {
                  console.error('Fehler beim Entfernen der Rolle:', err);
              }
          }
      });
      */
 // });

    //10 Vorschläge (Accepted)
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
          user.send(
            "> `✅` Glückwunsch! Du hast 10 akzeptierte Vorschläge erreicht!"
          );
        }
      }
    });
  };
};
