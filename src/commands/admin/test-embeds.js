const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test-embed')
        .setDescription('Wähle ein Embed zum Testen aus')
        .addStringOption(option =>
            option
                .setName('embed')
                .setDescription('Wähle das Embed aus')
                .setRequired(true)
                .addChoices(
                    { name: 'Willkommens-Embed', value: 'welcome_embed' },
                    { name: 'Info-Embed', value: 'info_embed' },
                    { name: 'Regeln-Embed', value: 'rules_embed' }
                )
        )
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Wähle einen Benutzer aus (optional)')
                .setRequired(false)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const selectedEmbed = interaction.options.getString('embed');
        const member = interaction.options.getUser('user') || interaction.user;

        const WillkommenDMEmbed = new EmbedBuilder()
            .setTitle('Herzlich Willkommen!')
            .setDescription(`Hallo ${member.displayName}, \`💖\`-lich Willkommen auf **${interaction.guild.name}**!\n\nSchau dich in aller Ruhe um und vor allem, hab viel Spaß hier.\n\nDu möchtest dein Geburtstag mit der Community feiern?\nKein Problem! Besuche den Kanal <#979431125053227068> und benutze: \`/birthday set\` (**MIT JAHR** für eine Altersrolle!) und trage dein Geburtstag ein.\n\n:information_source: | Du möchtest ein Mitglied melden?\n» Benutze: \`/report <user> <grund>\`\n» Das Ausnutzen des Report-Befehls wird bestraft!\n\nBitte verifiziere dich noch bei den <#815922286502346773>, damit wir ein sicheres Umfeld sowie Atmosphäre bewahren können.\n\nSollten irgendwelche Fragen oder sonstige Probleme auftauchen, dann wende dich gerne an unseren Support unter <#819555839362072606>.`)
            .setThumbnail(member.displayAvatarURL({ dynamic: true }))
            .setColor('Orange')
            .setFooter({ text: 'Viel Spaß auf dem Server!', iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setTimestamp();

        const InfoDMEmbed = new EmbedBuilder()
            .setTitle('Server Information')
            .setDescription('Hier findest du alle wichtigen Infos zum Server!')
            .setColor('Blue')
            .setFooter({ text: 'Info-Embed' });

        const RegelDMEmbed = new EmbedBuilder()
            .setTitle('Server Regeln')
            .setDescription('Bitte lies dir die Server-Regeln durch!')
            .setColor('Red')
            .setFooter({ text: 'Regeln' });

        let embedToSend;
        switch (selectedEmbed) {
            case 'welcome_embed':
                embedToSend = WillkommenDMEmbed;
                break;
            case 'info_embed':
                embedToSend = InfoDMEmbed;
                break;
            case 'rules_embed':
                embedToSend = RegelDMEmbed;
                break;
            default:
                return interaction.reply({ content: 'Ungültige Auswahl.', ephemeral: true });
        }

        try {
            await member.send({ embeds: [embedToSend] });
            await interaction.reply({ content: `> \`✅\` » Das Test-Embed wurde an **${member.username}** (${member}) per DM gesendet.`, ephemeral: true });
        } catch (error) {
            console.error('Fehler beim Senden der DM:', error);
            await interaction.reply({ content: `> \`❌\` » Es gab einen Fehler beim Senden der DM an **${member.username}**.`, ephemeral: true });
        }
    },
};
