import cron from "node-cron";
import client from "../index.js";
import userdb from "../models/userdb.js";
import logger from "../functions/logger.js";

// Birthday System
cron.schedule("0 0 * * *", async () => {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const guild = client.guilds.cache.get("815919809379172354");

  try {
    const birthdayUsers = await userdb.find({ "birthday.tag": day, "birthday.monat": month });
    const birthdayRole2 = await guild.roles.fetch("1244945910262399046");
    birthdayRole2.members.forEach(async member => {
      try {
        await member.roles.remove(birthdayRole2);
      } catch (removeError) {
        logger.error(`Fehler beim Entfernen der Rollen von Mitglied ${member.id}:`, removeError);
      }
    });

    if (birthdayUsers.length > 0) {
      const birthdayChannel = client.channels.cache.get("1243964646449483788");
      const birthdayUsersList = [];

      for (const user of birthdayUsers) {
        try {
          const member = await guild.members.fetch(user.userID);

          if (user.birthday.jahr) {
            const age = currentYear - user.birthday.jahr;
            let roleId;

            if (age <= 18) {roleId = "1199786765666500710";}
            else if (age > 18) {roleId = "1199786814051979344";}
            const birthdayRole = await guild.roles.fetch(roleId);

            if (birthdayRole) {
              await member.roles.add(birthdayRole);
            }
            birthdayUsersList.push(`${member} (**${age}**)`);
          } else {
            birthdayUsersList.push(`${member}`);
          }
          await member.roles.add(birthdayRole2);
        } catch (fetchError) {
          logger.error(`Fehler beim Verarbeiten des Mitglieds mit ID ${user.userID}:`, fetchError);
          continue;
        }
      }

      let birthdayMessage = "";

      if (birthdayUsersList.length === 1) {
        birthdayMessage = `${birthdayUsersList[0]} hat **heute Geburtstag!** - <a:bier:1196502621427601498>`;
      } else {
        const lastUser = birthdayUsersList.pop();
        birthdayMessage = `${birthdayUsersList.join(", ")} und ${lastUser} haben **heute Geburtstag!** - <a:bier:1196502621427601498>`;
      }

      const birthdayWords = [
        "Genieße die kleinen Dinge. Sie machen das Leben großartig!",
        "Durch dich wird die Welt ein besserer Ort, bleib wie du bist!",
        "Heute sollst Du dich einfach entspannen und alle deine Sorgen verbannen.",
        "Lass dich drücken, knuddeln und umarmen. Sollen alle deine Ziele, Wünsche und Träume in Erfüllung gehen. Du hast es verdient.",
      ];
      const randomIndex = Math.floor(Math.random() * birthdayWords.length);
      const selectedBirthdayWord = birthdayWords[randomIndex];

      const birthdaymessage = await birthdayChannel.send({
        content: `🎂 𑁉 ${birthdayMessage}\nWünscht dem **${birthdayUsersList.length > 1 ? "Mitgliedern" : "Mitglied"}** alles Gute! <a:2herzen:1196502635465932984>\nTrage auch deinen Geburtstag ein mit \`/birthday set\` (**MIT JAHR** für eine Altersrolle!).\n<a:Chat1:976129450112593990> × ${birthdayUsersList.length > 1 ? "Ihr habt" : "Du hast"} **2x MEHR XP** für Heute in allen Chats!\n\`🪙\` × ${birthdayUsersList.length > 1 ? "Ihr bekommt" : "Du bekommst"} **10.000 Coins auf unserem Minecraft-Server** – ${birthdayUsersList.length > 1 ? "meldet euch" : "melde dich"} dazu im **Ticket-Support**!\n*${selectedBirthdayWord}*`,
      });

      await birthdaymessage.react("<a:herzen:1394561549602914386>");
      await birthdaymessage.react("<a:Cool:915211628755169301>");

    }
  } catch (error) {
    logger.error("Fehler beim Verarbeiten der Geburtstage:", error);
  }
});
