import { settings } from "#core/settings.js";
export default {
  name: "game",
  description: "» Finde deinen Spielpartner mit einer bestimmten Rolle. 🎮",
  type: 1,
  options: [
    {
      type: 3,
      choices: [
        {
          name: "KnockbackFFA",
          value: settings.get("gameRoles.knockbackFfa"),
        },
        {
          name: "RageMode",
          value: settings.get("gameRoles.rageMode"),
        },
        {
          name: "Jump n Run",
          value: settings.get("gameRoles.jumpNRun"),
        },
        {
          name: "Roblox",
          value: settings.get("gameRoles.roblox"),
        },
        {
          name: "Rocket League",
          value: settings.get("gameRoles.rocketLeague"),
        },
        {
          name: "Grand Theft Auto V",
          value: settings.get("gameRoles.gta5"),
        },
        {
          name: "Minecraft",
          value: settings.get("gameRoles.minecraft"),
        },
        {
          name: "FIFA",
          value: settings.get("gameRoles.fifa"),
        },
        {
          name: "League of Legends",
          value: settings.get("gameRoles.lol"),
        },
        {
          name: "Valorant",
          value: settings.get("gameRoles.valorant"),
        },
        {
          name: "Fortnite",
          value: settings.get("gameRoles.fortnite"),
        },
      ],
      name: "rolle",
      description: "Wähle die Rolle aus, die du suchst",
      required: true,
    },
  ],

  async run(client, interaction) {
    const rolleId = interaction.options.getString("rolle");
    const rolle = interaction.guild.roles.cache.get(rolleId);

    if (!rolle) {
      return interaction.reply({ content: "> `❌` » Rolle nicht gefunden!", ephemeral: true });
    }

    await interaction.reply({
      content: `${rolle}\n\n**${interaction.user.displayName}** sucht einen Spielpartner` });
  },
};
