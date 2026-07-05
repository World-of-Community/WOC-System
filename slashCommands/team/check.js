import { EmbedBuilder } from "discord.js";

export default {
    name: "check",
    description: "» Überprüft einen Benutzer auf mögliche Fake-Anzeichen",
    type: 1,
    default_member_permissions: "268435456",
    options: [
        {
            "name": "user",
            "description": "Der Benutzer, den du überprüfen möchtest",
            "required": true,
            "type": 6
        }
    ],

    async run(client, interaction) {
        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        // Accountdaten
        const createdAt = user.createdAt;
        const accountAge = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24)); // Tage alt
        const hasAvatar = user.avatar ? "`✅` Ja" : "`❌` Nein";

        // Serverdaten
        let joinDate = "Nicht auf Server";
        let nickname = "—";
        let roles = "—";
        let roleCount = 0;

        if (member) {
            joinDate = `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`;
            nickname = member.nickname || "Kein Nickname";
            roleCount = member.roles.cache.size - 1; // ohne @everyone
            roles = roleCount > 0
                ? member.roles.cache
                    .filter(r => r.id !== interaction.guild.id)
                    .sort((a, b) => b.position - a.position) // 👉 nach Position sortieren (oben nach unten)
                    .map(r => `<@&${r.id}>`) // 👉 Erwähnung
                    .join(", ")
                : "Keine besonderen Rollen";
        }

        // Letzte Nachricht (wenn im Cache vorhanden)
        let lastMessage = "Keine im Cache";
        if (member && member.lastMessage) {
            lastMessage = member.lastMessage.content.substring(0, 200) || "Embed/Anhang";
        }

        // Verknüpfungen (Connections sind nur via OAuth2-Scopes sichtbar, hier simuliert)
        const connections = user.flags?.toArray().length > 0
            ? user.flags.toArray().join(", ")
            : "Keine sichtbar";

        // Fake-Wahrscheinlichkeit
        let suspicion = 0;
        if (accountAge < 7) suspicion += 40; // unter 7 Tage alt
        if (!user.avatar) suspicion += 25; // kein Avatar
        if (roleCount === 0) suspicion += 20;
        if (!member) suspicion += 15; // nicht auf Server

        const suspicionLevel = suspicion >= 70 ? "`🔴` Hoch" : suspicion >= 40 ? "`🟠` Mittel" : "`🟢` Niedrig";

        const embed = new EmbedBuilder()
            .setColor(suspicion >= 70 ? "Red" : suspicion >= 40 ? "Orange" : "Green")
            .setTitle(`Überprüfung von ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "`👤` User", value: `<@${user.id}>`, inline: true },
                { name: "`🆔` User-ID", value: user.id, inline: true },
                { name: "`📅` Account erstellt", value: `<t:${Math.floor(createdAt / 1000)}:R>`, inline: true },
                { name: "`📆` Account-Alter", value: `${accountAge} Tage`, inline: true },
                { name: "`🖼️` Avatar vorhanden", value: hasAvatar, inline: true },
                { name: "`🏷️` Nickname", value: nickname, inline: true },
                { name: "`📥` Serverbeitritt", value: joinDate, inline: true },
                { name: "`🎭` Rollen", value: `${roleCount} Rollen\n${roles.substring(0, 1024)}`, inline: false },
                { name: "`💬` Letzte Nachricht", value: lastMessage, inline: false },
                { name: "`🔗` Verknüpfungen", value: connections, inline: false },
                { name: "`⚠️` Einschätzung", value: suspicionLevel, inline: true },
            )
            .setFooter({ text: "Automatische Einschätzung – Team muss finale Entscheidung treffen." });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
