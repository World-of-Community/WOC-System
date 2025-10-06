const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const userdb = require("../../Datenbank/userdb");

// Globale Map
const onlineMap = new Map();
const offlineMessages = new Map(); // Für Ticket-Bot-Nachrichten

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (newPresence.guild.id !== config.server) return;

        const member = newPresence.member;
        if (!member) return;

        const role = newPresence.guild.roles.cache.get(config.vanityRole);
        const streamerRole = newPresence.guild.roles.cache.get('1266095218239995968');
        if (!role || !streamerRole) return console.log("❌ > Eine der Rollen wurde nicht gefunden");

        const activities = member.presence?.activities;
        if (member.user.bot) return;

        // 🔹 Vanity-Link prüfen
        const customActivity = activities?.find(a => a.type === ActivityType.Custom);
        if (customActivity?.state?.includes(`.gg/${config.vanity}`) || customActivity?.state?.includes(`discord.gg/${config.vanity}`)) {
            await member.roles.add(role).catch(() => {});
        } else {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role).catch(() => {});
            }
        }

        // 🔹 Streamer-Rolle prüfen
        const isStreaming = activities?.some(a => a.type === ActivityType.Streaming);
        if (isStreaming) {
            if (!member.roles.cache.has(streamerRole.id)) {
                await member.roles.add(streamerRole).catch(() => {});
                logStreamerRoleChange('hinzugefügt', member);
            }
        } else {
            if (member.roles.cache.has(streamerRole.id)) {
                await member.roles.remove(streamerRole).catch(() => {});
                logStreamerRoleChange('entfernt', member);
            }
        }

        function logStreamerRoleChange(action, member) {
            const now = new Date();
            const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            const tagName = tage[now.getDay()];
            const tag = now.getDate().toString().padStart(2, '0');
            const monat = (now.getMonth() + 1).toString().padStart(2, '0');
            const jahr = now.getFullYear();
            const stunde = now.getHours().toString().padStart(2, '0');
            const minute = now.getMinutes().toString().padStart(2, '0');
            const datumUhrzeit = `${tagName}, ${tag}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;

            console.log(`📺  | Streamer-Rolle ${action} für ${member.user.displayName} (${member.user.username})`);
            console.log(`🕓  | Datum: ${datumUhrzeit}`);
        }

        // 🔹 Online-Zeit speichern
        const newStatus = newPresence.status ?? 'offline';
        if (newStatus === 'offline' || newStatus === 'invisible') {
            await userdb.updateOne(
                { userID: member.id },
                { $set: { lastOnline: new Date() } },
                { upsert: true }
            );
        }

        const userId = newPresence.user?.id;
        if (!userId || newPresence.user.bot) return;

        const oldStatus = oldPresence?.status || "offline";
        const onlineStatuses = ["online", "idle", "dnd"];

        if (!onlineStatuses.includes(oldStatus) && onlineStatuses.includes(newStatus)) {
            onlineMap.set(userId, Date.now());
        }

        if (onlineStatuses.includes(oldStatus) && !onlineStatuses.includes(newStatus)) {
            const start = onlineMap.get(userId);
            if (start) {
                const sessionTime = Date.now() - start;
                await userdb.updateOne(
                    { userID: userId },
                    { $inc: { onlineTime: sessionTime } },
                    { upsert: true }
                );
                onlineMap.delete(userId);
            }
        }

        // 🔹 Ticket-Support-Bot prüfen
        const BOT_ID = "1031487336783028274";
        const CHANNEL_IDS = [
            "819555839362072606", // Ticket Support
            "1006143436677726300" // Team Bewerben
        ];
        let lastStatus = null;

        if (!newPresence || newPresence.user?.id !== BOT_ID) return;
        const status = newPresence.status;

        // Wenn der Bot offline geht
        if (status === "offline" && lastStatus !== "offline") {
            for (const channelId of CHANNEL_IDS) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (!channel?.isTextBased()) continue;

                    const msg = await channel.send(
                        "⚠️ **Aktuell ist der Ticket Support offline.**\nWir bitten um Entschuldigung. Bitte nutze in der Zwischenzeit den **Schrift-Support**."
                    );
                    offlineMessages.set(channelId, msg);
                } catch (e) {
                    console.error(`Fehler beim Senden in Kanal ${channelId}:`, e);
                }
            }
        }

        // Wenn der Bot wieder online geht
        if (status === "online" && lastStatus === "offline") {
            for (const [channelId, msg] of offlineMessages.entries()) {
                try { await msg.delete(); } catch (e) {}
                offlineMessages.delete(channelId);

                setTimeout(async () => {
                    try {
                        const channel = await client.channels.fetch(channelId);
                        if (!channel?.isTextBased()) return;

                        const onlineMsg = await channel.send(
                            "✅ **Der Ticket Support ist nun wieder online!**"
                        );
                        setTimeout(() => onlineMsg.delete().catch(() => {}), 60_000);
                    } catch (e) {
                        console.error(`Fehler beim Senden der Online-Meldung in Kanal ${channelId}:`, e);
                    }
                }, 60_000);
            }
        }
    }
};

/*
const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const fs = require('fs');
const userdb = require("../../Datenbank/userdb");

// Globale Map
const onlineMap = new Map();

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (newPresence.guild.id !== config.server) return;

        const member = newPresence.member;
        if (!member) return;

        const role = newPresence.guild.roles.cache.get(config.vanityRole);
        const streamerRole = newPresence.guild.roles.cache.get('1266095218239995968');
        if (!role || !streamerRole) return console.log("❌ > Eine der Rollen wurde nicht gefunden");

        const activities = member.presence?.activities;

        if (member.user.bot) return;
        
        // Vanity-Link prüfen
        const customActivity = activities?.find(a => a.type === ActivityType.Custom);
        if (customActivity?.state?.includes(`.gg/${config.vanity}`) || customActivity?.state?.includes(`discord.gg/${config.vanity}`)) {
            await member.roles.add(role).catch(() => {});
        } else {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role).catch(() => {});
            }
        }
        
        if (!member || member.user.bot) return;
        
        const newStatus = newPresence.status ?? 'offline';
        
        if (newStatus === 'offline' || newStatus === 'invisible') {
          await userdb.updateOne(
            { userID: member.id },
            { $set: { lastOnline: new Date() } },
            { upsert: true }
          );
        }

        const userId = newPresence.user?.id;
        if (!userId || newPresence.user.bot) return;

        const oldStatus = oldPresence?.status || "offline";

        // Status, die als "online" zählen
        const onlineStatuses = ["online", "idle", "dnd"];

        // Wenn Nutzer jetzt online ist und vorher nicht
        if (!onlineStatuses.includes(oldStatus) && onlineStatuses.includes(newStatus)) {
            onlineMap.set(userId, Date.now());
        }

        // Wenn Nutzer offline/unsichtbar wird und vorher online war
        if (onlineStatuses.includes(oldStatus) && !onlineStatuses.includes(newStatus)) {
            const start = onlineMap.get(userId);
            if (!start) return;

            const sessionTime = Date.now() - start; // Millisekunden

            await userdb.updateOne(
                { userID: userId },
                { $inc: { onlineTime: sessionTime } },
                { upsert: true }
            );

            onlineMap.delete(userId);
        }

        const BOT_ID = "1031487336783028274"; // Bot-ID des Ticket-Support-Bots
        const CHANNEL_IDS = [
            "819555839362072606", // Ticket Support
            "1006143436677726300" // Team Bewerben
        ];
        let lastStatus = null;
        let offlineMessage = null; // Speichert die Offline-Nachricht
        
        if (!newPresence || newPresence.user?.id !== BOT_ID) return;
        const status = newPresence.status; // online, idle, dnd, offline
    
        // Wenn der Bot offline geht
        if (status === "offline" && lastStatus !== "offline") {
            for (const channelId of CHANNEL_IDS) {
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (!channel?.isTextBased()) continue;
    
                    const msg = await channel.send(
                        "⚠️ **Aktuell ist der Ticket Support offline.**\nWir bitten um Entschuldigung. Bitte nutze in der Zwischenzeit den **Schrift-Support**."
                    );
                    offlineMessages.set(channelId, msg);
                } catch (e) {
                    console.error(`Fehler beim Senden in Kanal ${channelId}:`, e);
                }
            }
        }

    // Wenn der Bot wieder online geht
    if (status === "online" && lastStatus === "offline") {
        for (const [channelId, msg] of offlineMessages.entries()) {
            try { await msg.delete(); } catch (e) {}
            offlineMessages.delete(channelId);

            // 1 Minute warten, dann Online-Meldung senden und nach 1 Minute löschen
            setTimeout(async () => {
                try {
                    const channel = await client.channels.fetch(channelId);
                    if (!channel?.isTextBased()) return;

                    const onlineMsg = await channel.send(
                        "✅ **Der Ticket Support ist nun wieder online!**"
                    );
                    setTimeout(() => onlineMsg.delete().catch(() => {}), 60_000);
                } catch (e) {
                    console.error(`Fehler beim Senden der Online-Meldung in Kanal ${channelId}:`, e);
                }
            }, 60_000);
        }

        // Streamer-Aktivität prüfen
        const isStreaming = activities?.some(a => a.type === ActivityType.Streaming);

        if (isStreaming) {
            if (!member.roles.cache.has(streamerRole.id)) {
                await member.roles.add(streamerRole).catch(() => {});
                logStreamerRoleChange('hinzugefügt', member);
            }
        } else {
            if (member.roles.cache.has(streamerRole.id)) {
                await member.roles.remove(streamerRole).catch(() => {});
                logStreamerRoleChange('entfernt', member);
            }
        }

        function logStreamerRoleChange(action, member) {
            const now = new Date();
            const tage = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
            const tagName = tage[now.getDay()];
            const tag = now.getDate().toString().padStart(2, '0');
            const monat = (now.getMonth() + 1).toString().padStart(2, '0');
            const jahr = now.getFullYear();
            const stunde = now.getHours().toString().padStart(2, '0');
            const minute = now.getMinutes().toString().padStart(2, '0');
            const datumUhrzeit = `${tagName}, ${tag}.${monat}.${jahr}, ${stunde}:${minute} Uhr`;

            console.log(`📺  | Streamer-Rolle ${action} für ${member.user.displayName} (${member.user.username})`);
            console.log(`🕓  | Datum: ${datumUhrzeit}`);
        }
    }
}};
*/

/*

const streamingUsers = new Map(); // Streaming-Daten für User: { intervalId, startTimestamp }

//// Streaming Belohnungssystem
        //const isStreaming = activities?.some(activity => activity.type === ActivityType.Streaming);
//
        //if (isStreaming && !streamingUsers.has(member.id)) {
        //    const startTimestamp = Date.now();
//
        //    const intervalId = setInterval(async () => {
        //        const data = streamingUsers.get(member.id);
        //        if (!data) return;
//
        //        const streamingDurationMs = Date.now() - data.startTimestamp;
        //        const totalMinutes = Math.floor(streamingDurationMs / (1000 * 60));
        //        const hours = Math.floor(totalMinutes / 60);
        //        const minutes = totalMinutes % 60;
//
        //        let coins;
        //        if (hours >= 3 && hours <= 5) {
        //            coins = 42;
        //        } else {
        //            coins = Math.floor(Math.random() * 4) + 1;
        //        }
//
        //        const formattedCoins = coins.toLocaleString("de-DE");
//
        //        const embed = new EmbedBuilder()
        //            .setTitle('🎥 Streaming-Belohnung')
        //            .setDescription(
        //                `Du hast **${formattedCoins} Coins** für deinen Stream erhalten!\n\n` +
        //                `⏱️ Streamdauer: **${hours} Stunden, ${minutes} Minuten**\n\n` +
        //                `📨 Bitte melde dich im [Ticket Support](https://discord.com/channels/815919809379172354/819555839362072606) ` +
        //                `von World Of Community, um die Coins auf dein Coin-Konto zu erhalten. (Bitte mache von dieser Nachricht einen Screenshot.)`
        //            )
        //            .setColor('Purple')
        //            .setFooter({ text: 'Bleib weiter live für mehr Coins!' });
//
        //        try {
        //            await member.send({ embeds: [embed] });
        //        } catch (err) {
        //            console.log(`(Streaming-Belohnung) Konnte ${member.user.username} keine DM senden.`);
        //        }
//
        //    }, 5 * 60 * 1000); // alle 5 Minuten
//
        //    streamingUsers.set(member.id, { intervalId, startTimestamp });
//
        //} else if (!isStreaming && streamingUsers.has(member.id)) {
        //    const data = streamingUsers.get(member.id);
        //    if (data?.intervalId) clearInterval(data.intervalId);
        //    streamingUsers.delete(member.id);
        //}

        // Streamer-Rollen-Verwaltung
        //if (isStreaming) {
        //    if (!member.roles.cache.has(streamerRole.id)) {
        //        await member.roles.add(streamerRole).catch(() => {});
        //        logStreamerRoleChange("hinzugefügt", member);
        //    }
        //} else {
        //    if (member.roles.cache.has(streamerRole.id)) {
        //        await member.roles.remove(streamerRole).catch(() => {});
        //        logStreamerRoleChange("entfernt", member);
        //    }
        //}
*/