const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    async execute(interaction) {
        if (!interaction.isButton()) return;

        // Modal öffnen
        if (interaction.customId === 'partner') {
            const modalHandler = require("../modals/partnerModal");
            return modalHandler.showPartnerModal(interaction);
        }

        // Anfrage akzeptieren
        if (interaction.customId.startsWith("partner_accept_")) {
            const id = interaction.customId.split("_")[2];
            const user = await interaction.client.users.fetch(id);

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("`✅` » ANFRAGE ANGENOMMEN")
                        .setDescription(`> » Deine Server-Partner Bewerbung auf **[${interaction.guild.name}](https://discord.gg/686M8Cxsaa)** wurde angenommen.\n\n> Bitte öffne noch ein Ticket und wähle \`Normaler Support\` aus.`)
                        .setColor("Green")
                ]
            });

            await interaction.message.edit({ components: [] });
            return interaction.reply({ content: `> \`❗\` » Die Server-Partner Anfrage wurde von **${interaction.user.displayName}** angenommen. \`✅\``, ephemeral: true });
        }

        // Anfrage ablehnen
        if (interaction.customId.startsWith("partner_deny_")) {
            const id = interaction.customId.split("_")[2];
            const user = await interaction.client.users.fetch(id);

            await user.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("`❌` » ANFRAGE ABGELEHNT")
                        .setDescription(`> » Deine Server-Partner Bewerbung auf **${interaction.guild.name}** wurde abgelehnt. \`❌\``)
                        .setColor("Red")
                ]
            });

            await interaction.message.edit({ components: [] });
            return interaction.reply({ content: `> \`❗\` » Die Server-Partner Anfrage wurde von **${interaction.user.displayName}** abgelehnt.`, ephemeral: true });
        }
    }
};
