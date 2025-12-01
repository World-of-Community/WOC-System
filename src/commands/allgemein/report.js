const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("report")
    .setDescription("» Melde einen User. ❗")
    .addUserOption(option => option.setName("user").setDescription("Welchen User möchtest du Melden?").setRequired(true))
    .addStringOption(option => option.setName("grund").setDescription("Gebe ein Grund an").setRequired(true))
    .addStringOption(option =>  option.setName("server").setDescription("Auf welchem Server ist das Problem aufgetreten?").setRequired(true)
      .addChoices(
        { name: "Discord Server", value: "discord" },
        { name: "Minecraft Server", value: "minecraft" },
      )),

  async execute(interaction) {
    const reportedUser = await interaction.options.getUser("user");
    const grund = await interaction.options.getString("grund");
    const server = await interaction.options.getString("server");
    const reportchannel = "1010515517460725782";
    const reportedMember = await interaction.guild.members.fetch(reportedUser.id);

    const createdAt = `<t:${Math.round(reportedUser.createdTimestamp / 1000)}>`;
    const joinedAt = `<t:${Math.round(reportedMember.joinedTimestamp / 1000)}>`;

    if (reportedUser.id == interaction.user.id) {
      return await interaction.reply({ content: "> `❌` » Du kannst dich nicht selbst melden.", ephemeral: true });
    }
    if (reportedUser.bot == true) {
      return await interaction.reply({ content: "> `❌` » Du kannst keine Bots melden.", ephemeral: true });
    }
    const reportEmbed = new EmbedBuilder()
      .setTitle(`\`📝\` | Neuer Report von ${interaction.user.displayName}`)
      .setDescription(`${reportedUser} wurde von ${interaction.user} gemeldet.\n\n> \`👤\` - **BENUTZER INFORMATIONEN**\n\`✍️\` » Report-Grund: ${grund}\n\`📌\` » Server: ${server === "discord" ? "Discord Server" : "Minecraft Server"}\n\`📌\` » Benutzername: ${reportedUser.displayName} (\`${reportedUser.id}\`) (${reportedUser})\n\n\`⏰\` » Account erstellt am: ${createdAt}\n\`⏰\` » Beigetreten am: ${joinedAt}`)
      .setColor("Red")
      .setFooter({ text: `© ${interaction.guild.name} - Report System`, iconURL: `${interaction.guild.iconURL()}` })
      .setTimestamp();

    const modChannel = await interaction.guild.channels.fetch(reportchannel);

    if (modChannel) {
      await modChannel.send({ content: "> <@&1285728292367892584> » **Neuer Report ist eingegangen**", embeds: [reportEmbed] });
      await interaction.reply({ content: "> `✅` » Der Report wurde gesendet. Vielen Dank!", ephemeral: true });
    } else {
      await interaction.reply({ content: "> `❌` » Es wurde kein Report-Kanal gefunden.", ephemeral: true });
    }
  },
};
