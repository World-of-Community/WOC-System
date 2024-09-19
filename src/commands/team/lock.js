const { SlashCommandBuilder } = require('discord.js');

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

    // Erstelle das Embed
    const LockEmbed = new EmbedBuilder()
    .setTitle('Kanal wurde gesperrt')
    .setDescription(`Der Chat ist derzeit gesperrt, da nicht genügend Personal verfügbar ist, um den Chat zu moderieren.\n\nWenn du benachrichtigt werden möchtest, wenn der Chat entsperrt wird, klicke auf den Button unten.`)
    .setColor('Blurple')
    .setTimestamp();

    const Lock = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('mention_mod')
                .setLabel('» Teammitglied Informieren')
                .setEmoji('💬')
                .setStyle(ButtonStyle.Primary),
            new 
            new ButtonBuilder()
                .setCustomId('unlock_chat')
                .setLabel('» Kanal entsperren')
                .setEmoji('🔓')
                .setStyle(ButtonStyle.Primary),
        );

    await interaction.reply({ embeds: [LockEmbed], components:[Lock] });

    if (!interaction.isButton()) return;

    const { customId } = interaction;

    if (!interaction.isButton()) return;

    const { customId } = interaction;

    // Stelle sicher, dass der Kanal, in dem die Nachricht gesendet werden soll, bekannt ist
    const targetChannel = interaction.guild.channels.cache.find(channel => channel.name === 'name-des-kanals'); // Ersetze 'name-des-kanals' durch den tatsächlichen Namen des Kanals

    if (customId === 'mention_mod') {
        if (!targetChannel) {
            return await interaction.reply({ content: '> `❌` » Kanal wurde nicht gefunden.', ephemeral: true });
        }
        
        // Hier kannst du das Teammitglied erwähnen, z.B. @Teammitglied
        await targetChannel.send(`<@1286370548384927825>, bitte kümmert euch um den gesperrten Chat!`);
        await interaction.reply({ content: '> `✅` » Das zuständige Teammitglied wurde Informiert.', ephemeral: true });

    } else if (customId === 'unlock_chat') {
        // Sende die Nachricht
        const msg = await interaction.reply({ content: `<@1286370385108926536>, Chat wird entsperrt...` });
        
        // Füge hier die Logik zum Entsperren des Chats hinzu
    
        // Lösche die Nachricht nach 30 Sekunden
        setTimeout(async () => {
            if (msg) {
                await msg.delete().catch(console.error); // Fehlerbehandlung falls die Nachricht nicht gelöscht werden kann
            }
        }, 30000); // 30 Sekunden
    }
  },
};