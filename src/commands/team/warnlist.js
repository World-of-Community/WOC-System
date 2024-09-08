const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const warndb = require("../../../Datenbank/warndb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warnlist')
        .setDescription('» Zeigt dir die Warnliste an. 📋')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('» Füge einen Benutzer zur Warnliste hinzu.')
                .addUserOption(option => 
                    option.setName('user')
                        .setDescription('» Der Benutzer, der gewarnt werden soll.')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('grund')
                        .setDescription('» Der Grund für die Warnung.')
                        .setRequired(true))),

    async execute(interaction)  {

        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '`❌` » Du hast keine Berechtigung, diesen Befehl zu verwenden.', ephemeral: true });
        }

        if (subcommand === 'add') {
            const user = interaction.options.getUser('user');
            const reason = interaction.options.getString('grund');
            const userId = user.id;

            // Warnung in der Datenbank speichern
            let warningData = await warndb.findOne({ guildId: interaction.guild.id, userId });

            if (warningData) {
                // Füge eine neue Warnung hinzu
                warningData.warning.push({ reason });
                await warningData.save();
            } else {
                // Erstelle einen neuen Eintrag
                await new warndb({
                    guildId: interaction.guild.id,
                    userId,
                    warnings: [{ reason }],
                }).save();
            }
        }

        // Warnliste formatieren
        let list = 'Warnliste:\n';
        warnings.forEach(({ userId, warnings }) => {
            list += `<@${userId}>: \`${warnings.length}\` Warnung(en)\n`;
        });

        const WarnEmbed = new EmbedBuilder()
            .setTitle('Information zu den Warnungen der Nutzer')
            .setDescription(`Hier ist eine Liste der Warnungen der Nutzer \n\n ${warnings.length > 0 ? warnings.join("\n") : "> `❌` » Keine Warnungen vorhanden!"}`)
            .setColor('Red')

        await interaction.channel.send({ embeds: [WarnEmbed] })
        await interaction.reply({ content: "> `✅` » Das Warn-Embed wurde gesendet.", ephemeral: true })
    }
}