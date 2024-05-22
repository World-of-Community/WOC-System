const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const userDB = require("../../Datenbank/userdb")

module.exports = {
     // /donate command
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('» Zeigt die Gesamtspenden eines Benutzers an. 💖')
        .addUserOption(option => option.setName('user').setDescription('» Wähle einen Benutzer aus, um die Gesamtspenden zu sehen.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const member = interaction.options.getUser('user');
        const userData = await userDB.findOne({userID: member.id})

        if(!userData || !userData.donation) return await interaction.reply({content: `Red machen sie den Text lol`})

        const donateEmbed = new EmbedBuilder()
            .setTitle('`💖` × GESAMTSPENDEN')
            .setDescription(`> \`✅\` » ${member} hat insgesamt \`${userData.donation}€\` gespendet!`)
            .setColor('Green')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        await interaction.reply({ embeds: [donateEmbed], ephemeral: true });
    },
};