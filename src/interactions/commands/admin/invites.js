import { EmbedBuilder, MessageFlags } from "discord.js";
import userdb from "#models/User.js";

export default {
  name: "invites-manage",
  description: "Fügt einem Benutzer manuell Einladungen hinzu oder entfernt sie",
  type: 1,
  default_member_permissions: "8",
  options: [
    {
      name: "user",
      description: "Der Benutzer, dem du Einladungen hinzufügen oder entfernen willst",
      required: true,
      type: 6,
    },
    {
      type: 4,
      name: "joins",
      description: "Wie viele normale Einladungen sollen hinzugefügt oder entfernt werden? (positiv oder negativ)",
      required: false,
    },
    {
      type: 4,
      name: "bonus",
      description: "Wie viele Bonus-Einladungen sollen hinzugefügt oder entfernt werden? (optional)",
      required: false,
    },
    {
      type: 4,
      name: "left",
      description: "Wie viele Einladungen sollen als \"verloren\" hinzugefügt oder entfernt werden? (optional)",
      required: false,
    },
  ],

  async run(client, interaction) {
    const user = interaction.options.getUser("user");
    const joinsChange = interaction.options.getInteger("joins"); // positiv oder negativ
    const bonusChange = interaction.options.getInteger("bonus") || 0;
    const leftChange = interaction.options.getInteger("left") || 0;

    // Aktuelle Daten holen
    const userData = await userdb.findOne({ userID: user.id }) || {
      invites: { joins: 0, bonus: 0, left: 0 },
    };

    // Neue Werte berechnen und nicht unter 0 fallen lassen
    const newJoins = Math.max(0, (userData.invites.joins || 0) + joinsChange);
    const newBonus = Math.max(0, (userData.invites.bonus || 0) + bonusChange);
    const newLeft = Math.max(0, (userData.invites.left || 0) + leftChange);

    // Daten in DB updaten (überschreiben mit den neuen Werten)
    await userdb.findOneAndUpdate(
      { userID: user.id },
      {
        $set: {
          "invites.joins": newJoins,
          "invites.bonus": newBonus,
          "invites.left": newLeft,
        },
      },
      { upsert: true },
    );

    const total = newJoins + newBonus - newLeft;

    const InviteEmbed = new EmbedBuilder()
      .setTitle("📨 Einladungen aktualisiert")
      .setDescription(`> \`👤\` » Benutzer: ${user} (\`${user.id}\`)\n> \`📩\` » Normale Einladungen (jetzt): **${newJoins}**\n> \`🎁\` » Bonus-Einladungen (jetzt): **${newBonus}**\n> \`❌\` » Verlorene Einladungen (jetzt): **${newLeft}**\n> \`📊\` » Gesamt-Einladungen: **${total}**`)
      .setColor("Blurple")
      .setFooter({ text: `Aktualisiert von ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [InviteEmbed], flags: MessageFlags.Ephemeral });
  },
};
