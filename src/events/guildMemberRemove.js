const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const client = require('../index');
const fs = require('fs')
const file = fs.readFileSync('src/json/config.json', 'utf-8');
const config = JSON.parse(file);
const userdb = require("../../Datenbank/userdb");

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
            const leave = new EmbedBuilder()
                .setTitle('<:user_leave:1228329456079343731> | NUTZER VERLASSEN')
                .setColor('Red')
                .setDescription(`**${member.user.displayName}** hat den Server verlassen.\n\nServer beigetreten am: <t:${Math.floor(member.joinedTimestamp / 1000)}:F>\nAccount erstellt am: <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>`)
                .setTimestamp();
            const logChannel = await member.guild.channels.cache.get("886269505330896926");
            if (logChannel) await logChannel.send({ embeds: [leave] });

        const userData = await userdb.findOne({ userID: member.user.id })  
        await userData.deleteOne()
    }
}