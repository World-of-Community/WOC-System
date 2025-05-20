const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const fs = require('fs');

const streamingUsers = new Map(); // Streaming-Daten für User: { intervalId, startTimestamp }

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
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
        const isStreamingReward = newPresence.activities.some(activity => activity.type === ActivityType.Streaming);

        if (isStreamingReward && !streamingUsers.has(streamingMember.id)) {
            // Startzeit merken und Interval starten
            const startTimestamp = Date.now();

            const intervalId = setInterval(async () => {
                const data = streamingUsers.get(streamingMember.id);
                if (!data) return;

                const streamingDurationMs = Date.now() - data.startTimestamp;
                const streamingDurationHours = streamingDurationMs / (1000 * 60 * 60);

                let coins;

                if (streamingDurationHours >= 3 && streamingDurationHours <= 5) {
                    // Ca. 2500 Coins in 5h -> ca. 42 Coins pro 5 Minuten (max 60 Intervalle)
                    coins = 42;
                } else {
                    // Normalbereich: 1-4 Coins
                    coins = Math.floor(Math.random() * 4) + 1;
                }

                const formattedCoins = coins.toLocaleString("de-DE");

                const embed = new EmbedBuilder()
                    .setTitle('🎥 Streaming-Belohnung')
                    .setDescription(`Du hast **${formattedCoins} Coins** für deinen Stream erhalten!\n\n📨 Bitte melde dich im [Ticket Support](https://discord.com/channels/815919809379172354/819555839362072606) von World Of Community um die Coins auf dein Coin-Konto zu erhalten. (Bitte mache von dieser Nachricht einen Screenshot.)`)
                    .setColor('Purple')
                    .setFooter({ text: 'Bleib weiter live für mehr Coins!' });

                try {
                    await streamingMember.send({ embeds: [embed] });
                } catch (err) {
                    console.log(`(Streaming-Belohnung) Konnte ${streamingMember.user.username} keine DM senden.`);
                }
            }, 5 * 60 * 1000);

            streamingUsers.set(streamingMember.id, { intervalId, startTimestamp });

        } else if (!isStreamingReward && streamingUsers.has(streamingMember.id)) {
            // Stream beendet, Interval stoppen und Daten löschen
            const data = streamingUsers.get(streamingMember.id);
            if (data && data.intervalId) clearInterval(data.intervalId);
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
