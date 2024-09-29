const { SlashCommandBuilder, PermissionBitField } = require('discord.js');
const cooldowns = new Map(); // For storing user cooldowns

//Placeholder Code muss noch gecodet werden

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cooldown')
        .setDescription('changes the cooldown between messages that will be give users xp.')
        .addIntegerOption(option => 
            option.setName('seconds')
                .setDescription('The cooldown time in seconds.')
                .setRequired(true)),
    
    async execute(interaction) {
        const seconds = interaction.options.getInteger('seconds');
        const userId = interaction.user.id;

        // Check if the user is already in cooldown
        if (cooldowns.has(userId)) {
            const cooldownExpiration = cooldowns.get(userId);
            const now = Date.now();

            if (now < cooldownExpiration) {
                const remainingTime = (cooldownExpiration - now) / 1000;
                return interaction.reply(`You are still on cooldown for ${remainingTime.toFixed(1)} seconds.`);
            }
        }

        // Set the new cooldown
        cooldowns.set(userId, Date.now() + (seconds * 1000));

        interaction.reply(`Cooldown set for ${seconds} seconds.`);

        // Optionally, remove the cooldown after it expires
        setTimeout(() => {
            cooldowns.delete(userId);
        }, seconds * 1000);
    }
};
