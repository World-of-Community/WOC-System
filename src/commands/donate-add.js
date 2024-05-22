const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const userDB = require("../../Datenbank/userdb")


module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate-add')
        .setDescription('» Füge den Betrag der Spende an einem User hinzu. 💸')
        .addUserOption(option => option.setName('user').setDescription('» Wähle einen Benutzer aus, der die Spende erhalten soll.').setRequired(true))
        .addIntegerOption(option => option.setName('amount').setDescription('» Gib den Betrag der Spende ein.').setMinValue(1).setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

    async execute(interaction) {
        const member = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        const userData = await userDB.findOne({userID: member.id})

        if(!userData) {
            await userDB.create({userID: member.id, donation: 0})
        }

        userData.donation = userData.donation + amount;
        await userData.save();

        const donateEmbed = new EmbedBuilder()
            .setTitle('`💖` × SPENDE ERHALTEN!')
            .setDescription(`> \`✅\` » ${interaction.user} hat ${member} eine Spende von \`${amount}€\` erhalten!`)
            .setColor('Green')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        await interaction.reply({ embeds: [donateEmbed], ephemeral: true });
    },
};
