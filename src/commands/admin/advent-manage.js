const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const Advent = require("../../../Datenbank/adventdb"); // <- Pfad anpassen!

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advent-reset')
        .setDescription('» Setzt den Adventskalender für einen Benutzer zurück. 🔄')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option =>
            option.setName('user')
                .setDescription('Wähle den Benutzer, dessen Kalender zurückgesetzt werden soll.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser('user');

        let userData = await Advent.findOne({ userId: target.id });

        if (!userData) {
            return interaction.reply({
                content: `> \`ℹ️\` » Für **${target.tag}** existiert kein Adventskalender-Eintrag.`,
                ephemeral: true
            });
        }

        await Advent.deleteOne({ userId: target.id });

        return interaction.reply({
            content: `> \`🔄\` » Adventskalender für **${target.tag}** wurde **zurückgesetzt**!`,
            ephemeral: true
        });
    }
};
