const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const userDB = require("../../../Datenbank/userdb")


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

        let userData = await userDB.findOne({userID: member.id})

        if(!userData) {
            userData = new userDB({
                userID: member.id, 
                donation: 0,
                reactions: {}
            })
        }

        const confirmButton = new ButtonBuilder()
        .setCustomId('confirm')
        .setLabel('Bestätigen')
        .setStyle(ButtonStyle.Danger);

        const cancelButton = new ButtonBuilder()
            .setCustomId('cancel')
            .setLabel('Abbrechen')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);
        
        const response1 = await interaction.reply({
            content: `> \`❗\` » Möchtest du wirklich den Betrag in Höhe von \`${amount}\` hinzufügen?`,
            components: [row],
            ephemeral: true,
            
        });
        const collectorFilter1 = i => i.user.id === interaction.user.id;
    
    try {
        const confirmation = await response1.awaitMessageComponent({ filter: collectorFilter1, time: 30_000 });
            if (confirmation.customId === 'confirm') {     
                userData.donation = Number(userData.donation += amount);
                await userData.save();
        
                const donateEmbed = new EmbedBuilder()
                    .setTitle('`💖` × SPENDE ERHALTEN!')
                    .setDescription(`> \`✅\` » ${interaction.user} hat ${member} eine Spende von \`${amount}€\` erhalten!`)
                    .setColor('Green')
                    .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
                    .setTimestamp();
        
                await confirmation.update({ content: null, embeds: [donateEmbed], ephemeral: true, components: [] });
        } else if (confirmation.customId === 'cancel') {
            await confirmation.update({ content:  `> \`❌\` » Du hast die Spende in Höhe von \`${amount}\` **nicht hinzugefügt**`, ephemeral: true, components: [] });
        }
    } catch (e) {
        console.log(e)
        await interaction.editReply({ content: "> `⏰` » Zeit ist abgelaufen", ephemeral: true, components: [] });
        }
    }
}
