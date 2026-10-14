import { EmbedBuilder, MessageFlags } from "discord.js";
import { settings } from "#core/settings.js";

export default {
  name: "report",
  description: "» Melde einen User. ❗",
  type: 1,
  options: [
    {
      name: "user",
      description: "Welchen User möchtest du melden?",
      required: true,
      type: 6,
    },
    {
      type: 3,
      choices: [
        {
          name: "Discord Server",
          value: "discord",
        },
        {
          name: "Minecraft Server",
          value: "minecraft",
        },
      ],
      name: "server",
      description: "Auf welchem Server ist das Problem aufgetreten?",
      required: true,
    },
    {
      type: 3,
      choices: [
        {
          name: "Werbung im falschen Kanal",
          value: "werbung",
        },
        {
          name: "DM Werbung",
          value: "dm_werbung",
        },
        {
          name: "Beleidigung / Belästigung",
          value: "beleidigung",
        },
        {
          name: "Spam",
          value: "spam",
        },
        {
          name: "Sonstiges (Bitte angeben)",
          value: "sonstiges",
        },
      ],
      name: "grund",
      description: "Grund deiner Meldung.",
      required: true,
    },
    {
      type: 3,
      name: "sonstiges_grund",
      description: "Bitte beschreibe den Grund genauer",
      required: false,
      max_length: 500,
    },
    {
      name: "beweis",
      description: "Bild als Beweis (Screenshot)",
      required: false,
      type: 11,
    },
  ],

  async run(client, interaction) {
    const reportedUser = interaction.options.getUser("user");
    const grund = interaction.options.getString("grund");
    const sonstigesGrund = interaction.options.getString("sonstiges_grund");
    const server = interaction.options.getString("server");
    const beweis = interaction.options.getAttachment("beweis");

    const reportchannel = settings.get("channels.reports");

    if (grund === "sonstiges" && !sonstigesGrund) {
      return interaction.reply({
        content: "> `❌` » Bitte gib bei **Sonstiges** einen erklärenden Kommentar an.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (reportedUser.id === interaction.user.id) {
      return interaction.reply({
        content: "> `❌` » Du kannst dich nicht selbst melden.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (reportedUser.bot) {
      return interaction.reply({
        content: "> `❌` » Du kannst keine Bots melden.",
        flags: MessageFlags.Ephemeral,
      });
    }

    if (beweis && !beweis.contentType?.startsWith("image/")) {
      return interaction.reply({
        content: "> `❌` » Der Beweis muss ein Bild sein (PNG/JPG).",
        flags: MessageFlags.Ephemeral,
      });
    }

    const reportedMember = await interaction.guild.members.fetch(reportedUser.id);

    const createdAt = `<t:${Math.floor(reportedUser.createdTimestamp / 1000)}>`;
    const joinedAt = `<t:${Math.floor(reportedMember.joinedTimestamp / 1000)}>`;
    const serverName = server === "discord" ? "Discord Server" : "Minecraft Server";

    const beweisVorhanden = beweis ? "`✅` Ja" : "`❌` Nein";

    const reportEmbed = new EmbedBuilder()
      .setColor("Red")
      .setDescription(
        `${reportedUser} wurde von ${interaction.user} gemeldet.\n\n` +
                "> `👤` **BENUTZER INFORMATIONEN**\n" +
                `\`✍️\` » Grund: ${grund}\n` +
                (grund === "sonstiges" ? `\`📑\` » Kommentar: ${sonstigesGrund}\n` : "") +
                `\`📌\` » Benutzer: ${reportedUser.username} (\`${reportedUser.id}\`)\n` +
                `\`📌\` » Server: ${serverName}\n\n` +
                `\`⏰\` » Account erstellt: ${createdAt}\n` +
                `\`⏰\` » Beigetreten: ${joinedAt}`,
      )
      .addFields({
        name: "`🧾` » Beweis vorhanden",
        value: beweisVorhanden,
        inline: true,
      })
      .setFooter({
        text: `${interaction.guild.name} - Report System`,
        iconURL: interaction.guild.iconURL(),
      })
      .setTimestamp();

    if (beweis) {reportEmbed.setImage(beweis.url);}

    const modChannel = await interaction.guild.channels.fetch(reportchannel);

    await modChannel.send({
      content: `> <@&${settings.get("teamRoles.reportLog")}> » **Neuer Report eingegangen**`,
      embeds: [reportEmbed],
    });

    await interaction.reply({
      content:
                "> `✅` » Danke für deinen Report. Ein Teammitglied kümmert sich darum.\n" +
                "> `❗` » Beachte: Extremer Missbrauch des `/report`-Befehls wird bestraft!",
      flags: MessageFlags.Ephemeral,
    });
  },
};
