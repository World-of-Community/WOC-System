import { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import giveawaydb from "#models/Giveaway.js";
import userdb from "#models/User.js";
import serverdb from "#models/Guild.js";
import { UserError } from "#core/errors.js";

const GIFT_THUMBNAIL = "https://cdn.discordapp.com/attachments/1269341729493094400/1271147368787480621/Gift.gif";
const NOT_ELIGIBLE = "> `❌` » Du erfüllst nicht die Bedingungen.";

function leaveRow(msgID) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`giveaway-leave-${msgID}`)
      .setLabel("» Teilnahme zurückziehen")
      .setEmoji("↩️")
      .setStyle(ButtonStyle.Danger),
  );
}

// Replaces or inserts the "**N** Teilnehmer" line in the giveaway embed
export function withParticipantCount(embed, previous, current) {
  const description = embed.description.includes("** Teilnehmer")
    ? embed.description.replace(`**${previous}** Teilnehmer`, `**${current}** Teilnehmer`)
    : embed.description.replace("** Gewinner", `** Gewinner\n<:PfeilBlau:1147248395837247613> **${current}** Teilnehmer`);

  return new EmbedBuilder()
    .setColor(embed.color)
    .setTitle(embed.title)
    .setDescription(description)
    .setThumbnail(GIFT_THUMBNAIL);
}

async function meetsRequirement(interaction, giveaway, statsData) {
  switch (giveaway.bedingung) {
    case "messages":
      return statsData && statsData.messages >= parseInt(giveaway.bedingungString, 10);
    case "voiceTime":
      return statsData && statsData.voiceTime >= parseInt(giveaway.bedingungString, 10);
    case "role": {
      const role = await interaction.guild.roles.fetch(giveaway.bedingungString).catch(() => null);
      return role ? interaction.member.roles.cache.has(role.id) : false;
    }
    case "membersince": {
      const member = await interaction.guild.members.fetch(interaction.user.id);
      return Date.now() - member.joinedTimestamp >= parseInt(giveaway.bedingungString, 10);
    }
    default:
      return true;
  }
}

export default {
  id: "giveaway-enter",

  async run(client, interaction) {
    const giveaway = await giveawaydb.findOne({ msgID: interaction.message.id });
    if (!giveaway) {throw new UserError("> `❌` » Das Gewinnspiel existiert nicht.");}
    if (giveaway.endTime !== null) {throw new UserError("> `❌` » Das Gewinnspiel wurde schon beendet!");}

    if (giveaway.teilnehmer.includes(interaction.user.id)) {
      await interaction.reply({ content: "> `❌` » Du nimmst bereits am Gewinnspiel teil!", components: [leaveRow(giveaway.msgID)], ephemeral: true });
      return;
    }

    let serverData = await serverdb.findOne({ guildID: interaction.guild.id });
    if (!serverData) {
      serverData = await new serverdb({ guildID: interaction.guild.id, roleBypass: [] }).save();
    }

    const hasBypass = serverData.roleBypass?.length > 0
      && serverData.roleBypass.some((roleId) => interaction.member.roles.cache.has(roleId));

    if (!hasBypass) {
      const userData = await userdb.findOne({ userID: interaction.user.id });
      const ok = await meetsRequirement(interaction, giveaway, userData?.stats ?? null);
      if (!ok) {throw new UserError(NOT_ELIGIBLE);}
    }

    const previous = giveaway.teilnehmer.length;
    await giveawaydb.updateOne({ msgID: interaction.message.id }, { $push: { teilnehmer: interaction.user.id } });

    const updatedEmbed = withParticipantCount(interaction.message.embeds[0], previous, previous + 1);
    const edit = { embeds: [updatedEmbed] };
    if (!hasBypass) {
      edit.content = "<a:Giveaway:968876442618306560><a:Giveaway:968876442618306560> **NEUES EVENT!** <a:Giveaway:968876442618306560><a:Giveaway:968876442618306560>";
    }
    await interaction.message.edit(edit);

    await interaction.reply({ content: "> `✅` » **Teilnahme erfolgreich**: Ich habe dich erfolgreich als Teilnehmer des Gewinnspiels eingetragen! <a:Gewinnspiel:1148705932231057598>", ephemeral: true });
  },
};
