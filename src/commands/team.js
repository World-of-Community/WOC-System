const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const teamdb = require("../../Datenbank/teamdb");
const serverdb = require("../../Datenbank/serverdb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('team')
        .setDescription('Team')
        .addSubcommand((command) =>
            command
                .setName('urlaub')
                .setDescription('» Teile deinen Urlaub mit. 🌴')
                .addStringOption(option => option.setName('von').setDescription('Startdatum des Urlaubs (DD.MM.YYYY)').setRequired(true))
                .addStringOption(option => option.setName('bis').setDescription('Enddatum des Urlaubs (DD.MM.YYYY)').setRequired(true))
                .addStringOption(option => option.setName('grund').setDescription('Grund des Urlaubs').setRequired(false))
        )
        .addSubcommand((command) =>
            command
                .setName('meeting')
                .setDescription('» Schau nach wann die Nächste Team-Besprechung stattfindet. 📣')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    
    async execute(interaction, client) {
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); // ID des Zielkanals
        const sub = interaction.options.getSubcommand();
        const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';

        if (!targetChannel) {
            return interaction.reply('> `❌` » Fehler beim Verarbeiten des Befehls.');
        }

        switch (sub) {
            case "urlaub":
                const vonStr = interaction.options.getString('von');
                const bisStr = interaction.options.getString('bis');

                const convertDate = (dateStr) => {
                    const [day, month, year] = dateStr.split('.').map(Number);
                    return `${year}-${month}-${day}`;
                };

                const formattedVon = convertDate(vonStr);
                const formattedBis = convertDate(bisStr);

                if (!formattedVon || !formattedBis) {
                    return interaction.reply({ content: '> `❌` » Bitte gib gültige Daten im Format `DD.MM.YYYY` ein.', ephemeral: true });
                }

                const vonDate = new Date(formattedVon);
                const bisDate = new Date(formattedBis);

                if (vonDate > bisDate) {
                    return interaction.reply({ content: '> `❌` » Das Enddatum muss nach dem Startdatum liegen.', ephemeral: true });
                }

                const teamData = await teamdb.findOneAndUpdate(
                    { userID: interaction.user.id },
                    {
                        $set: {
                            'urlaub.beginn': formattedVon,
                            'urlaub.ende': formattedBis,
                            'urlaub.grund': grund,
                            'urlaub.messageID': null
                        },
                        $inc: { 'counter.urlaub': 1 } 
                    },
                    { new: true, upsert: true }
                );

                const urlaubEmbed = new EmbedBuilder()
                    .setTitle('🌴 Urlaubsmeldung')
                    .setDescription(`\`📅\` ${interaction.user} hat Urlaub von \`${vonStr}\` bis \`${bisStr}\`.\n\n\`📋\` Grund: \`${grund}\``)
                    .setColor('Green')
                    .setFooter({ text: `${interaction.user.username}'s Urlaub`, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp();

                const message = await targetChannel.send({ embeds: [urlaubEmbed] });
                teamData.urlaub.messageID = message.id;
                await teamData.save();

                await interaction.reply({ content: '> `✅` » Deine Urlaubsmeldung wurde **erfolgreich** gesendet.', ephemeral: true });
                break;

            case "meeting":
                await interaction.reply({ content: '> `❌` » Derzeit ist keine Team-Besprechung geplant.', ephemeral: true });
                break;        
        }
    },
};
