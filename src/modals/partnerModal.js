import {
    ModalBuilder,
    ActionRowBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} from "discord.js";

export default {
    // ======================
    // MODAL ANZEIGEN
    // ======================
    showPartnerModal: async (interaction) => {
        const partnerModal = new ModalBuilder()
            .setTitle('🤝 - BEWERBEN ALS PARTNER')
            .setCustomId('partner-modal');

        const partnernameInput = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('partner-name')
                .setLabel('🔗 - WIE IST DER EINLADUNGSLINK DES SERVERS?')
                .setPlaceholder('https://discord.gg/xxxxx')
                .setStyle(TextInputStyle.Short)
                .setRequired(true)
        );

        const partnerbeschreibungInput = new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('partner-beschreibung')
                .setLabel('✍️ - BESCHREIBUNG DES SERVERS')
                .setPlaceholder('Wir sind ein deutscher Discord Server mit Community & Gaming …')
                .setMinLength(25)
                .setMaxLength(4000)
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true)
        );

        partnerModal.addComponents(partnernameInput, partnerbeschreibungInput);
        return interaction.showModal(partnerModal);
    },

    // ======================
    // MODAL ABSENDEN
    // ======================
    handlePartnerModalSubmit: async (interaction) => {
        if (interaction.customId !== "partner-modal") return;

        const partnerName = interaction.fields.getTextInputValue('partner-name');
        const partnerBeschreibung = interaction.fields.getTextInputValue('partner-beschreibung');

        const channel = await interaction.client.channels.fetch("1187028500461391984");

        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('🤝 » NEUE SERVER PARTNER ANFRAGE')
                    .setDescription(
                        `${interaction.user} möchte sich als **Server-Partner** bewerben!\n\n` +
                        `> 🔗 **Server-Link**\n${partnerName}\n\n` +
                        `> 💬 **Server-Beschreibung**\n${partnerBeschreibung}`
                    )
                    .setColor("Orange")
            ],
            components: [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`partner_accept_${interaction.user.id}`)
                        .setLabel("Akzeptieren")
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`partner_deny_${interaction.user.id}`)
                        .setLabel("Ablehnen")
                        .setStyle(ButtonStyle.Danger)
                )
            ]
        });

        return interaction.reply({
            content: "> ✅ Deine Anfrage wurde abgesendet. Bitte habe etwas Geduld.",
            ephemeral: true
        });
    },

    // ======================
    // BUTTON HANDLER
    // ======================
    handlePartnerButton: async (interaction) => {
        if (!interaction.isButton()) return;
        if (!interaction.customId.startsWith("partner_")) return;

        const [, action] = interaction.customId.split("_");
        const oldEmbed = interaction.message.embeds[0];
        if (!oldEmbed) return;

        const accepted = action === "accept";

        const updatedEmbed = EmbedBuilder.from(oldEmbed)
            .setTitle(
                `🤝 » NEUE SERVER PARTNER ANFRAGE - ${accepted ? "ANGENOMMEN" : "ABGELEHNT"}`
            )
            .setColor(accepted ? "Green" : "Red")
            .addFields({
                name: "`📌` Status",
                value: `${accepted ? "`🟢` **Angenommen**" : "`🔴` **Abgelehnt**"}\nvon ${interaction.user}`,
                inline: false
            });

        await interaction.update({
            embeds: [updatedEmbed],
            components: [] // Buttons entfernen
        });
    }
};

