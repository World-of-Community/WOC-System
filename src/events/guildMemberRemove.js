const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const client = require('../index');
const fs = require('fs')
const file = fs.readFileSync('src/json/config.json', 'utf-8');
const config = JSON.parse(file);
const userdb = require("../../Datenbank/userdb");

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
            const logchannel = await member.guild.channels.cache.get("1263436406655680513");

            const leave = new EmbedBuilder()
                .setTitle('<:user_leave:1228329456079343731> | NUTZER VERLASSEN')
                .setDescription(`**${member.user.displayName}** hat den Server verlassen.\n\n\`📌\` | **INFORMATIONEN**\n> Username: ${member.user.username}\n> Anzeigename: ${member.user.displayName}\n> Server beigetreten am: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\n> Account erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
                .setColor('Red')
                .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
                .setTimestamp();
                await logchannel.threads.cache.get("1269998215512457259").send({embeds: [leave]});

        const userData = await userdb.findOne({ userID: member.user.id })  
        if(!userData) return
        await userData.deleteOne()

        const CHANNEL_ID = '1172920281526960238'; 
        const channel = member.guild.channels.cache.get(CHANNEL_ID);
        if (!channel) return console.log('Kanal nicht gefunden.');

        try {
            const messages = await channel.messages.fetch();
            const userMessages = messages.filter(msg => msg.author.id === member.id);

            for (const [key, msg] of userMessages) {
                await msg.delete();
                console.log(`Nachricht gelöscht von ${member.user.displayName}`);
            }
        } catch (error) {
            console.log('Fehler beim Abrufen oder Löschen von Nachrichten:', error);
        }
    }
}