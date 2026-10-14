import { EmbedBuilder, MessageFlags } from "discord.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

export default {
  name: "test-embed",
  description: "Wähle ein Embed zum Testen aus",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      type: 3,
      choices: [
        {
          name: "Willkommens-Embed",
          value: "welcome_embed",
        },
        {
          name: "Info-Embed",
          value: "info_embed",
        },
        {
          name: "Regeln-Embed",
          value: "rules_embed",
        },
      ],
      name: "embed",
      description: "Wähle das Embed aus",
      required: true,
    },
    {
      name: "user",
      description: "Wähle einen Benutzer aus (optional)",
      required: false,
      type: 6,
    },
  ],

  async run(client, interaction) {
    const selectedEmbed = interaction.options.getString("embed");
    const member = interaction.options.getUser("user") || interaction.user;

    const WillkommenDMEmbed = new EmbedBuilder()
      .setTitle("Herzlich Willkommen!")
      .setDescription(`Hallo ${member.displayName}, \`💖\`-lich Willkommen auf **${interaction.guild.name}**!\n\nSchau dich in aller Ruhe um und vor allem, hab viel Spaß hier.\n\nDu möchtest dein Geburtstag mit der Community feiern?\nKein Problem! Besuche den Kanal <#${settings.get("channels.botCommands")}> und benutze: \`/birthday set\` (**MIT JAHR** für eine Altersrolle!) und trage dein Geburtstag ein.\n\n:information_source: | Du möchtest ein Mitglied melden?\n» Benutze: \`/report <user> <grund>\`\n» Das Ausnutzen des Report-Befehls wird bestraft!\n\nBitte verifiziere dich noch bei den <#${settings.get("channels.rules")}>, damit wir ein sicheres Umfeld sowie Atmosphäre bewahren können.\n\nSollten irgendwelche Fragen oder sonstige Probleme auftauchen, dann wende dich gerne an unseren Support unter <#${settings.get("channels.support")}>.`)
      .setThumbnail(member.displayAvatarURL({ dynamic: true }))
      .setColor("Orange")
      .setFooter({ text: "Viel Spaß auf dem Server!", iconURL: interaction.guild.iconURL({ dynamic: true }) })
      .setTimestamp();

    const InfoDMEmbed = new EmbedBuilder()
      .setTitle("Server Information")
      .setDescription("Hier findest du alle wichtigen Infos zum Server!")
      .setColor("Blue")
      .setFooter({ text: "Info-Embed" });

    const RegelDMEmbed = new EmbedBuilder()
      .setTitle("Server Regeln")
      .setDescription("Bitte lies dir die Server-Regeln durch!")
      .setColor("Red")
      .setFooter({ text: "Regeln" });

    let embedToSend;
    switch (selectedEmbed) {
      case "welcome_embed":
        embedToSend = WillkommenDMEmbed;
        break;
      case "info_embed":
        embedToSend = InfoDMEmbed;
        break;
      case "rules_embed":
        embedToSend = RegelDMEmbed;
        break;
      default:
        return interaction.reply({ content: "Ungültige Auswahl.", flags: MessageFlags.Ephemeral });
    }

    try {
      await member.send({ embeds: [embedToSend] });
      await interaction.reply({ content: `> \`✅\` » Das Test-Embed wurde an **${member.username}** (${member}) per DM gesendet.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      logger.error("Fehler beim Senden der DM:", error);
      await interaction.reply({ content: `> \`❌\` » Es gab einen Fehler beim Senden der DM an **${member.username}**.`, flags: MessageFlags.Ephemeral });
    }
  },
};
