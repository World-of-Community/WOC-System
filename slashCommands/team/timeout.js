// Code von @vxnsin
import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import ms from "ms";

export default {
  name: "timeout",
  description: "» Gebe einem User eine Pause für eine bestimme Dauer. 🕛",
  type: 1,
  default_member_permissions: "2",
  dm_permission: false,
  options: [
    {
      "name": "user",
      "description": "» Welcher User soll einen Timeout bekommen?",
      "required": true,
      "type": 6,
    },
    {
      "type": 3,
      "name": "grund",
      "description": "» Gebe einen Grund an.",
      "required": true,
    },
    {
      "type": 3,
      "choices": [
        {
          "name": "🕒 » 1 Minute",
          "value": "1m",
        },
        {
          "name": "🕒 » 2 Minuten",
          "value": "2m",
        },
        {
          "name": "🕒 » 5 Minuten",
          "value": "5m",
        },
        {
          "name": "🕒 » 10 Minuten",
          "value": "10m",
        },
        {
          "name": "🕒 » 15 Minuten",
          "value": "15m",
        },
        {
          "name": "🕒 » 30 Minuten",
          "value": "30m",
        },
        {
          "name": "🕒 » 1 Stunde",
          "value": "1h",
        },
        {
          "name": "🕒 » 2 Stunden",
          "value": "2h",
        },
        {
          "name": "🕒 » 6 Stunden",
          "value": "6h",
        },
        {
          "name": "🕒 » 1 Tag",
          "value": "1d",
        },
        {
          "name": "🕒 » 2 Tage",
          "value": "2d",
        },
        {
          "name": "🕒 » 5 Tage",
          "value": "5d",
        },
        {
          "name": "🕒 » 7 Tage",
          "value": "7d",
        },
      ],
      "name": "dauer",
      "description": "» Wähle eine Dauer aus.",
      "required": true,
    },
  ],

  async run(client, interaction) {

    const user = interaction.options.getUser("user");
    const zeitString = interaction.options.getString("dauer");
    const grund = interaction.options.getString("grund");
    const member = await interaction.guild.members.fetch({ user, force: true }).catch(() => null);

    if (!member) {return await interaction.reply({ content: "> `❌` » Benutzer nicht gefunden.", ephemeral: true });}
    if (interaction.user.id === user.id) {return interaction.reply({ content: "> `❌` » Du kannst dir selbst keinen Timeout geben.", ephemeral: true });}
    if (!member.kickable) {return interaction.reply({ content: "> `❌` » Dieser Benutzer kann nicht getimeoutet werden.", ephemeral: true });}
    if (member.isCommunicationDisabled()) {return interaction.reply({ content: "> `❌` » Dieser Benutzer hat bereits ein Timeout.", ephemeral: true });}
    if (member.permissions.has(PermissionFlagsBits.Administrator)) {return interaction.reply({ content: "> `❌` » Dieser Benutzer hat `Administrator` Berechtigungen und kann nicht timeoutet werden.", ephemeral: true });}
    if (member.permissions.has(PermissionFlagsBits.KickMembers)) {return interaction.reply({ content: "> `❌` » Du darfst Nutzer, die dieselben Berechtigungen haben, nicht timeouten.", ephemeral: true });}


    let zeitInMilliseconds = 0;
    if (zeitString !== null) {
      zeitInMilliseconds = ms(zeitString);
      if (zeitInMilliseconds === undefined) {
        return interaction.reply({ content: "> `❌` » Ungültiges Zeitformat.", ephemeral: true });
      }
    }
    const timeoutTime = new Date(Date.now() + zeitInMilliseconds);
    const userdm = new EmbedBuilder()
      .setTitle("`🔴` - Time-Out erhalten!")
      .setDescription(`Du hast gerade auf dem Server \`${interaction.guild.name}\` einen Time-Out erhalten.\n\n» Grund: ${grund}\n» Endet: <t:${Math.floor(timeoutTime.getTime() / 1000)}:F> (<t:${Math.floor(timeoutTime.getTime() / 1000)}:R>)\n\n<a:warnung:1066110628705615914> » **ÄNDERE DEIN VERHALTEN!**\n» Du hast einen Time-Out erhalten und kannst dadurch nicht mehr auf unserem Server chatten, reagieren oder reden. Überdenke deine Verhaltensweise, um so etwas in Zukunft zu vermeiden.`)
      .setColor("Red")
      .setThumbnail("https://cdn.discordapp.com/attachments/1269339944766144574/1304377493964197948/timeout.png?ex=672f2bb4&is=672dda34&hm=173069c9cdf0e19d175ed572f40dfad7b2f9a425a7eb64a490d9b794c7be0f0f&")
      .setFooter({ text: `» ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
      .setTimestamp();

    await user.send({embeds: [userdm]}).catch(() => {});

    const embed = new EmbedBuilder()
      .setTitle(`\`⛔\` | \`${user.displayName}\` wurde getimeoutet!`)
      .setDescription(`\`📂\` » **INFORMATIONEN**\n» Name: \`${user.tag}\` (\`${user.id}\`)\n» Account Erstellt: <t:${parseInt(user.createdAt / 1000)}:D>\n» Server beigetreten: <t:${parseInt(member.joinedAt / 1000)}:D>\n\n» Getimeoutet von: \`${interaction.user.username}\` (\`${interaction.user.id}\`)\n» Dauer: <t:${Math.floor(timeoutTime.getTime() / 1000)}:F> (<t:${Math.floor(timeoutTime.getTime() / 1000)}:R>)\n» Grund: \`${grund || "Nicht angegeben."}\``)
      .setColor("Red")
      .setThumbnail(user.displayAvatarURL({ dynamic: true, format: "png"}))
      .setFooter({ text: `» wurde ausgeführt von ${interaction.user.displayName}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, format: "png", size: 2048 }) })
      .setTimestamp();

    await member.timeout(zeitInMilliseconds, grund).catch(console.log);

    const logchannel = await interaction.guild.channels.cache.get("1263436406655680513");

    if (logchannel) {
      const thread = logchannel.threads.cache.get("1269998219266490538");
      if (thread) {
        await thread.send({embeds: [embed]});
      }
    }

    await interaction.reply({ content: `> \`✅\` » ${user} hat nun einen **Timeout**.\n\n**Information:**\n» Grund: \`${grund}\`\n» Endet: <t:${Math.floor(timeoutTime.getTime() / 1000)}:F> (<t:${Math.floor(timeoutTime.getTime() / 1000)}:R>)`, ephemeral: true });
  },
};
