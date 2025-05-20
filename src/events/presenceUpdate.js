const { Events, ActivityType } = require("discord.js");
const fs = require('fs')

module.exports = {
    name: Events.PresenceUpdate,
    async execute (oldPresence, newPresence) {
        
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

        const member = newPresence.member;
        if (!member) return;
      
        const isStreaming = newPresence.activities.some(activity => activity.type === 1); // 1 = STREAMING
      
        // Wenn User neu streamt
        if (isStreaming && !streamingUsers.has(member.id)) {
          const intervalId = setInterval(async () => {
            const coins = Math.floor(Math.random() * 4) + 1; // 1–4 Coins zufällig
      
            // ❗ Hier kannst du Coins z.B. in einer Datenbank speichern:
            // await db.addCoins(member.id, coins);
      
            // Sende DM mit Embed
            const embed = new EmbedBuilder()
              .setTitle('🎥 Streaming-Belohnung')
              .setDescription(`Du hast **${coins} Coins** für deinen Stream erhalten!\n\n📨 Bitte melde dich im [Ticket Support](https://discord.com/channels/815919809379172354/819555839362072606) von World Of Community um die Coins auf dein Coin-Konto zu erhalten. (Bitte mache von dieser Nachricht einen Screenshot.)`)
              .setColor('Purple')
              .setFooter({ text: 'Bleib weiter live für mehr Coins!' });
      
            try {
              await member.send({ embeds: [embed] });
            } catch (err) {
              console.log(`(Streaming-Belohnung) Konnte ${member.user.username} keine DM senden.`);
            }
          }, 5 * 60 * 1000); // ⏱️ Alle 5 Minuten
      
          streamingUsers.set(member.id, intervalId);
        }
      
        // Wenn User nicht mehr streamt
        if (!isStreaming && streamingUsers.has(member.id)) {
          clearInterval(streamingUsers.get(member.id));
          streamingUsers.delete(member.id);
        }

        // Streamer Rollen System
        const streamer_role = newPresence.guild.roles.cache.get('1266095218239995968');

        if (!streamer_role) return console.log("❌ > presenceUpdate > \"Streamer Rolle\" wurde nicht gefunden")

        const isStreaming = newPresence.activities.some(activity => activity.type === ActivityType.Streaming);

        if (isStreaming) {
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
}