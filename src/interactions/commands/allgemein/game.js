export default {
  name: "game",
  description: "» Finde deinen Spielpartner mit einer bestimmten Rolle. 🎮",
  type: 1,
  options: [
    {
      "type": 3,
      "choices": [
        {
          "name": "KnockbackFFA",
          "value": "1259972154963918858",
        },
        {
          "name": "RageMode",
          "value": "1303652117487157300",
        },
        {
          "name": "Jump n Run",
          "value": "1263620833423654942",
        },
        {
          "name": "Roblox",
          "value": "1232072165654794281",
        },
        {
          "name": "Rocket League",
          "value": "1232066510554529905",
        },
        {
          "name": "Grand Theft Auto V",
          "value": "1232066545492955136",
        },
        {
          "name": "Minecraft",
          "value": "1232066588216135880",
        },
        {
          "name": "FIFA",
          "value": "1232066657896108082",
        },
        {
          "name": "League of Legends",
          "value": "1273369483951734866",
        },
        {
          "name": "Valorant",
          "value": "1232066632491208704",
        },
        {
          "name": "Fortnite",
          "value": "1232070141127426058",
        },
      ],
      "name": "rolle",
      "description": "Wähle die Rolle aus, die du suchst",
      "required": true,
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
