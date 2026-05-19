import { EmbedBuilder, Events, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import erfolgDB from "../../../Datenbank/erfolgdb.js";
import vorschlagEmitter from "../../custom_events/vorschlag.js";
import { EventEmitter } from 'node:events';
const gewinnspielEmitter = new EventEmitter();
import cron from "node-cron";

export default (client) => {
  client.handleErfolg = async () => {

  // Intervall for Presence
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

          // Todo: Economy System einbinden. ~ @vxnsin
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
        const roletoAdd = await guild.roles.cache.get("972193356333604874");
            await members.forEach(member => {
              if (!member.bot && !member.roles.cache.has('972193356333604874') && member.joinedAt <= oneYearAgo) {
                    member.roles.add(roletoAdd).then(() => {

                        const oneYearEmbed = new EmbedBuilder()
                        .setTitle("<a:checkgreen:1154702583202578472> 𑁉 ERFOLG ERHALTEN")
                        .setDescription('`💕`**-lichen Glückwunsch zu diesem Erfolg!** Das war bestimmt ein steiniger Weg, aber endlich hast du dir diesen Erfolg mehr als verdient!\n\n<:Pfeil:1119709908540076124> **Erfolg freigeschaltet:** `💖〢 1 Jahr Server-Mitglied`\n<:PfeilBlau:1119711275014955080> Stell dir vor, heute vor exakt einem Jahr bist du unserer Community beigetreten! Dafür wollten wir uns bei dir bedanken. ❤️')
                        .setColor("Green")
                        .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269339821495681116/WOC_Banner_Server_Erfolg_Erhalten.png?ex=66bedd94&is=66bd8c14&hm=d764c1b8be0977c7068a86366b3e411e95c679a4cd5ccf3be54192879c5fa337&')
                        .setFooter({ text: `» Erfolg freigeschaltet auf ${guild.name}`, iconURL: `${guild.iconURL()}` })
                        .setTimestamp();

                        member.send({ content: "<a:Cool:915211628755169301> **ERFOLG FREIGESCHALTET!** <a:Cool:915211628755169301>", embeds: [oneYearEmbed] });

                        const now = new Date();

                        const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
                        const tagName = tage[now.getDay()];

                        const tag = now.getDate().toString().padStart(2, '0');
                        const monat = (now.getMonth() + 1).toString().padStart(2, '0');
                        const jahr = now.getFullYear();

                        const stunde = now.getHours().toString().padStart(2, '0');
                        const minute = now.getMinutes().toString().padStart(2, '0');

                        const datumUhrzeit = `${tagName}, ${tag}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;
                        console.log(`Rolle hinzugefügt zu ${member.user.displayName} - ${member.user.username}`);
                        console.log(`Datum: ${datumUhrzeit}`);
                    }).catch(console.error);
                }
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
              .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269339821495681116/WOC_Banner_Server_Erfolg_Erhalten.png?ex=66bedd94&is=66bd8c14&hm=d764c1b8be0977c7068a86366b3e411e95c679a4cd5ccf3be54192879c5fa337&')
              .setFooter({ text: `» Erfolg freigeschaltet auf ${guild.name}`, iconURL: `${guild.iconURL()}` })
              .setTimestamp();
          user.send({ content: "<a:Cool:915211628755169301> **ERFOLG FREIGESCHALTET!** <a:Cool:915211628755169301>", embeds: [embed] });
        }
      }
    });

    // Gewinnspiel Gewinner (Accepted)
    gewinnspielEmitter.on("win", async (inter) => {
      const channel = inter.channel;
      const message = await inter.channel.fetchStarterMessage();
      const gewinnspielEmbed = message.embeds[0];

      const footerText = gewinnspielEmbed.footer.text;
      const regex = /»\s+(\d{17,19})$/;
      const userIDMatch = footerText.match(regex);
      const userID = userIDMatch ? userIDMatch[1] : null;

      if (!userID) {
        console.log("Fehler bei der Verarbeitung der UserID:", err);
        return;
      }

      // Rolle hinzufügen und Erfolg speichern
      let userErfolge = await erfolgDB.findOne({ userID: userID });

      if (!userErfolge) {
        // Wenn der Benutzer noch keinen Datensatz hat, erstellen
        userErfolge = new erfolgDB({
          userID: userID,
          gewinnspiel: 0, // Anzahl gewonnener Gewinnspiele initialisieren
        });
      }

      // Überprüfen, ob der Benutzer bereits einen Gewinnspiel-Erfolg hat
      if (userErfolge.gewinnspiel >= 1) {
        return;
      }

      // Erfolg aktualisieren und speichern
      userErfolge.gewinnspiel += 1;
      await userErfolge.save();

      // Gewinnerrolle zuweisen
      const member = await inter.guild.members.fetch(userID);
      const gewinnerRole = inter.guild.roles.cache.find(r => r.id === '1124598019862573096');
      if (gewinnerRole && member) {
        await member.roles.add(gewinnerRole);
      }

      // DM mit Embed senden
      if (userErfolge.gewinnspiel === 1) { // Erfolg freigeschaltet
      const user = await inter.client.users.fetch(userID);
      if (user) {
        const embed = new EmbedBuilder()
        .setTitle('<a:checkgreen:1154702583202578472> 𑁉 ERFOLG ERHALTEN')
        .setDescription("» `💕`**-lichen Glückwunsch zum Gewinn des Gewinnspiels!**\n\n<:Pfeil:1119709908540076124> **Erfolg freigeschaltet:** `☘️ 〢 Glückspilz (Event-Gewinner)`\n<:PfeilBlau:1119711275014955080> Vielen Dank für deine Teilnahme und viel Glück beim nächsten Mal!\n\n<a:wocbook:1178664700469317692> » Schalte noch **mehr Erfolge** frei: https://discord.com/channels/815919809379172354/872063101640532008")
        .setColor("Green")
        .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269339821495681116/WOC_Banner_Server_Erfolg_Erhalten.png?ex=66bedd94&is=66bd8c14&hm=d764c1b8be0977c7068a86366b3e411e95c679a4cd5ccf3be54192879c5fa337&')
        .setFooter({ text: `» Erfolg freigeschaltet auf ${guild.name}`, iconURL: `${guild.iconURL()}` });
        await user.send({ content: "<a:Cool:915211628755169301> **GEWINNSPIEL ERFOLG FREIGESCHALTET!** <a:Cool:915211628755169301>", embeds: [embed] });
      }
     }
    })
  };
};
