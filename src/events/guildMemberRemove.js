const { Events, EmbedBuilder } = require("discord.js");
const userdb = require("../../Datenbank/userdb");
const InviteCache = require("../../Datenbank/inviteCachedb");
const serverdb = require("../../Datenbank/serverdb");
const Coin = require("../../Datenbank/coinDB");

module.exports = {
  name: Events.GuildMemberRemove,
  async execute(member) {

    const serverData = await serverdb.findOne({ guildID: member.guild.id });
    if (!serverData) {return;}
    if (member.user.bot) {return;}
    if (serverData.deactivated.includes("willkommensnachrichten")) {return;}

    const leaveChannel = member.guild.channels.cache.get("1433189396475023380"); // gleicher Kanal wie Willkommen
    if (!leaveChannel) {return;}

    const contents = [
      `<a:leave:1433256832851251411> **${member.user.tag}** hat uns verlassen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat das Schiff verlassen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** ist verschwunden... <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat die Party verlassen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** ist in den Sonnenuntergang geritten. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** konnte dem Chaos nicht standhalten. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> Bye **${member.user.tag}** – vielleicht sieht man sich wieder. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** ist vom Server gefallen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat sich verabschiedet. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat das Abenteuer beendet. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> Oh nein! **${member.user.tag}** ist einfach gegangen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat den Server heimlich verlassen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat das Weite gesucht. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> Der Platz von **${member.user.tag}** ist nun leer... <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** ist durch ein Portal verschwunden. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat genug vom Abenteuer. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat sich aus dem Staub gemacht. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> Wir werden **${member.user.tag}** vermissen... <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat den Server verlassen <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** wurde vom Wind davongetragen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** ist gegangen, bevor die Party richtig losging. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat sich verabschiedet – vielleicht kommt er ja wieder? <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** hat einen eleganten Abgang hingelegt. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> **${member.user.tag}** konnte dem Ruf der Freiheit nicht widerstehen. <a:winken:1086560167442796544>`,
      `<a:leave:1433256832851251411> Und da war es nur noch einer weniger... **${member.user.tag}** ist gegangen. <a:winken:1086560167442796544>`,
    ];

    const rndContent = Math.floor(Math.random() * contents.length);
    await leaveChannel.send({ content: contents[rndContent] });

    const logchannel = member.guild.channels.cache.get("1263436406655680513");
    if (!logchannel) {return;}

    const leave = new EmbedBuilder()
      .setTitle("<:user_leave:1228329456079343731> | NUTZER VERLASSEN")
      .setDescription(`**${member.user.displayName}** hat den Server verlassen.\n\n\`📌\` | **INFORMATIONEN**\n> Username: ${member.user.username}\n> Anzeigename: ${member.user.displayName} (${member})\n> Nutzer-ID: \`${member.user.id}\`\n> Server beigetreten am: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n> Account erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
      .setColor("Red")
      .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
      .setTimestamp();

    const thread = logchannel.threads.cache.get("1269998215512457259");
    if (thread) {await thread.send({ embeds: [leave] });}

    // Lade alten Cache aus DB
    const inviteCacheData = await InviteCache.findOne({ guildID: member.guild.id });

    if (!inviteCacheData) {return;}

    // Suche den User, der ihn eingeladen hat
    const userDoc = await userdb.findOne({ userID: member.id });
    if (!userDoc) {return;}

    // Optional: Wer hat den User eingeladen?
    const inviterID = userDoc.invitedBy;
    if (!inviterID) {return;}

    await userdb.findOneAndUpdate(
      { userID: inviterID },
      { $inc: { "invites.left": 1 } },
    );

    // Nutzer-Daten abrufen und ggf. Einladungsdaten verarbeiten
    const userData = await userdb.findOne({ userID: member.user.id });
    if (userData) {
      // Wenn es einen Einlader gibt, erhöhe dessen "left" Invite-Zähler
      if (userData.invitedBy) {
        await userdb.findOneAndUpdate(
          { userID: userData.invitedBy },
          { $inc: { "invites.left": 1 } },
        );
      }

      // Nutzerdaten löschen
      await userData.deleteOne();
    }

    // Nachrichten des Users in bestimmtem Kanal löschen
    const CHANNEL_ID = "1172920281526960238";
    const channel = member.guild.channels.cache.get(CHANNEL_ID);
    if (!channel) {return console.log("Kanal nicht gefunden.");}

    try {
      const messages = await channel.messages.fetch();
      const userMessages = messages.filter(msg => msg.author.id === member.id);

      for (const [, msg] of userMessages) {
        await msg.delete();
        console.log(`Nachricht gelöscht von ${member.user.displayName}`);
      }
    } catch (error) {
      console.log("Fehler beim Abrufen oder Löschen von Nachrichten:", error);
    }

    try {
      const userId = member.id;
      const userData = await Coin.findOne({ userId });

      if (!userData) {
        console.log(`[DAILY-STREAK] Kein Eintrag für ${member.user.tag} gefunden.`);
        return;
      }

      // Nur Streak zurücksetzen
      userData.streak = 0;
      await userData.save();

      console.log(`[DAILY-STREAK] ${member.user.tag} (${userId}) hat den Server verlassen – Streak auf 0 gesetzt.`);
    } catch (error) {
      console.error("Fehler beim Zurücksetzen der Streak beim Verlassen des Servers:", error);
    }
  },
};
