import { AuditLogEvent, EmbedBuilder } from "discord.js";
import client from "../index.js";
import { sendLog, ThreadIDs } from "../functions/sendLog.js";

const typeMap = {
    0: "TEXT",
    2: "VOICE",
    5: "NEWS",
    13: "STAGE",
    15: "FORUM"
};

client.on('channelCreate', async (channel) => {
    if (channel.type === 4) {
        return;
    }
    channel.guild.fetchAuditLogs({
        type: AuditLogEvent.CHANNEL_CREATE,
        limit: 1
    }).then(async () => {
        const CreateEmbed = new EmbedBuilder()
            .setTitle('`➕` | KANAL ERSTELLT')
            .setDescription(`> Name: \`${channel.name}\` (<#${channel.id}>)\n> ID: \`${channel.id}\``)
            .setColor('Green')
            .setTimestamp();

        await sendLog(ThreadIDs.CHANNEL, CreateEmbed)
    })
})

client.on('channelUpdate', async (oldChannel, newChannel) => {
    if (newChannel.type === 4) {
        return;
    }
    newChannel.guild.fetchAuditLogs({
        type: AuditLogEvent.CHANNEL_UPDATE,
        limit: 1
    }).then(async audit => {
        const { executor } = audit.entries.first();

        let type = typeMap[newChannel.type] || newChannel.type;

        let description = `\`📂\` » **Informationen:**\n<:text3:1228332174911213638>**Name:** \`${newChannel.name}\` (<#${newChannel.id}>)\n<:text2:1228330539941888011>**Kanaltyp:** \`${type}\`\n`;

        let changesDetected = false;

        if (oldChannel.name !== newChannel.name) {
            description += `\n\`✒️\` » **Namensänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.name}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.name}\``;
            changesDetected = true;
        }
        if (oldChannel.nsfw !== newChannel.nsfw) {
            description += `\n\`🔞\` » **Altersbegrenzung:**\n<:text2:1228330539941888011>${newChannel.nsfw ? "<:on:1228350947898687508>" : "<:off:1228350962205200475>"}`;
            changesDetected = true;
        }
        if (oldChannel.topic !== newChannel.topic) {
            description += `\n\`🏝️\` » **Beschreibungsänderung:**\n<:text3:1228332174911213638>**Alt:** \`${oldChannel.topic || "❌"}\`\n<:text2:1228330539941888011>**Neu:** \`${newChannel.topic || "❌"}\``;
            changesDetected = true;
        }
        if (oldChannel.rateLimitPerUser !== newChannel.rateLimitPerUser) {
            description += `\n\`🦥\` » **Slowmode:**\n<:text3:1228332174911213638>**Alt:** ${oldChannel.rateLimitPerUser || "<:off:1228350962205200475>"}\n<:text2:1228330539941888011>**Neu:** ${newChannel.rateLimitPerUser || "<:off:1228350962205200475>"}`;
            changesDetected = true;
        }

        if (!changesDetected) {
            return;
        }

        const EditingEmbed = new EmbedBuilder()
            .setTitle('`🔁` | KANAL BEARBEITET')
            .setAuthor({ name: `${executor.username} » ${executor.id}`, iconURL: executor.displayAvatarURL({ dynamic: true, format: 'png', size: 2048 }) })
            .setDescription(description)
            .setColor('Orange')
            .setTimestamp();
        await sendLog(ThreadIDs.CHANNEL, EditingEmbed)
    })
});

client.on('channelDelete', async (channel) => {
    if (channel.type === 4) {
        return;
    }
    const DeleteEmbed = new EmbedBuilder()
        .setTitle('`🗑️` | KANAL GELÖSCHT')
        .setDescription(`> Name: ${channel.name}\nID: \`${channel.id}\``)
        .setColor('Red')
        .setTimestamp();

    await sendLog(ThreadIDs.CHANNEL, DeleteEmbed)
});

// Nachrichten Log
client.on('messageCreate', async (message) => {
    if (!message.author || message.author.bot) return;

    if (message.channelID === "1205936920866328576") return

    const MessageSendEmbed = new EmbedBuilder()
        .setTitle('`📨` | NACHRICHT GESENDET')
        .setDescription(`**${message.author.displayName}** hat eine Nachricht gesendet in ${message.channel}\n\n> Nachricht: ${message.content || '**Kein Inhalt**'}`)
        .setColor('Green')
        .setTimestamp();

    await sendLog(ThreadIDs.MESSAGE, MessageSendEmbed)
});

client.on('messageDelete', async (message) => {
    if (!message.author || message.author.bot) return;

    if (message.channelID === "1205936920866328576") return

    const MessageDeleteEmbed = new EmbedBuilder()
        .setTitle('`🗑️` | NACHRICHT GELÖSCHT')
        .setDescription(`Die Nachricht von **${message.author.displayName}** wurde gelöscht in ${message.channel}\n\n> Inhalt: ${message.content || '**Kein Inhalt**'}`)
        .setColor('Red')
        .setTimestamp();

    await sendLog(ThreadIDs.MESSAGE, MessageDeleteEmbed)
});

client.on('messageUpdate', async (oldMessage, newMessage) => {
    if (!newMessage.author || newMessage.author.bot) return;

    if (oldMessage.content === newMessage.content) return;

    const MessageEditEmbed = new EmbedBuilder()
        .setTitle('`🖊️` | NACHRICHT BEARBEITET')
        .setDescription(`Die Nachricht von **${newMessage.author.displayName}** wurde bearbeitet in ${oldMessage.channel}\n\n> Alte Nachricht: ${oldMessage.content || '**Kein Inhalt**'}\n> Neue Nachricht: ${newMessage.content || '**Kein Inhalt**'}`)
        .setColor('Orange')
        .setTimestamp();

    await sendLog(ThreadIDs.MESSAGE, MessageEditEmbed)
});
