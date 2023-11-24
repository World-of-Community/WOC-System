const { Events, ActivityType } = require("discord.js");
const fs = require('fs')

module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        console.log('Verbunden mit Discord')

        // Wechsel Status
        setInterval(async () => {
            const guild = await client.guilds.fetch(config.server);
            if (!guild) {
                console.log("Server wurde nicht gefunden");
                return;
            }

            await guild.members.fetch().then(async (members) => {
                const onlineMembers = await members.filter((member) => !member.user.bot);
                if (onlineMembers.size === 0) return;

                const randomMember = await onlineMembers.random();
                const username = randomMember.user.displayName;

                const customStatus = `💖 | mit ${username}`;
                await client.user.setActivity(customStatus, { type: ActivityType.Playing });
            })
            const onlineMembers = await guild.members.cache.filter(m =>
                m.presence?.status === 'online' ||
                m.presence?.status === 'idle' ||
                m.presence?.status === 'dnd'
            ).filter(member => !member.user.bot).size.toLocaleString() || 0
            const memberCount = await guild.members.cache.size.toLocaleString()

            await guild.channels.cache.get(config.category1).setName(`(🌍) - [INFOS] - (USER: ${memberCount})`)
            await guild.channels.cache.get(config.category2).setName(`(👥) - [UNITY] - (ONLINE: ${onlineMembers})`)
        }, 30000);

    }
}