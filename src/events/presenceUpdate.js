const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const fs = require('fs');

const streamingUsers = new Map(); // Falls noch nicht vorhanden, unbedingt hinzufügen!

module.exports = {
    name: Events.PresenceUpdate,
    async execute (oldPresence, newPresence) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (newPresence.guild.id !== config.server) return;

        const role = await newPresence.guild.roles.cache.get(config.vanityRole);
        const member = newPresence.member;
        const activities = member.presence?.activities?.[0];

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

        const streamingMember = newPresence.member;
        if (!streamingMember) return;

        // 1 = STREAMING
        const isStreamingReward = newPresence.activities.some(activity => activity.type === 1);

        if (isStreamingReward && !streamingUsers.has(streamingMember.id)) {
            const intervalId = setInterval(async () => {
                const coins = Math.floor(Math.random() * 4) + 1;

                const embed = new EmbedBuilder()
                    .setTitle('🎥 Streaming-Belohnung')
                    .setDescription(`Du hast **${coins} Coins** für deinen Stream erhalten!\n\n📨 Bitte melde dich im [Ticket Support](https://discord.com/channels/815919809379172354/819555839362072606) von World Of Community um die Coins auf dein Coin-Konto zu erhalten. (Bitte mache von dieser Nachricht einen Screenshot.)`)
                    .setColor('Purple')
                    .setFooter({ text: 'Bleib weiter live für mehr Coins!' });

                try {
                    await streamingMember.send({ embeds: [embed] });
                } catch (err) {
                    console.log(`(Streaming-Belohnung) Konnte ${streamingMember.user.username} keine DM senden.`);
                }
            }, 5 * 60 * 1000);

            streamingUsers.set(streamingMember.id, intervalId);
        }

        if (!isStreamingReward && streamingUsers.has(streamingMember.id)) {
            clearInterval(streamingUsers.get(streamingMember.id));
            streamingUsers.delete(streamingMember.id);
        }

        // Streamer Rollen System
        const streamer_role = newPresence.guild.roles.cache.get('1266095218239995968');
        if (!streamer_role) return console.log("❌ > presenceUpdate > \"Streamer Rolle\" wurde nicht gefunden");

        const isStreamingRole = newPresence.activities.some(activity => activity.type === ActivityType.Streaming);

        if (isStreamingRole) {
            if (!member.roles.cache.has(streamer_role.id)) {
                await member.roles.add(streamer_role);
                const now = new Date();
                const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
                const tagName = tage[now.getDay()];
                const tag = now.getDate().toString().padStart(2, '0');
                const monat = (now.getMonth() + 1).toString().padStart(2, '0');
                const jahr = now.getFullYear();
                const stunde = now.getHours().toString().padStart(2, '0');
                const minute = now.getMinutes().toString().padStart(2, '0');
                const datumUhrzeit = `${tagName}, ${tag}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;
                console.log(`Streamer-Rolle hinzugefügt zu ${member.user.displayName} (${member.user.username})`);
                console.log(`Datum: ${datumUhrzeit}`);
            }
        } else {
            if (member.roles.cache.has(streamer_role.id)) {
                await member.roles.remove(streamer_role);
                const now = new Date();
                const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
                const tagName = tage[now.getDay()];
                const tag = now.getDate().toString().padStart(2, '0');
                const monat = (now.getMonth() + 1).toString().padStart(2, '0');
                const jahr = now.getFullYear();
                const stunde = now.getHours().toString().padStart(2, '0');
                const minute = now.getMinutes().toString().padStart(2, '0');
                const datumUhrzeit = `${tagName}, ${tag}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;
                console.log(`Streamer-Rolle entfernt von ${member.user.displayName} (${member.user.username})`);
                console.log(`Datum: ${datumUhrzeit}`);
            }
        }
    }
};
