const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, PermissionBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lock')
        .setDescription('Sperre einen bestimmten Kanal. 🔒')
        .addChannelOption(option =>  option.setName('kanal').setDescription('Der Kanal, der gesperrt werden soll.').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

async execute(interaction) {
    const channel = interaction.options.getChannel('kanal');
    const memberRole = interaction.guild.roles.cache.get('815920703067914290');

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

    // Sperre den Kanal für die Mitgliederrolle (z.B. @everyone oder eine bestimmte Mitglieder-Rolle)
    //const memberRole = interaction.guild.roles.everyone; // Alternativ kannst du hier eine spezifische Mitglieder-Rolle wählen
    //await channel.permissionOverwrites.edit(memberRole, {
    //    SendMessages: false, // Verhindert das Senden von Nachrichten für Mitglieder
    //});

    // Erstelle das Embed
    const LockEmbed = new EmbedBuilder()
    .setTitle('Kanal wurde gesperrt')
    .setDescription(`Der Chat ist derzeit gesperrt, da nicht genügend Personal verfügbar ist, um den Chat zu moderieren.\n\nWenn du benachrichtigt werden möchtest, wenn der Chat entsperrt wird, klicke auf den Button unten.`)
    .setColor('Blurple')
    .setThumbnail('https://cdn.discordapp.com/attachments/1269339944766144574/1286373310653010043/Support_Chat.png?ex=66edac00&is=66ec5a80&hm=321e66b98cadfa0a410be9c76ddc613345254b55caa6f6967039766afd9f65eb&')
    .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
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

    await interaction.channel.send({ embeds: [LockEmbed], components: [Lock] });
    await interaction.reply({ content: '> `✅` » Das Lock-Embed wurde erfolgreich gesendet.', ephemeral: true });

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

        // Erhalte den Benutzer, der den Button geklickt hat
        const member = interaction.member;

        // Hier kannst du das Teammitglied erwähnen
        await targetChannel.send(`> ${member} hat angefragt. <@&1286370548384927825>, bitte kümmert euch um den ${channel} (gesperrten) Chat!`);
        await interaction.reply({ content: '> `✅` » Das zuständige Teammitglied wurde informiert.', ephemeral: true });

    } else if (customId === 'unlock_chat') {
        
        // Überprüfe, ob der Benutzer die Berechtigung 'ManageChannels' hat
        if (!interaction.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.reply({ content: '> `❌` » Du hast keine Berechtigung, um den Chat zu entsperren.', ephemeral: true });
        }

        // Berechne den aktuellen Unix-Timestamp und den Timestamp für 30 Sekunden später
        const deleteTimestamp = Math.floor(Date.now() / 1000) + 30; // Zeitstempel für 30 Sekunden später
    
        // Sende die Nachricht mit dem Unix-Timestamp für den Zeitpunkt, wann die Nachricht gelöscht wird
        const msg = await interaction.reply({ content: `> <@&1286370385108926536>, Chat wird entsperrt...\n(Diese Nachricht wird automatisch gelöscht <t:${deleteTimestamp}:R>).`});
    
        // Füge hier die Logik zum Entsperren des Chats hinzu
        const channel = interaction.channel; // Hole den aktuellen Kanal
        const memberRole = interaction.guild.roles.everyone; // @everyone-Rolle oder spezifische Rolle, die du entsperren möchtest
    
        // Setze die Berechtigungen zurück, sodass Mitglieder wieder schreiben können
        await channel.permissionOverwrites.edit(memberRole, {
            SendMessages: true, // Erlaube das Senden von Nachrichten für Mitglieder
        });
    
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