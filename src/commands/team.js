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
                .setDescription('» Schau nach wann die Nächste Team-Besprechung statt findet. 📣')
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction, client) {
        const targetChannel = interaction.guild.channels.cache.get('1173986308641804338'); 
        const sub = interaction.options.getSubcommand();
        const grund = interaction.options.getString('grund') || 'Kein Grund angegeben';
        
        if (!targetChannel) {
            return interaction.reply('> `❌` » Fehler beim Verarbeiten des Befehls.');
        }

        switch (sub) {
            case "urlaub":
                const vonStr = interaction.options.getString('von');
                const bisStr = interaction.options.getString('bis');

                const parseDate = (dateStr) => {
                    const [day, month, year] = dateStr.split('.').map(Number);
                    return new Date(year, month - 1, day);
                };

                const now = new Date();
                const urlaubBeginn = parseDate(vonStr);
                const urlaubEnde = parseDate(bisStr);
        
                if (now < urlaubBeginn || now > urlaubEnde) {
                    return interaction.reply({ content: '> `❌` » Bitte gib gültige Daten im Format `DD-MM-YYYY` ein.', ephemeral: true });
                }

                const teamData = await teamdb.findOneAndUpdate(
                    { userID: member.id },
                    {
                        $set: {
                            'urlaub.beginn': vonStr,
                            'urlaub.ende': bisStr,
                            'urlaub.grund': grund,
                            'urlaub.messageId': null
                        },
                        $inc: { 'counter.urlaub': 1 } 
                    },
                    { new: true, upsert: true }
                );
        
                const urlaubEmbed = new EmbedBuilder()
                .setTitle('🌴 Urlaubsmeldung')
                .setDescription(`\`📅\` ${member} hat Urlaub von \`${vonStr}\` bis \`${bisStr}\`.\n\n\`📋\` Grund: \`${grund}\``)
                .setColor('Green')
                .setFooter({ text: `${member.username}'s Urlaub`, iconURL: member.displayAvatarURL() })
                .setTimestamp();
    
        
                const messageID = await channel.send({ embeds: [urlaubEmbed] });
                teamData.urlaub.messageId = message.id;
                await teamData.save();
                await interaction.reply({ content: '> `✅` » Deine Urlaubsmeldung wurde **erfolgreich** gesendet.', ephemeral: true });
                break;
            case "meeting":
                await interaction.reply({ content: '> `❌` » Derzeit ist keine Team-Besprechung geplant.', ephemeral: true });
                break;        
        }
    },
};