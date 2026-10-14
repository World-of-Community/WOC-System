import { EmbedBuilder, MessageFlags } from "discord.js";

export default {
  name: "gift",
  description: "» Verschenke ein Geschenk an jemanden. 🎁",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      name: "user",
      description: "Der Nutzer, der das Geschenk erhalten soll",
      required: true,
      type: 6,
    },
    {
      type: 3,
      name: "link",
      description: "Der Geschenk-Link (z.B. Nitro, etc.)",
      required: true,
    },
  ],

  async run(client, interaction) {
    const user = interaction.options.getUser("user");
    const link = interaction.options.getString("link");

    // Prüfen, ob es ein Nitro-Link ist
    const isNitro = link.startsWith("https://discord.gift/") || link.startsWith("https://discord.com/gifts/");

    const embed = new EmbedBuilder()
      .setTitle(isNitro ? "`🎁` Nitro Geschenk erhalten!" : "`🎁` Geschenk erhalten!")
      .setDescription(
        `${interaction.user} hat ${isNitro ? "**Nitro**" : "**ein Geschenk**"} an **dich** verschenkt!\n\n` +
        `> \`🔗\` » Link: **[Hier klicken](${link})**\n\n` +
        "> `❗` » Wichtiger Hinweis\n" +
        "*Dies ist kein Scam. Bitte prüfe trotzdem jeden Link sorgfältig, bevor du darauf klickst.*\n\n" +
        "> `🚑` » Öffne ein Ticket im **[Support](https://discord.com/channels/815919809379172354/819555839362072606)** bei Fragen oder Problemen.",
      )
      .setColor("Blurple")
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      await interaction.reply({ content: `> \`✅\` » Das Geschenk wurde erfolgreich an ${user} per DM geschickt! \`📬\``, flags: MessageFlags.Ephemeral });
    } catch {
      await interaction.reply({ content: `> \`❌\` » Ich konnte ${user} keine DM schicken. Bitte überprüfe die Datenschutzeinstellungen des Nutzers.`, flags: MessageFlags.Ephemeral });
    }
  },
};
