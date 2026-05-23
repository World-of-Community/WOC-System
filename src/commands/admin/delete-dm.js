import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('delete-dm')
        .setDescription('Löscht eine DM-Nachricht vom Bot per ID')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('ID der Nachricht, die gelöscht werden soll')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    /**
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');

        try {
            // DM Channel mit dem User
            const dmChannel = await interaction.user.createDM();
            const message = await dmChannel.messages.fetch(messageId);

            await message.delete();
            await interaction.reply({ content: '> `✅` » Nachricht erfolgreich gelöscht.', ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '> `❌` » Nachricht konnte nicht gelöscht werden. Prüfe die ID.', ephemeral: true });
        }
    },
};
