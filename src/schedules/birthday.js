import userdb from "#models/userdb.js";
import logger from "#core/logger.js";
import { GUILD_ID } from "#config";

const BIRTHDAY_ROLE_ID = "1244945910262399046";
const BIRTHDAY_CHANNEL_ID = "1243964646449483788";
const AGE_ROLE_U18 = "1199786765666500710";
const AGE_ROLE_18PLUS = "1199786814051979344";

const BIRTHDAY_QUOTES = [
  "Genieße die kleinen Dinge. Sie machen das Leben großartig!",
  "Durch dich wird die Welt ein besserer Ort, bleib wie du bist!",
  "Heute sollst Du dich einfach entspannen und alle deine Sorgen verbannen.",
  "Lass dich drücken, knuddeln und umarmen. Sollen alle deine Ziele, Wünsche und Träume in Erfüllung gehen. Du hast es verdient.",
];

export default {
  name: "birthday",
  cron: "0 0 * * *",

  async execute(client) {
    const today = new Date();
    const guild = client.guilds.cache.get(GUILD_ID);
    if (!guild) {return;}

    const birthdayRole = await guild.roles.fetch(BIRTHDAY_ROLE_ID);
    if (!birthdayRole) {
      logger.error("Birthday role not found");
      return;
    }

    for (const member of birthdayRole.members.values()) {
      await member.roles.remove(birthdayRole).catch((err) => logger.error(`Failed to remove birthday role from ${member.id}:`, err?.message));
    }

    const birthdayUsers = await userdb.find({ "birthday.tag": today.getDate(), "birthday.monat": today.getMonth() + 1 });
    if (birthdayUsers.length === 0) {return;}

    const list = [];
    for (const user of birthdayUsers) {
      try {
        const member = await guild.members.fetch(user.userID);

        if (user.birthday.jahr) {
          const age = today.getFullYear() - user.birthday.jahr;
          const ageRole = await guild.roles.fetch(age <= 18 ? AGE_ROLE_U18 : AGE_ROLE_18PLUS);
          if (ageRole) {await member.roles.add(ageRole);}
          list.push(`${member} (**${age}**)`);
        } else {
          list.push(`${member}`);
        }
        await member.roles.add(birthdayRole);
      } catch (error) {
        logger.error(`Birthday handling failed for ${user.userID}:`, error?.message ?? error);
      }
    }
    if (list.length === 0) {return;}

    const plural = list.length > 1;
    const names = plural ? `${list.slice(0, -1).join(", ")} und ${list.at(-1)}` : list[0];
    const quote = BIRTHDAY_QUOTES[Math.floor(Math.random() * BIRTHDAY_QUOTES.length)];

    const channel = client.channels.cache.get(BIRTHDAY_CHANNEL_ID);
    if (!channel) {return;}

    const message = await channel.send({
      content:
        `🎂 𑁉 ${names} ${plural ? "haben" : "hat"} **heute Geburtstag!** - <a:bier:1196502621427601498>\n` +
        `Wünscht dem **${plural ? "Mitgliedern" : "Mitglied"}** alles Gute! <a:2herzen:1196502635465932984>\n` +
        "Trage auch deinen Geburtstag ein mit `/birthday set` (**MIT JAHR** für eine Altersrolle!).\n" +
        `<a:Chat1:976129450112593990> × ${plural ? "Ihr habt" : "Du hast"} **2x MEHR XP** für Heute in allen Chats!\n` +
        `\`🪙\` × ${plural ? "Ihr bekommt" : "Du bekommst"} **10.000 Coins auf unserem Minecraft-Server** – ${plural ? "meldet euch" : "melde dich"} dazu im **Ticket-Support**!\n` +
        `*${quote}*`,
    });

    await message.react("<a:herzen:1394561549602914386>");
    await message.react("<a:Cool:915211628755169301>");
  },
};
