const { SlashCommandBuilder, PermissionFlagsBits, Client, GatewayIntentBits } = require('discord.js');

let lastChannelId = null;
let lastMessageId = null;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', async () => {
    console.log(`${client.user.tag} ist online!`);

    const timestamp = Math.floor(Date.now() / 1000);

    if (lastChannelId && lastMessageId) {
        try {
            const channel = await client.channels.fetch(lastChannelId);
            const message = await channel.messages.fetch(lastMessageId);

            if (message) {
                await message.edit({ content: `> \`✅\` » Der Bot ist wieder online und einsatzbereit. (hochgefahren um <t:${timestamp}:R>)`, ephemeral: true });
            }
        } catch (error) {
            console.error('Fehler beim Bearbeiten der Wieder-Online-Nachricht:', error);
        }

        lastChannelId = null;
        lastMessageId = null;
    }
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('» Startet den Bot neu. (Admin/Dev Only)')
        .addStringOption(option =>
            option.setName('bestätigung')
                .setDescription('Bestätige mit "ja"')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const confirmation = interaction.options.getString('bestätigung');

        if (confirmation !== 'ja') {
            return interaction.reply({ content: '> `❗` » Du musst mit "ja" bestätigen, um den Bot neu zu starten.', ephemeral: true });
        }

        const timestamp = Math.floor(Date.now() / 1000);

        const message = await interaction.reply({ content: `> \`🕒\` » Der Bot wird neu gestartet... (<t:${timestamp}:R>) (Max. 30 Sekunden)`, fetchReply: true, ephemeral: true });
        lastChannelId = interaction.channel.id;
        lastMessageId = message.id;

        setTimeout(() => {
            process.exit();
        }, 2000);
    },
};
