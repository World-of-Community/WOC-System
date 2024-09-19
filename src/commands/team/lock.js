const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Sperre einen bestimmten Kanal. 🔒')
        .addChannelOption(option =>  option.setName('kanal').setDescription('Der Kanal, der gesperrt werden soll.').setRequired(true)),

async execute(interaction) {
    // Hole den Kanal aus den Optionen
    const channel = interaction.options.getChannel('kanal');

    // Überprüfe, ob der Kanal ein Textkanal ist
    if (!channel || channel.type !== 0) {
        return interaction.reply({ content: 'Bitte wähle einen gültigen Textkanal aus.', ephemeral: true });
    }

    // Sperre den Kanal für alle Benutzer außer dem Bot
    await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
        SendMessages: false, // Verhindert das Senden von Nachrichten für alle
    });

    // Gib dem Bot weiterhin die Berechtigung zum Schreiben
    await channel.permissionOverwrites.edit(interaction.guild.members.me, {
        SendMessages: true, // Erlaubt dem Bot das Senden von Nachrichten
    });

    // Erstelle das Embed
    const LockEmbed = new EmbedBuilder()
    .setTitle('Kanal wurde gesperrt')
    .setDescription(`Der Chat ist derzeit gesperrt, da nicht genügend Personal verfügbar ist, um den Chat zu moderieren.\n\nWenn du benachrichtigt werden möchtest, wenn der Chat entsperrt wird, klicke auf den Button unten.`)
    .setColor('Blurple')
    .setThumbnail('https://cdn.discordapp.com/attachments/1269339944766144574/1286373310653010043/Support_Chat.png?ex=66edac00&is=66ec5a80&hm=321e66b98cadfa0a410be9c76ddc613345254b55caa6f6967039766afd9f65eb&')
    .setTimestamp();

    const Lock = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('mention_mod')
                .setLabel('» Teammitglied Informieren')
                .setEmoji('💬')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('unlock_chat')
                .setLabel('» Kanal entsperren')
                .setEmoji('🔓')
                .setStyle(ButtonStyle.Secondary),
        );

    await interaction.reply({ embeds: [LockEmbed], components:[Lock] });
    await interaction.followUp({ content: '> `✅` » Das Lock-Embed wurde erfolgreich gesendet.', ephemeral: true });

    // Event-Handler für Button-Interaktionen
client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;

    // Stelle sicher, dass der Kanal, in dem die Nachricht gesendet werden soll, bekannt ist
    const targetChannel = interaction.guild.channels.cache.find(channel => channel.id === '1286372685755973684');

    if (customId === 'mention_mod') {
        if (!targetChannel) {
            return await interaction.reply({ content: '> `❌` » Kanal wurde nicht gefunden.', ephemeral: true });
        }

        // Hier kannst du das Teammitglied erwähnen
        await targetChannel.send(`<@&1286370548384927825>, bitte kümmert euch um den gesperrten Chat!`);
        await interaction.reply({ content: '> `✅` » Das zuständige Teammitglied wurde informiert.', ephemeral: true });

    } else if (customId === 'unlock_chat') {
        // Sende die Nachricht
        const msg = await interaction.reply({ content: `<@&1286370385108926536>, Chat wird entsperrt...`, fetchReply: true });

        // Füge hier die Logik zum Entsperren des Chats hinzu

        // Lösche die Nachricht nach 30 Sekunden
        setTimeout(async () => {
            if (msg) {
                await msg.delete().catch(console.error); // Fehlerbehandlung falls die Nachricht nicht gelöscht werden kann
            }
        }, 30000); // 30 Sekunden
    }
  });
  },
};