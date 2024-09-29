const { SlashCommandBuilder, PermissionBitField } = require('discord.js');

//Placeholder Code muss noch gecodet werden

// Exporting the command
module.exports = {
    data: new SlashCommandBuilder()
        .setName('modifyxp')
        .setDescription('Modify the XP of a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose XP you want to modify')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of XP to add or remove')
                .setRequired(true)),
    
    async execute(interaction) {
        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        
        // Check if the user has permission (optional)
        if (!interaction.member.permissions.has('ADMINISTRATOR')) {
            return interaction.reply({ content: 'You do not have permission to modify XP!', ephemeral: true });
        }

        // Example MongoDB XP modification logic (you can customize this as per your schema)
        const userDb = await UserModel.findOne({ discordId: targetUser.id });
        if (!userDb) {
            return interaction.reply({ content: 'User not found in the database!', ephemeral: true });
        }

        // Update XP
        userDb.xp += amount;
        await userDb.save();

        // Send feedback to the channel
        await interaction.reply({ content: `${amount} XP has been added/removed to/from ${targetUser.username}.`, ephemeral: true });
    },
};
