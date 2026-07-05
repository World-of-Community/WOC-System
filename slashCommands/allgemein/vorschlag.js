import { ButtonBuilder, ButtonStyle, ActionRowBuilder, ChannelType } from "discord.js";

export default {
   name: "vorschlag",
    description: "» Verwalte ein Vorschlag. 💡",
    type: 1,
    default_member_permissions: "16",
    options: [],

async run(client, interaction) {
    if (interaction.channel.type !== ChannelType.PublicThread) return await interaction.reply({content: `> \`❌\` » Der Befehl kann nur in ein Vorschlag Thread ausgeführt werden.`, ephemeral: true})
    if (interaction.channel.parentId !== "1254340245772701747") return await interaction.reply({content: `> \`❌\` » Der Befehl kann nur in ein Vorschlag Thread ausgeführt werden.`, ephemeral: true})
        const message = await interaction.channel.fetchStarterMessage();
        const vorschlagsembed = message.embeds[0];

        if (vorschlagsembed.color === "Green") return await interaction.reply({ content: `> \`❌\` » Der Vorschlag wurde bereits akzeptiert.`, ephemeral: true });
        if (vorschlagsembed.color === "Grey") return await interaction.reply({ content: `> \`❌\` » Der Vorschlag wurde bereits in Planung gesetzt.`, ephemeral: true });
        if (vorschlagsembed.color === "Red") return await interaction.reply({ content: `> \`❌\` » Der Vorschlag wurde bereits abgelehnt.`, ephemeral: true });


        const accept = new ButtonBuilder()
        .setCustomId("vorschlag_accept")
        .setEmoji("✅")
        .setLabel("Annehmen")
        .setStyle(ButtonStyle.Success)
        const edit = new ButtonBuilder()
        .setCustomId("vorschlag_edit")
        .setEmoji("⚙️")
        .setLabel("In Planung")
        .setStyle(ButtonStyle.Secondary)
        const duplicate = new ButtonBuilder()
        .setCustomId("vorschlag_duplicate")
        .setEmoji("🔗")
        .setLabel("Doppelt")
        .setStyle(ButtonStyle.Primary)
        const delice = new ButtonBuilder()
        .setCustomId("vorschlag_delice")
        .setEmoji("❌")
        .setLabel("Ablehnen")
        .setStyle(ButtonStyle.Danger)

        const row = new ActionRowBuilder().addComponents(accept, edit, duplicate, delice)

        await interaction.reply({ content: `> \`💡\` » Wähle eine Aktion aus.`, components: [row], ephemeral: true })
    }
};
