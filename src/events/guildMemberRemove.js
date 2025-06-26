const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const client = require('../index');
const fs = require('fs');
const config = JSON.parse(fs.readFileSync('src/json/config.json', 'utf-8'));
const userdb = require("../../Datenbank/userdb");
const inviteCache = require("../../Datenbank/inviteCachedb");

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {

        const guild = member.guild;
        const newInvites = await member.guild.invites.fetch();
        const Invites = await guild.invites.fetch();

        // Lade alten Cache aus DB
        let InviteCache = await InviteCache.findOne({ guildID: member.guild.id });
        
        if (!inviteCache) return;
    
        // Suche den User, der ihn eingeladen hat
        const userDoc = await User.findOne({ userID: member.id });
        if (!userDoc) return;
    
        // Optional: Wer hat den User eingeladen?
        const inviterID = userDoc.invitedBy;
        if (!inviterID) return;
    
        await User.findOneAndUpdate(
          { userID: inviterID },
          { $inc: { 'invites.left': 1 } }
        );

        const logchannel = member.guild.channels.cache.get("1263436406655680513");
        if (!logchannel) return;

        const leave = new EmbedBuilder()
            .setTitle('<:user_leave:1228329456079343731> | NUTZER VERLASSEN')
            .setDescription(`**${member.user.displayName}** hat den Server verlassen.\n\n\`📌\` | **INFORMATIONEN**\n> Username: ${member.user.username}\n> Anzeigename: ${member.user.displayName} (${member})\n> Nutzer-ID: \`${member.user.id}\`\n> Server beigetreten am: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n> Account erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
            .setColor('Red')
            .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
            .setTimestamp();

        const thread = logchannel.threads.cache.get("1269998215512457259");
        if (thread) await thread.send({ embeds: [leave] });

        // Nutzer-Daten abrufen und ggf. Einladungsdaten verarbeiten
        const userData = await userdb.findOne({ userID: member.user.id });
        if (userData) {
            // Wenn es einen Einlader gibt, erhöhe dessen "left" Invite-Zähler
            if (userData.invitedBy) {
                await userdb.findOneAndUpdate(
                    { userID: userData.invitedBy },
                    { $inc: { 'invites.left': 1 } }
                );
            }

            // Nutzerdaten löschen
            await userData.deleteOne();
        }

        // Nachrichten des Users in bestimmtem Kanal löschen
        const CHANNEL_ID = '1172920281526960238';
        const channel = member.guild.channels.cache.get(CHANNEL_ID);
        if (!channel) return console.log('Kanal nicht gefunden.');

        try {
            const messages = await channel.messages.fetch();
            const userMessages = messages.filter(msg => msg.author.id === member.id);

            for (const [, msg] of userMessages) {
                await msg.delete();
                console.log(`Nachricht gelöscht von ${member.user.displayName}`);
            }
        } catch (error) {
            console.log('Fehler beim Abrufen oder Löschen von Nachrichten:', error);
        }
    }
}
