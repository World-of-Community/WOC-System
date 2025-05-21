const { Events, ActivityType, EmbedBuilder } = require("discord.js");
const fs = require('fs');

const streamingUsers = new Map(); // Streaming-Daten für User: { intervalId, startTimestamp }

module.exports = {
    name: Events.PresenceUpdate,
    async execute(oldPresence, newPresence) {
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (newPresence.guild.id !== config.server) return;

        //const member = newPresence.member;
        //if (!member) return;
//
        //const role = newPresence.guild.roles.cache.get(config.vanityRole);
        //const streamerRole = newPresence.guild.roles.cache.get('1266095218239995968');
        //if (!role || !streamerRole) return console.log("❌ > Eine der Rollen wurde nicht gefunden");
//
        //// Vanity Link check
        //const activities = member.presence?.activities;
        //const customActivity = activities?.find(a => a.type === ActivityType.Custom);
//
        //if (customActivity?.state?.includes(`.gg/${config.vanity}`) || customActivity?.state?.includes(`discord.gg/${config.vanity}`)) {
        //    await member.roles.add(role).catch(() => {});
        //} else {
        //    if (member.roles.cache.has(role.id)) {
        //        await member.roles.remove(role).catch(() => {});
        //    }
        //}
//
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
            console.log(`Streamer-Rolle ${action} für ${member.user.displayName} (${member.user.username})`);
            console.log(`Datum: ${datumUhrzeit}`);
        }
    }
};
