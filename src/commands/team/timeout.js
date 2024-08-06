//Code von @vxnsin
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require("discord.js")
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("» Gebe einem User eine Pause für eine bestimme Dauer. 🕛")
    .addUserOption((option) => option.setName("user").setDescription("» Welcher User soll einen Timeout bekommen?").setRequired(true))
    .addStringOption((option) => option.setName("grund").setDescription("» Gebe einen Grund an.").setRequired(true))
    .addStringOption(option => option.setName("dauer").setDescription("» Gebe eine Dauer an. (z.B. 30s 10m)").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false),
    async execute(interaction, client) {
        const user = interaction.options.getUser('user');
        const zeitString = interaction.options.getString('dauer');
        const grund = interaction.options.getString('grund');
        const member = await interaction.guild.members.fetch({ user, force: true }).catch(() => null);
        if(!member) return await interaction.reply({ content: utils.other.text.userFound(), ephemeral: true });    
        if (interaction.user.id === user.id) return interaction.reply({ content: '> `❌` » Du kannst dir selbst keinen Timeout geben.', ephemeral: true });
        if(!member.kickable) return interaction.reply({ content: '> `❌` » Dieser Benutzer kann nicht getimeoutet werden.', ephemeral: true });
        if (member.isCommunicationDisabled()) return interaction.reply({ content: '> `❌` » Dieser Benutzer hat bereits ein Timeout.', ephemeral: true });
        if (member.permissions.has(PermissionFlagsBits.Administrator)) return interaction.reply({ content: '> `❌` » Dieser Benutzer hat `Administrator` Berechtigungen und kann nicht timeoutet werden.', ephemeral: true });
        if (member.permissions.has(PermissionFlagsBits.KickMembers)) return interaction.reply({ content: '> `❌` » Du darfst Nutzer, die dieselben Berechtigungen haben, nicht timeouten.', ephemeral: true });
        
        
        let zeitInMilliseconds = 0;
        if (zeitString !== null) {
            zeitInMilliseconds = ms(zeitString);
            if (zeitInMilliseconds === undefined) {
                return interaction.reply({ content: '> `❌` » Ungültiges Zeitformat.', ephemeral: true });
            }
        }
        const timeoutTime = new Date(Date.now() + zeitInMilliseconds);
        const userdm = new EmbedBuilder()
            .setAuthor({name: '» ' + interaction.guild.name, iconURL: interaction.guild.iconURL() })
            .setTitle("`👮` | ES GIBT EINE NEUE NACHRICHT")
            .setDescription("» Du wurdest getimeoutet!\n» **Grund:** `" + grund + "`\n» **Dauer:** <t:" + Math.floor(timeoutTime.getTime() / 1000) + ":R>")
            .setColor("Red")
            .setTimestamp()
        await user.send({embeds: [userdm]})
       
            const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.username} » ${interaction.user.id}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 })})
            .setTitle(`\`⛔\` | \`${user.displayName}\` wurde getimeoutet!`)
            .setDescription(`\`📂\` » **Informationen:**\n<:text3:1228332174911213638> **Name:** \`${user.tag}\` (\`${user.id}\`)\n<:text3:1228332174911213638> **Account Erstellt:** <t:${parseInt(user.createdAt / 1000)}:D>\n<:text2:1228330539941888011> **Server beigetreten:** <t:${parseInt(member.joinedAt / 1000)}:D>\n\n<:text1:1228329935995670660>**Getimeoutet von:** \`${interaction.user.username}\` (\`${interaction.user.id}\`)\n<:text3:1228332174911213638> **Dauer:**  <t:${Math.floor(timeoutTime.getTime() / 1000)}:t> (<t:${Math.floor(timeoutTime.getTime() / 1000)}:R>)\n<:text2:1228330539941888011> **Grund:** \`${grund || "Nicht angegeben."}\``)
            .setColor('Red')
            .setThumbnail(user.displayAvatarURL({ dynamic: true, format: 'png'}))
            .setTimestamp()
            await member.timeout(zeitInMilliseconds, grund).catch(console.log);

            const logchannel = await interaction.guild.channels.cache.get("1263436406655680513");

            await logchannel.threads.cache.get("1269998219266490538").send({embeds: [embed]});

        await interaction.reply({ content: `> \`✅\` » ${user} hat nun einen **Timeout**.\n\nInformation:\n» **Grund:** \`${grund}\`\n» **Dauer:** <t:${Math.floor(timeoutTime.getTime() / 1000)}:t> Uhr (<t:${Math.floor(timeoutTime.getTime() / 1000)}:R>)`, ephemeral: true })

    }
}