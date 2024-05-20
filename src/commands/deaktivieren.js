const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const serverdb = require("../../Datenbank/serverdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deaktivieren')
        .setDescription('» Deaktiviere eine Funktion. 🔴')
        .addStringOption(option => option.setName('system').setDescription('» Welches System soll deaktiviert werden?').setRequired(true)
        .addChoices({ name: 'Changelog', value: 'changelog' }, { name: 'Spielersuche', value: 'spielersuche' }, { name: 'Vorschläge', value: 'vorschläge' }, { name: 'willkommensnachrichten', value: 'willkommensnachrichten' }))
        .setDefaultMemberPermissions(PermissionsBitField.ManageRoles),

    async execute(interaction) {

        const system = await interaction.options.getString('system')
        const serverData = await serverdb.findOne({ guildID: interaction.guildId })
        if (!serverData) return;

        await serverdb.findOneAndUpdate({ guildID: interaction.guildId }, { $push: { deactivated: `${system}` } })
        await interaction.reply({ content: `> \`🔴\` » Das ${system} System wurde erfolgreich deaktiviert.`, ephemeral: true })
    }
}