export default {
    id: 'shoppass_',
    prefix: true,
    run: async (client, interaction) => {
        await interaction.reply({
            content: '> `ℹ️` » SeasonPass/ShopPass wurde entfernt.',
            ephemeral: true
        });
    }
};
