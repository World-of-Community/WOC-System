const { SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const serverdb = require("../../Datenbank/serverdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aktivieren')
        .setDescription('» Aktiviere eine Funktion. 🟢')
        .addStringOption(option => option.setName('system').setDescription('Welches System soll aktiviert werden?').setRequired(true)
        .addChoices({ name: 'Changelog', value: 'changelog' }, { name: 'Spielersuche', value: 'spielersuche' }, { name: 'Vorschläge', value: 'vorschläge' }, { name: 'willkommensnachrichten', value: 'willkommensnachrichten' })),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;
        const system = await interaction.options.getString('system')
        const serverData = await serverdb.findOne({ guildID: interaction.guildId })
        if (!serverData) return;

        await serverdb.findOneAndUpdate({ guildID: interaction.guildId }, { $pull: { deactivated: `${system}` } })
        await interaction.reply({ content: `> \`🟢\` » Das ${system} System wurde erfolgreich aktiviert.`, ephemeral: true })
    }
}