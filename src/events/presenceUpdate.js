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
        
        client.on("presenceUpdate", async (oldPresence, newPresence) => {
            if (!newPresence || newPresence.user?.id !== BOT_ID) return;
            const status = newPresence.status; // online, idle, dnd, offline
        
            const channel = await client.channels.fetch(CHANNEL_ID);
            if (!channel || !channel.isTextBased()) return;
        
            // Wenn der Bot offline geht
            if (status === "offline" && lastStatus !== "offline") {
                offlineMessage = await channel.send(
                    "`❗` » **Aktuell ist der Ticket Support offline.**\nWir bitten um Entschuldigung. Bitte nutze in der Zwischenzeit den **Schrift-Support**."
                );
            }
        
            // Wenn der Bot wieder online geht
            if (status === "online" && lastStatus === "offline") {
                // Alte Offline-Nachricht löschen, falls vorhanden
                if (offlineMessage) {
                    try { await offlineMessage.delete(); } catch (e) {}
                    offlineMessage = null;
                }
        
                // 1 Minute warten und dann eine "wieder online"-Nachricht senden
                setTimeout(async () => {
                    const onlineMsg = await channel.send(
                        "> `✅` » **Der Ticket Support ist nun wieder online!**"
                    );
                    // Nachricht nach 1 Minute automatisch löschen
                    setTimeout(() => onlineMsg.delete().catch(() => {}), 60_000);
                }, 60_000);
            }
        
            lastStatus = status;
        });

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
};

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