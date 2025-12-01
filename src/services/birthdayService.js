const cron = require("node-cron");
const userdb = require("../../Datenbank/userdb");
const { Logger } = require("../utils");

/**
 * Birthday Service
 * Verwaltet das Geburtstags-System mit täglichen Benachrichtigungen
 */
class BirthdayService {
  constructor(client) {
    this.client = client;
    this.guildId = "815919809379172354";
    this.birthdayChannelId = "1243964646449483788";
    this.birthdayRoleId = "1244945910262399046";
    this.ageRoles = {
      under18: "1199786765666500710",
      over18: "1199786814051979344",
    };
  }

  /**
     * Startet den Birthday Service mit Cron-Job
     */
  start() {
    // Täglich um Mitternacht prüfen
    cron.schedule("0 0 * * *", async () => {
      await this.checkBirthdays();
    });

    Logger.success("Birthday Service gestartet");
  }

  /**
     * Prüft täglich nach Geburtstagen
     */
  async checkBirthdays() {
    try {
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const currentYear = today.getFullYear();

      const guild = this.client.guilds.cache.get(this.guildId);
      if (!guild) {
        Logger.error("Guild nicht gefunden für Birthday Service");
        return;
      }

      // Entferne alte Birthday-Rollen
      await this.removeOldBirthdayRoles(guild);

      // Finde Benutzer mit Geburtstag heute
      const birthdayUsers = await userdb.find({
        "birthday.tag": day,
        "birthday.monat": month,
      });

      if (birthdayUsers.length === 0) {return;}

      await this.celebrateBirthdays(guild, birthdayUsers, currentYear);
    } catch (error) {
      Logger.error("Fehler beim Prüfen der Geburtstage", error);
    }
  }

  /**
     * Entfernt Birthday-Rollen vom vorherigen Tag
     */
  async removeOldBirthdayRoles(guild) {
    try {
      const birthdayRole = await guild.roles.fetch(this.birthdayRoleId);
      if (!birthdayRole) {return;}

      const promises = birthdayRole.members.map(member =>
        member.roles.remove(birthdayRole).catch(err =>
          Logger.error(`Fehler beim Entfernen der Birthday-Rolle von ${member.id}`, err),
        ),
      );

      await Promise.all(promises);
    } catch (error) {
      Logger.error("Fehler beim Entfernen alter Birthday-Rollen", error);
    }
  }

  /**
     * Feiert Geburtstage und sendet Nachricht
     */
  async celebrateBirthdays(guild, birthdayUsers, currentYear) {
    try {
      const birthdayChannel = this.client.channels.cache.get(this.birthdayChannelId);
      if (!birthdayChannel) {
        Logger.error("Birthday-Kanal nicht gefunden");
        return;
      }

      const birthdayRole = await guild.roles.fetch(this.birthdayRoleId);
      const birthdayUsersList = [];

      for (const user of birthdayUsers) {
        try {
          const member = await guild.members.fetch(user.userID);

          // Füge Birthday-Rolle hinzu
          await member.roles.add(birthdayRole);

          // Berechne Alter und füge Altersrolle hinzu
          if (user.birthday.jahr) {
            const age = currentYear - user.birthday.jahr;
            await this.assignAgeRole(member, age, guild);
            birthdayUsersList.push(`${member} (**${age}**)`);
          } else {
            birthdayUsersList.push(`${member}`);
          }
        } catch (error) {
          Logger.error(`Fehler beim Verarbeiten des Birthday-Users ${user.userID}`, error);
        }
      }

      if (birthdayUsersList.length > 0) {
        await this.sendBirthdayMessage(birthdayChannel, birthdayUsersList);
      }
    } catch (error) {
      Logger.error("Fehler beim Feiern der Geburtstage", error);
    }
  }

  /**
     * Weist Altersrolle basierend auf Alter zu
     */
  async assignAgeRole(member, age, guild) {
    try {
      const roleId = age <= 18 ? this.ageRoles.under18 : this.ageRoles.over18;
      const ageRole = await guild.roles.fetch(roleId);

      if (ageRole) {
        await member.roles.add(ageRole);
      }
    } catch (error) {
      Logger.error(`Fehler beim Zuweisen der Altersrolle für ${member.id}`, error);
    }
  }

  /**
     * Sendet Birthday-Nachricht im Channel
     */
  async sendBirthdayMessage(channel, birthdayUsersList) {
    try {
      const birthdayMessage = this.formatBirthdayMessage(birthdayUsersList);
      const birthdayQuote = this.getRandomBirthdayQuote();

      const message = await channel.send({
        content: `🎂 𑁉 ${birthdayMessage}\nWünscht dem **${birthdayUsersList.length > 1 ? "Mitgliedern" : "Mitglied"}** alles Gute! <a:2herzen:1196502635465932984>\nTrage auch deinen Geburtstag ein mit \`/birthday set\` (**MIT JAHR** für eine Altersrolle!).\n*${birthdayQuote}*`,
      });

      await message.react("<a:herzen:1394561549602914386>");
      await message.react("<a:Cool:915211628755169301>");

      Logger.info(`Birthday-Nachricht gesendet für ${birthdayUsersList.length} Benutzer`);
    } catch (error) {
      Logger.error("Fehler beim Senden der Birthday-Nachricht", error);
    }
  }

  /**
     * Formatiert die Birthday-Nachricht
     */
  formatBirthdayMessage(birthdayUsersList) {
    if (birthdayUsersList.length === 1) {
      return `${birthdayUsersList[0]} hat **heute Geburtstag!** - <a:bier:1196502621427601498>`;
    } else {
      const lastUser = birthdayUsersList.pop();
      return `${birthdayUsersList.join(", ")} und ${lastUser} haben **heute Geburtstag!** - <a:bier:1196502621427601498>`;
    }
  }

  /**
     * Gibt zufälliges Birthday-Zitat zurück
     */
  getRandomBirthdayQuote() {
    const quotes = [
      "Genieße die kleinen Dinge. Sie machen das Leben großartig!",
      "Durch dich wird die Welt ein besserer Ort, bleib wie du bist!",
      "Heute sollst Du dich einfach entspannen und alle deine Sorgen verbannen.",
      "Lass dich drücken, knuddeln und umarmen. Sollen alle deine Ziele, Wünsche und Träume in Erfüllung gehen. Du hast es verdient.",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
}

module.exports = BirthdayService;
