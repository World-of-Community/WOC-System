import { EmbedBuilder } from "discord.js";

export default {
    id: 'feedback_accept_close',
    run: async (client, interaction) => {
        if (!interaction.guild) return;

        await interaction.deferUpdate();

        const acceptEmbed = new EmbedBuilder()
            .setTitle('`🗑️` » Ticket wird geschlossen')
            .setDescription('Dieses Ticket wird in **5 Sekunden** geschlossen.')
            .setColor('Green');

        await interaction.editReply({
            embeds: [acceptEmbed],
            components: []
        });

        setTimeout(async () => {
            if (interaction.channel?.isThread()) {
                await interaction.channel.setArchived(true, 'Feedback-Ticket geschlossen').catch(() => {});
            } else if (interaction.channel?.deletable) {
                await interaction.channel.delete().catch(() => {});
            } else {
                console.log('[FEEDBACK-BUTTON] Channel/Thread not closeable');
            }
        }, 5000);
    }
};
