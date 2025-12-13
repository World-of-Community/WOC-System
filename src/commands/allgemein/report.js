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
                .setName('grund')
                .setDescription('Gib einen Grund an')
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
        .addAttachmentOption(option =>
            option
                .setName('beweis')
                .setDescription('Bild als Beweis (Screenshot)')
                .setRequired(false)
        ),

    async execute(interaction) {
        const reportedUser = interaction.options.getUser('user');
        const grund = interaction.options.getString('grund');
        const server = interaction.options.getString('server');
        const beweis = interaction.options.getAttachment('beweis');

        const reportchannel = '1010515517460725782';
        const reportedMember = await interaction.guild.members.fetch(reportedUser.id);

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

        const createdAt = `<t:${Math.round(reportedUser.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(reportedMember.joinedTimestamp / 1000)}>`;
        const serverName = server === 'discord' ? 'Discord Server' : 'Minecraft Server';
        const beweisVorhanden = beweis ? '✅ Ja' : '❌ Nein';

        const reportEmbed = new EmbedBuilder()
            .setTitle(`📝 Neuer Report von ${interaction.user.displayName}`)
            .setColor('Red')
            .setDescription(
                `${reportedUser} wurde von ${interaction.user} gemeldet.\n\n` +
                `> **👤 BENUTZER INFORMATIONEN**\n` +
                `✍️ **Grund:** ${grund}\n` +
                `📌 **Server:** ${serverName}\n` +
                `📌 **Benutzer:** ${reportedUser.displayName} (\`${reportedUser.id}\`) ${reportedUser}\n\n` +
                `⏰ **Account erstellt:** ${createdAt}\n` +
                `⏰ **Beigetreten:** ${joinedAt}`
            )
            .addFields(
                {
                    name: '🧾 Beweis vorhanden',
                    value: beweisVorhanden,
                    inline: true
                }
            )
            .setFooter({
                text: `© ${interaction.guild.name} - Report System`,
                iconURL: interaction.guild.iconURL()
            })
            .setTimestamp();

        if (beweis) {
            reportEmbed.setImage(beweis.url);
        }

        const modChannel = await interaction.guild.channels.fetch(reportchannel);

        if (!modChannel) {
            return interaction.reply({
                content: "> `❌` » Es wurde kein Report-Kanal gefunden.",
                ephemeral: true
            });
        }

        await modChannel.send({
            content: `> <@&1285728292367892584> » **Neuer Report ist eingegangen**`,
            embeds: [reportEmbed],
            files: beweis ? [beweis.url] : []
        });

        await interaction.reply({
            content: "> `✅` » Der Report wurde erfolgreich gesendet. Vielen Dank!",
            ephemeral: true
        });
    }
};
