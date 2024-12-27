//const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

//module.exports = {
//    data: new SlashCommandBuilder()
//        .setName('remove-role')
//        .setDescription('» Entferne eine Rolle eines Nutzers. ❌')
//        .addUserOption(option => option.setName('user').setDescription('» Der Nutzer, von dem die Rolle entfernt werden soll.').setRequired(true))
//        .addRoleOption(option => option.setName('role').setDescription('» Die Rolle, die entfernt werden soll.').setRequired(true))
//        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

//async execute(interaction) {

//    const member = interaction.options.getMember('user') || interaction.member;
//    const role = interaction.options.getRole('role');

//    try {
//        // Entferne die angegebene Rolle vom Mitglied
//        await member.roles.remove(role);
//        await interaction.reply({ content: `> \`✅\` » Die Rolle <@&${role.id}> wurde von ${member} **entfernt**.`, ephemeral: true });

//        // Remove Role Log
//        const logchannel = await member.guild.channels.cache.get("1263436406655680513");

//        const removerole = new EmbedBuilder()
//            .setTitle('Info zum `/remove-role` Befehl')
//            .setDescription(`${member} hat den \`/remove-role\` benutzt und ${member} die ${role} Rolle entnommen.`)
//            .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
//            .setColor('Blurple')
//            .setTimestamp();

//        await logchannel.threads.cache.get("1269998221518831721").send({embeds: [removerole]});
//    } catch (error) {
//        await interaction.reply({ content: `> \`❌\` » Es gab einen Fehler beim Entfernen der Rolle.\n\n**${error.message}**`, ephemeral: true });
//    } 
//},
//};

//

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remove-role')
        .setDescription('» Entferne eine Rolle eines Nutzers. ❌')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('» Der Nutzer, von dem die Rolle entfernt werden soll.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const member = interaction.options.getMember('user');

        // Filter für Rollen: Entferne @everyone
        const roles = member.roles.cache.filter(role => role.id !== interaction.guild.id);

        // Begrenze auf maximal 25 Rollen
        const limitedRoles = roles.size > 25 ? roles.first(25) : roles;

        if (limitedRoles.size === 0) {
            return interaction.reply({
                content: `> \`❌\` » ${member} hat keine Rollen, die entfernt werden können.`,
                ephemeral: true
            });
        }

        // Rollen im Embed anzeigen (mit Erwähnung)
        const embed = new EmbedBuilder()
            .setTitle(`${member.user.username} - Rollenübersicht`)
            .setDescription(`> Wähle eine Rolle aus, die von ${member} entfernt werden soll:`)
            .setColor('Blurple')
            .setTimestamp();

        // Erstelle das Auswahlmenü mit den Rollen und Erwähnung
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('remove-role-select')
            .setPlaceholder('Wähle eine Rolle aus, die entfernt werden soll.')
            .addOptions(
                limitedRoles.map(role => ({
                    label: `@&${role.id}`,
                    description: `ID: ${role.id}`,
                    value: role.id,
                    // Rolle mit Erwähnung im Auswahlmenü anzeigen
                    emoji: '❌'
                }))
            );

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Sende das Embed und Auswahlmenü
        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });

        // Warte auf die Auswahl des Nutzers (keine Zeitbegrenzung)
        const filter = i => i.customId === 'remove-role-select' && i.user.id === interaction.user.id;
        const selectInteraction = await interaction.channel.awaitMessageComponent({ filter });

        // Rolle entfernen
        const selectedRoleId = selectInteraction.values[0];
        const selectedRole = interaction.guild.roles.cache.get(selectedRoleId);

        try {
            await member.roles.remove(selectedRole);
            await selectInteraction.update({
                content: `> \`✅\` » Die Rolle ${selectedRole.toString()} wurde erfolgreich von ${member} entfernt.`,
                components: []
            });

            // Log-Nachricht
            const logChannel = member.guild.channels.cache.get("1263436406655680513");
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Rolle entfernt')
                    .setDescription(`${interaction.user} hat die Rolle ${selectedRole.toString()} von ${member} entfernt.`)
                    .setThumbnail(member.user.displayAvatarURL({ format: "png", dynamic: true, size: 256 }))
                    .setColor('Blurple')
                    .setTimestamp();

                logChannel.send({ embeds: [logEmbed] });
            }
        } catch (error) {
            await selectInteraction.update({
                content: `> \`❌\` » Es gab einen Fehler beim Entfernen der Rolle.\n\n**${error.message}**`,
                components: []
            });
        }
    },
};
