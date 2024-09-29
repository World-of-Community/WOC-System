const { SlashCommandBuilder, PermissionBitField } = require('discord.js');
//const UserModel = require('../models/User'); // Assuming you have a User model for MongoDB

//Placeholder Code muss noch gecodet werden

module.exports = {
    data: new SlashCommandBuilder()
        .setName('givelevel')
        .setDescription('Assign a level to a user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to assign the level to')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('The level to assign')
                .setRequired(true)),
    
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const level = interaction.options.getInteger('level');

        try {
            // Fetch the user from the database
            const userDoc = await UserModel.findOne({ userId: user.id });

            if (!userDoc) {
                return interaction.reply({ content: 'User not found in the database.', ephemeral: true });
            }

            // Update the user's level
            userDoc.level = level;
            await userDoc.save();

            return interaction.reply({ content: `Successfully assigned level ${level} to ${user.username}.` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error updating the level.', ephemeral: true });
        }
    },
};
