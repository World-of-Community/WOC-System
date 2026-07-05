import { EmbedBuilder } from "discord.js";
import client from "../index.js";
import { sendLog, ThreadIDs } from "../functions/sendLog.js";

const invites = new Map();

client.on('guildMemberAdd', async member => {
    if (member.guild.id !== "815919809379172354") return;

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    // Falls wir noch keine gespeicherten Einladungen haben → jetzt speichern und return
    if (!oldInvites) {
        invites.set(member.guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
        return;
    }

    // Finde die benutzte Einladung
    const usedInvite = newInvites.find(i => oldInvites.has(i.code) && i.uses > oldInvites.get(i.code));

    if (usedInvite) {
        const inviter = usedInvite.inviter;
        const inviteUses = usedInvite.uses;

        const InviteEmbed = new EmbedBuilder()
            .setDescription(`> × Willkommen ${member} bei **${member.guild.name}**!\n\n> × Eingeladen von **${inviter.displayName || inviter.username}**\n\n> × Einladungscode: [${usedInvite.code}](https://discord.gg/${usedInvite.code})\n\n> × Er/Sie hat nun **${inviteUses}** Einladungen`)
            .setColor('Blurple')
            .setTimestamp();

        await sendLog(ThreadIDs.INVITE, InviteEmbed);
    }

    // Speichere den aktuellen Stand der Einladungen
    invites.set(member.guild.id, new Map(newInvites.map(invite => [invite.code, invite.uses])));
});
