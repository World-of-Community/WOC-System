import { Events, EmbedBuilder } from "discord.js";
import { sendLog, ThreadIDs } from "#core/discordLog.js";
import { GUILD_ID } from "#config";

const invites = new Map();

export default {
  name: Events.GuildMemberAdd,

  async execute(client, member) {
    if (member.guild.id !== GUILD_ID) {return;}

    const newInvites = await member.guild.invites.fetch();
    const oldInvites = invites.get(member.guild.id);

    if (!oldInvites) {
      invites.set(member.guild.id, new Map(newInvites.map((invite) => [invite.code, invite.uses])));
      return;
    }

    const usedInvite = newInvites.find((i) => oldInvites.has(i.code) && i.uses > oldInvites.get(i.code));

    if (usedInvite?.inviter) {
      const inviter = usedInvite.inviter;

      const embed = new EmbedBuilder()
        .setDescription(`> × Willkommen ${member} bei **${member.guild.name}**!\n\n> × Eingeladen von **${inviter.displayName || inviter.username}**\n\n> × Einladungscode: [${usedInvite.code}](https://discord.gg/${usedInvite.code})\n\n> × Er/Sie hat nun **${usedInvite.uses}** Einladungen`)
        .setColor("Blurple")
        .setTimestamp();

      await sendLog(ThreadIDs.INVITE, embed);
    }

    invites.set(member.guild.id, new Map(newInvites.map((invite) => [invite.code, invite.uses])));
  },
};
