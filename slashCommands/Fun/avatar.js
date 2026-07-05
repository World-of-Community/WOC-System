import { EmbedBuilder } from "discord.js";

export default {
  name: "avatar",
  description: "» Lass dir den Avatar eines Server-Mitglieds anzeigen. 👤",
  type: 1,
  options: [
    {
      "name": "user",
      "description": "Wähle einen User aus",
      "required": true,
      "type": 6,
    },
  ],

  async run(client, interaction) {

    const texte = [
      "*Schon etwas einzigartig. :)*",
      "*Ich weiß nicht was ich davon halten soll...*",
      "*So wunderschön, besser geht es nicht. :)*",
      "*Dieser Avatar gefällt mir sehr!*",
      "*Kenne schon bessere Avatare.*",
      "Dieser Avatar ist sehr... speziell.",
    ];

    const text = texte[Math.floor(Math.random() * texte.length)];
    const user = await interaction.options.getUser("user");

    const avatarEmbed = new EmbedBuilder()
      .setTitle("Avatar von " + user.displayName)
      .setDescription(`${text}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .setColor("Blurple")
      .setFooter({ text: "Alle Fun-Befehle von WOC siehst du mit /help", iconURL: `${interaction.guild.iconURL()}` });

    interaction.reply({ embeds: [avatarEmbed] });
  },
};
