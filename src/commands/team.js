const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Team')
        .addSubcommand((command) =>
            command
                .setName('uprank')
                .setDescription('» Aktualisiere die Rolle eines Teammitgliedes. 🔁')
                .addUserOption(option => option.setName('user').setDescription('» Welcher Benutzer sollte aktualisiert werden?').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Auf welche Rolle soll der Benutzer befördert werden?').setRequired(true))
        )
        .addSubcommand((command) =>
            command
                .setName('downrank')
                .setDescription('» Setzt einen Benutzer auf eine niedrigere Rolle. 🔽')
                .addUserOption(option => option.setName('user').setDescription('» Der Benutzer, der herabgestuft werden soll.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, auf die der Benutzer herabgestuft werden soll.').setRequired(true))
        )
        .addSubcommand((command) =>
            command
                .setName('neu')
                .setDescription('» Fügt ein neues Teammitglied hinzu. ➕')
                .addUserOption(option => option.setName('user').setDescription('» Welcher User soll eine Team-Rolle bekommen?').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Welche Rolle soll der User bekommen?').setRequired(true))
        )
        .addSubcommand((command) =>
            command
                .setName('kick')
                .setDescription('» Entfernt einen Benutzer aus dem Server-Team. ❌')
                .addUserOption(option => option.setName('user').setDescription('» Der Benutzer, der entfernt werden soll.').setRequired(true))
                .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, die entfernt werden soll.').setRequired(true))
                .addStringOption(option => option.setName('reason').setDescription('» Der Grund für das Entfernen aus dem Team.').setRequired(false))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction, client) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');
        const reason = interaction.options.getString('reason') || 'Kein Grund angegeben';
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); 
        const formattedDate = `<t:${Math.floor(Date.now() / 1000)}:F>`;
        const sub = interaction.options.getSubcommand();

        if (!member || !role || !targetChannel) {
            return interaction.reply('Fehler beim Verarbeiten des Befehls.');
        }
    
        switch (sub) {
            case "uprank":
                try {
                    await member.roles.add(role);
        
                    const Uprankembed = new EmbedBuilder()
                        .setTitle('`🔼` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`> Herzlichen Glückwunsch, ${member}!\n> Du wurdest **befördert!**\n\n**__Rang__**\n${role}`)
                        .setColor('Blurple')
                        .setTimestamp();
                    
                    await targetChannel.send({ content: `${member}`, embeds: [Uprankembed] });
                    await interaction.reply({ content: `> \`✅\` » Das Teammitglied wurde **befördert.**`, ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Hinzufügen der Rolle:', error);
                    interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                }
                break;
            case "downrank":
                try {
                    await member.roles.remove(role);
        
                    const RangUpdateembed = new EmbedBuilder()
                        .setTitle('`🔽` | __TEAMMITGLIED RANGUPDATE__')
                        .setDescription(`Der Nutzer ${member} wurde auf die Rolle ${role} herabgestuft.`)
                        .setColor('Blurple')
                        .setTimestamp();
        
                    const targetChannel = interaction.guild.channels.cache.get('1173986308641804338');
        
                    targetChannel.send({ embeds: [RangUpdateembed] });
                    await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde **herabgestuft.**', ephemeral: true });
                } catch (error) {
                    console.error('Fehler beim Herabstufen des Benutzers:', error);
                    interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                }
                break;
                case "neu":
                    try {
                        await member.roles.add(role);
            
                        const { EmbedBuilder } = require('discord.js');
                        const TeammitgliedEmbed = new EmbedBuilder()
                            .setTitle('`➕` | __NEUES TEAMMITGLIED__')
                            .setColor('Blurple')
                            .setDescription(`> » Wir begrüßen ${member} herzlichst im Team.\n>Wir hoffen auf eine gemeinsame schöne Zeit!\n\n**__Rang__**\n${role}\n\n**__Im Team seit__**\n${formattedDate}`)
                            .setTimestamp();
                        
                        targetChannel.send({ content: `${member}`, embeds: [TeammitgliedEmbed] });
                        await interaction.reply({ content: `> \`✅\` » Ein neues Teammitglied ist nun da.`, ephemeral: true});
                    } catch (error) {
                        console.error('Fehler beim Hinzufügen der Rolle:', error);
                        interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                    }
                break;
                case "kick":
                    try {
                        await member.roles.remove(role);
            
                        const dmEmbed = new EmbedBuilder()
                            .setTitle('`❗` | __DU WURDEST AUS DEM SERVER-TEAM ENTLASSEN__')
                            .setDescription(`Hallo ${member}, Du wurdest aus dem Server-Team entlassen.\n\nGrund: \`${reason}\``)
                            .setColor('Red')
                            .setTimestamp();
            
                        try {
                            await member.send({ embeds: [dmEmbed] });
                        } catch (dmError) {
                            console.error('Fehler beim Senden der DM:', dmError);
                        }
                        const kickEmbed = new EmbedBuilder()
                            .setTitle('`❌` | __TEAMMITGLIED ENTFERNT__')
                            .setDescription(`Der Nutzer ${member} wurde von ${interaction.user.displayName} aus dem Server-Team **Entfernt**.\n\nGrund: \`${reason}\``)
                            .setColor('Red')
                            .setTimestamp();
            
                        targetChannel.send({ embeds: [kickEmbed] });
                        await interaction.reply({ content: '> \`✅\` » Das Teammitglied wurde aus dem Server-Team **Entfernt.**', ephemeral: true });
                    } catch (error) {
                        console.error('Fehler beim Kicken des Benutzers:', error);
                        interaction.reply({ content: `> \`❌\` » Es ist ein Fehler aufgetreten.`, ephemeral: true });
                    }
                    break;                
        }
    },
};