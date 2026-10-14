import { EmbedBuilder, MessageFlags } from "discord.js";
import userDB from "#models/User.js";

export default {

  // /donated command
  name: "donated",
  description: "» Zeigt die Gesamtspenden eines Benutzers an. 💖",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      name: "user",
      description: "» Wähle einen Benutzer aus, um die Gesamtspenden zu sehen.",
      required: true,
      type: 6,
    },
  ],

  async run(client, interaction) {

    const member = interaction.options.getUser("user");
    const userData = await userDB.findOne({userID: member.id});

    if(!userData || !userData.donation) {return await interaction.reply({content: `> \`❌\` » ${member} hat aktuell noch nichts gespendet.`, flags: MessageFlags.Ephemeral});}

    const donateAmount = userData.donation.toLocaleString("de-DE") + "€";

    const donateEmbed = new EmbedBuilder()
      .setTitle(`\`💸\` × ${member.displayName}'s Gesamtspenden`)
      .setDescription(`> \`💖\` » ${member} hat insgesamt \`${donateAmount}\` für ${interaction.guild.name} gespendet!`)
      .setColor("Blurple")
      .setThumbnail(member.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
      .setFooter({ text: `${interaction.guild.name} dankt dir für alle Spenden`, iconURL: `${interaction.guild.iconURL()}` })
      .setTimestamp();

    await interaction.reply({ embeds: [donateEmbed], flags: MessageFlags.Ephemeral });
  },
};
