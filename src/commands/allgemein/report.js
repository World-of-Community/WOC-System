const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('» Melde einen User. ❗')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Welchen User möchtest du melden?')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('server')
                .setDescription('Auf welchem Server ist das Problem aufgetreten?')
                .setRequired(true)
                .addChoices(
                    { name: 'Discord Server', value: 'discord' },
                    { name: 'Minecraft Server', value: 'minecraft' }
                )
        )
        .addStringOption(option =>
            option
                .setName('grund')
                .setDescription('Grund deiner Meldung.')
                .setRequired(true)
                .addChoices(
                    { name: 'Werbung im falschen Kanal', value: 'werbung' },
                    { name: 'DM Werbung', value: 'dm_werbung' },
                    { name: 'Beleidigung / Belästigung', value: 'beleidigung' },
                    { name: 'Spam', value: 'spam' },
                    { name: 'Sonstiges (Bitte angeben)', value: 'sonstiges' }
                )
        )
        .addStringOption(option =>
            option
                .setName('sonstiges_grund')
                .setDescription('Bitte beschreibe den Grund genauer')
                .setRequired(false)
                .setMaxLength(500)
        )
        .addAttachmentOption(option =>
            option
                .setName('beweis')
                .setDescription('Bild als Beweis (Screenshot)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const reportedUser = interaction.options.getUser('user');
        const grund = interaction.options.getString('grund');
        const sonstigesGrund = interaction.options.getString('sonstiges_grund');
        const server = interaction.options.getString('server');
        const beweis = interaction.options.getAttachment('beweis');

        const reportchannel = '1010515517460725782';

        if (grund === 'sonstiges' && !sonstigesGrund) {
            return interaction.reply({
                content: "> `❌` » Bitte gib bei **Sonstiges** einen erklärenden Kommentar an.",
                ephemeral: true
            });
        }

        if (reportedUser.id === interaction.user.id) {
            return interaction.reply({
                content: "> `❌` » Du kannst dich nicht selbst melden.",
                ephemeral: true
            });
        }

        if (reportedUser.bot) {
            return interaction.reply({
                content: "> `❌` » Du kannst keine Bots melden.",
                ephemeral: true
            });
        }

        if (beweis && !beweis.contentType?.startsWith('image/')) {
            return interaction.reply({
                content: "> `❌` » Der Beweis muss ein Bild sein (PNG/JPG).",
                ephemeral: true
            });
        }

        const reportedMember = await interaction.guild.members.fetch(reportedUser.id);

        const createdAt = `<t:${Math.floor(reportedUser.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.floor(reportedMember.joinedTimestamp / 1000)}>`;
        const serverName = server === 'discord' ? 'Discord Server' : 'Minecraft Server';

        const beweisVorhanden = beweis ? '`✅` Ja' : '`❌` Nein';

        const reportEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${reportedUser} wurde von ${interaction.user} gemeldet.\n\n` +
                `> \`👤\` **BENUTZER INFORMATIONEN**\n` +
                `\`✍️\` » Grund: ${grund}\n` +
                (grund === 'sonstiges' ? `\`📑\` Kommentar: ${sonstigesGrund}\n` : '') +
                `\`📌\` » Benutzer: ${reportedUser.username} (\`${reportedUser.id}\`)\n` +
                `\`📌\` » Server: ${serverName}\n\n` +
                `\`⏰\` » Account erstellt: ${createdAt}\n` +
                `\`⏰\` » Beigetreten: ${joinedAt}`
            )
            .addFields({
                name: '`🧾` » Beweis vorhanden',
                value: beweisVorhanden,
                inline: true
            })
            .setFooter({
                text: `${interaction.guild.name} - Report System`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        if (beweis) reportEmbed.setImage(beweis.url);

        const modChannel = await interaction.guild.channels.fetch(reportchannel);

        await modChannel.send({
            content: `> <@&1285728292367892584> » **Neuer Report eingegangen**`,
            embeds: [reportEmbed]
        });

        await interaction.reply({
            content:
                "> `✅` » Danke für deinen Report. Ein Teammitglied kümmert sich darum.\n" +
                "> `❗` » Beachte: Extremer Missbrauch des `/report`-Befehls wird bestraft!",
            ephemeral: true
        });
    }
};
