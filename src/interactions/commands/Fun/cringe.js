import { EmbedBuilder } from "discord.js";

export default {
  name: "cringe",
  description: "» Zeig jemanden, das er sich peinlich verhält. 😑",
  type: 1,
  options: [
    {
      name: "user",
      description: "Hat sich blamiert? Verdammt ich habs verpasst!",
      required: true,
      type: 6,
    },
  ],

  async run(client, interaction) {
    const mitglied = await interaction.options.getUser("user");

    // Überprüfen, ob der Benutzer versucht, sich selbst zu auszulachen
    if (mitglied.id === interaction.user.id) {
      return interaction.reply({ content: "> `❌` - **Selbstscham**: Du schämst dich für dich selbst. Das tut mir leid. <:Cowboy:1273154946308636702>" });
    }

    const cringegifs = [
      "https://tenor.com/de/view/homer-simpson-goodbye-bye-disappears-hide-in-the-bushes-gif-3394899.gif",
      "https://tenor.com/de/view/pedro-monkey-puppet-meme-awkward-gif-15268759.gif",
      "https://tenor.com/de/view/awkward-silence-what-gif-13940581.gif",
      "https://tenor.com/de/view/yikes-howard-gayle-saturday-night-live-awkward-cringe-gif-19311772",
    ];

    const gif = cringegifs[Math.floor(Math.random() * cringegifs.length)];

    await interaction.reply({
      content: `${mitglied}`,
      embeds: [
        new EmbedBuilder()
          .setDescription(`${interaction.user} findet ${mitglied} echt peinlich.`)
          .setImage(gif)
          .setColor("Blue")
          .setFooter({ text: "Alle Fun-Befehle von WOC siehst du mit /help", iconURL: `${interaction.guild.iconURL()}` }),
      ],
    });
  },
};
