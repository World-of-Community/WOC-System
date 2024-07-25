const { Events, ActivityType } = require("discord.js");
const fs = require('fs')

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (newPresence.guild.id !== config.server) return;
        const role = await newPresence.guild.roles.cache.get(config.vanityRole);
        const member = newPresence.member;
        const activities = member.presence.activities[0];

        if (activities && activities.state) {
            const state = activities.state;
            if (state.includes(`.gg/${config.vanity}`) || state.includes(`discord.gg/${config.vanity}`)) {
                await member.roles.add(role);
            } else {
                if (member.roles.cache.get(role.id)) {
                    await member.roles.remove(role);
                }
            }
        }

        // Stream Rolle System
        const ROLE_ID = '1266095218239995968'; // Die ID der Rolle, die zugewiesen werden soll

        const streamMember = newPresence.streamMember;
        const streamingRole = newPresence.guild.roles.cache.get(ROLE_ID);

        if (!streamingRole) {
            console.log('Streaming Rolle nicht gefunden.');
            return;
        }

        const isStreaming = newPresence.activities.some(activity => Activity.type === 'STREAMING');

        if (isStreaming) {
            if (!steamMember.roles.cache.has(ROLE_ID)) {
                await streamMember.roles.add(ROLE_ID);
                console.log(`Rolle hinzugefügt zu ${streamMember.user.displayName}`);
            }
        } else {
            if (streamMember.roles.cache.has(ROLE_ID)) {
                await streamMember.roles.remove(ROLE_ID);
                console.log(`Rolle entfernt von ${streamMember.user.displayName}`);
            }
        }
    }
}