const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, PermissionFlagsBits, ComponentType } = require('discord.js');
const mongoose = require('mongoose');
const axios = require('axios');
const PLACEHOLDER_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/d/d6/KeinBildVorhanden.jpg';

const YT_API_KEY = 'AIzaSyCvg3Nd7BkHQzLqbHDObsyNlX_fOzoU2-4';
const YOUTUBE_ROLE_ID = '1337362885101359146';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('» Schickt das YouTube-Embed. 🔴')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const { embed, videoUrl, videoId, channelName } = await getYouTubeEmbed();

            const row = createActionRow(videoUrl);

            const embedMessage = await interaction.channel.send({
                content: `> YouTube: https://www.youtube.com/@Red3405YT`,
                embeds: [embed],
                components: [row]
            });

            await interaction.reply({ content: '> Das **YouTube**-Embed wurde erfolgreich gesendet.', ephemeral: true });

            // Component collector für Notification-Toggle
            const collector = embedMessage.createMessageComponentCollector({ componentType: ComponentType.Button });

            collector.on('collect', async i => {
                if (i.customId === 'toggle_notify') {
                    const db = mongoose.connection.db;
                    const collection = db.collection('youtube_notify');
                    const userId = i.user.id;

                    const existing = await collection.findOne({ userId });

                    if (existing) {
                        await collection.deleteOne({ userId });
                        await i.reply({ content: '> `🔕` Du hast YouTube-Benachrichtigungen **deaktiviert**.', ephemeral: true });
                    } else {
                        await collection.insertOne({ userId });
                        await i.reply({ content: '> `🔔` Du hast YouTube-Benachrichtigungen **aktiviert**.', ephemeral: true });
                    }
                }
            });

            // Embed alle 60 Sekunden aktualisieren
            setInterval(async () => {
                try {
                    const { embed: updatedEmbed, videoUrl: updatedVideoUrl, videoId: updatedVideoId, channelName: updatedChannelName, isNewVideo, previousVideo } = await getYouTubeEmbed();

                    const updatedRow = createActionRow(updatedVideoUrl);

                    if (isNewVideo) {
                        // Sende Nachricht für das neue Video
                        const newVideoMessage = await interaction.channel.send({
                            content: `> <@&${YOUTUBE_ROLE_ID}> Ein neues Video von **${updatedChannelName}** ist verfügbar!`,
                            embeds: [updatedEmbed],
                            components: [updatedRow]
                        });

                        // Erstelle Thread für das vorherige Video
                        if (previousVideo) {
                            const threadName = `Diskussion: ${previousVideo.title}`;
                            const thread = await interaction.channel.threads.create({
                                name: threadName,
                                autoArchiveDuration: 60,
                                reason: 'Diskussion zum vorherigen Video'
                            });

                            const previousEmbed = new EmbedBuilder()
                                .setAuthor({ name: previousVideo.channelName || 'YouTube' })
                                .setTitle(previousVideo.title || 'Vorheriges Video')
                                .setDescription(previousVideo.description || 'Beschreibung nicht verfügbar.')
                                .setColor('Red')
                                .setImage(previousVideo.thumbnail || PLACEHOLDER_IMAGE)
                                .setURL(previousVideo.url || 'https://www.youtube.com');

                            await thread.send({ embeds: [previousEmbed] });
                        }
                    }

                    await embedMessage.edit({
                        content: `> <@&${YOUTUBE_ROLE_ID}> Hier ist das neueste YouTube-Video!`,
                        embeds: [
                            updatedEmbed.setFooter({ text: 'Zuletzt aktualisiert:' }).setTimestamp()
                        ],
                        components: [updatedRow]
                    });
                } catch (error) {
                    console.error('Fehler beim Aktualisieren des Embeds:', error);
                }
            }, 60000);

        } catch (error) {
            console.error('Fehler beim Senden des YouTube-Embeds:', error);
            await interaction.reply({ content: `> \`❌\` » Fehler beim Laden des YouTube-Embeds.\n\n**${error.message}**`, ephemeral: true });
        }
    },
};

async function getYouTubeEmbed() {
    const db = mongoose.connection.db;
    const collection = db.collection('youtube_channels');
    const channels = await collection.find().toArray();

    let latestVideos = [];

    for (const { channelId, lastVideoId } of channels) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=1`;

        try {
            const response = await axios.get(url);
            const latestVideo = response.data.items[0];

            if (!latestVideo) continue;

            const videoId = latestVideo.id.videoId;

            const videoData = {
                title: latestVideo.snippet.title,
                description: latestVideo.snippet.description,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                thumbnail: latestVideo.snippet.thumbnails.medium.url,
                channelName: latestVideo.snippet.channelTitle,
                videoId: videoId
            };

            let isNewVideo = false;
            let previousVideo = null;

            if (videoId !== lastVideoId) {
                isNewVideo = true;

                // Hole Daten des vorherigen Videos
                if (lastVideoId) {
                    const previousUrl = `https://www.googleapis.com/youtube/v3/videos?key=${YT_API_KEY}&id=${lastVideoId}&part=snippet`;
                    const previousResponse = await axios.get(previousUrl);
                    const previousVideoData = previousResponse.data.items[0];

                    if (previousVideoData) {
                        previousVideo = {
                            title: previousVideoData.snippet.title,
                            description: previousVideoData.snippet.description,
                            url: `https://www.youtube.com/watch?v=${lastVideoId}`,
                            thumbnail: previousVideoData.snippet.thumbnails.medium.url,
                            channelName: previousVideoData.snippet.channelTitle
                        };
                    }
                }

                await collection.updateOne({ channelId }, { $set: { lastVideoId: videoId } });
            }

            latestVideos.push({ ...videoData, isNewVideo, previousVideo });
        } catch (error) {
            console.error(`Fehler beim Abrufen der Videos von Kanal ${channelId}:`, error);
        }
    }

    if (latestVideos.length === 0) {
        return {
            embed: new EmbedBuilder()
                .setTitle('Noch kein Video verfügbar')
                .setDescription('Sobald ein neues Video hochgeladen wird, erscheint es hier!')
                .setColor('Red')
                .setImage(PLACEHOLDER_IMAGE)
                .setURL('https://www.youtube.com'),
            videoUrl: 'https://www.youtube.com',
            videoId: null,
            channelName: null,
            isNewVideo: false,
            previousVideo: null
        };
    }

    const video = latestVideos[0];

    const embed = new EmbedBuilder()
        .setAuthor({ name: video.channelName || 'YouTube' })
        .setTitle(video.title || 'Noch kein Video verfügbar')
        .setDescription(video.description || 'Sobald ein neues Video hochgeladen wird, erscheint es hier!')
        .setColor('Red')
        .setImage(video.thumbnail || PLACEHOLDER_IMAGE)
        .setURL(video.url || 'https://www.youtube.com');

    return {
        embed,
        videoUrl: video.url,
        videoId: video.videoId,
        channelName: video.channelName,
        isNewVideo: video.isNewVideo,
        previousVideo: video.previousVideo
    };
}

function createActionRow(videoUrl) {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('toggle_notify')
            .setLabel('Benachrichtigung an/aus')
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setLabel('Jetzt ansehen')
            .setStyle(ButtonStyle.Link)
            .setURL(videoUrl || 'https://www.youtube.com')
    );
}

/*

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const axios = require('axios');
const YouTubeChannel = require("../../../Datenbank/youtubedb");
const PLACEHOLDER_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/d/d6/KeinBildVorhanden.jpg'; // Ersetze mit einer echten URL

// YouTube API Key
const YT_API_KEY = 'Dein_Youtube_API_Schlüssel'; // Deinen YouTube API Key hier einfügen

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('» Schickt das YouTube-Embed. 🔴')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            // Rufe das neueste Video ab
            const embed = await getYouTubeEmbed();

            // Sende das Embed als Antwort auf den Befehl
            const YouTubeEmbed = await interaction.reply({ content: `> \`🔴\` » Hier ist das neueste YouTube-Video!`, embeds: [embed], fetchReply: true });

            // Speichere die Nachricht für spätere Updates
            updateMessage(YouTubeEmbed, message);

            await interaction.channel.send({ embeds: [YouTubeEmbed] })
            await interaction.reply({ content: '> Das **YouTube**-Embed wurde erfolgreich gesendet.', ephemeral: true })

        } catch (error) {
            await interaction.reply({ content: `> \`❌\` » Es gab einen Fehler beim Laden des YouTube-Embeds.\n\n**${error.message}**`, ephemeral: true });
        }
    },
};

// Funktion zum Abrufen der YouTube-Daten und Erstellen des Embeds
async function getYouTubeEmbed() {
    const db = mongoose.connection.db;
    const collection = db.collection('youtube_channels');
    const channels = await collection.find().toArray();

    let latestVideos = [];

    for (const { channelId, lastVideoId } of channels) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=1`;
        const response = await axios.get(url);
        const latestVideo = response.data.items[0];

        // Wenn ein neues Video vorhanden ist, aktualisiere die Datenbank
        if (latestVideo.id.videoId !== lastVideoId) {
            await collection.updateOne({ channelId }, { $set: { lastVideoId: latestVideo.id.videoId } });

            const videoData = {
                title: latestVideo.snippet.title,
                description: latestVideo.snippet.description,
                url: `https://www.youtube.com/watch?v=${latestVideo.id.videoId}`,
                thumbnail: latestVideo.snippet.thumbnails.medium.url,
                channelName: latestVideo.snippet.channelTitle,
                channelId: latestVideo.snippet.channelId // Kanal-ID für das Profilbild
            };

            // Hole das Profilbild des YouTube-Kanals
            const channelInfoUrl = `https://www.googleapis.com/youtube/v3/channels?key=${YT_API_KEY}&id=${videoData.channelId}&part=snippet`;
            const channelResponse = await axios.get(channelInfoUrl);
            const channelInfo = channelResponse.data.items[0];
            const channelThumbnail = channelInfo.snippet.thumbnails.high.url;

            // Erstelle das Embed
            const embed = new EmbedBuilder()
                .setAuthor({ name: videoData.channelName || 'YouTube', iconURL: channelThumbnail || PLACEHOLDER_IMAGE })
                .setTitle(videoData.title || 'Noch kein Video verfügbar')
                .setDescription(videoData.description || 'Sobald ein neues Video hochgeladen wird, erscheint es hier!')
                .setColor('Red')
                .setImage(videoData.thumbnail || PLACEHOLDER_IMAGE)
                .setURL(videoData.url || 'https://www.youtube.com');

            latestVideos.push(embed);
        }
    }

    // Wenn keine neuen Videos gefunden wurden, füge einen Platzhalter hinzu
    if (latestVideos.length === 0) {
        return new EmbedBuilder()
            .setTitle('Noch kein Video verfügbar')
            .setDescription('Sobald ein neues Video hochgeladen wird, erscheint es hier!')
            .setColor('Red')
            .setImage('https://example.com/placeholder-image.png')
            .setURL('https://www.youtube.com');
    }

    return latestVideos[0];
}

// Funktion, um das Embed später zu aktualisieren
async function updateMessage(embed, message) {
    setInterval(async () => {
        const updatedEmbed = await getYouTubeEmbed();
        
        // Bearbeite die Nachricht und aktualisiere das Embed
        message.edit({
            content: `> \`🔴\` » Hier ist das neueste YouTube-Video!`,
            embeds: [updatedEmbed],
        });
    }, 60000); // Alle 60 Sekunden (1 Minute) das Embed aktualisieren
}

*/

/*

const axios = require('axios');
require('discordjs').config();
const mongoose = require('mongoose');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const mongo = new MongoClient(process.env.MONGO_URI);
const YT_API_KEY = process.env.YOUTUBE_API_KEY;
const DISCORD_CHANNEL_ID = "1274833689821319308";
const THREAD_NAME = '📢 YouTube-Updates';
const CHECK_INTERVAL = 1 * 60 * 1000; // Alle 1 Minute
const PLACEHOLDER_IMAGE = 'https://upload.wikimedia.org/wikipedia/commons/d/d6/KeinBildVorhanden.jpg'; // Ersetze mit einer echten URL

async function fetchLatestVideos(channelId) {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=1`;
    const response = await axios.get(url);
    return response.data.items[0];
}

async function updateThread(videoData) {
    const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
    if (!(channel instanceof TextChannel)) return;
    
    let thread = channel.threads.cache.find(t => t.name === THREAD_NAME);
    if (!thread) thread = await channel.threads.create({ name: THREAD_NAME, autoArchiveDuration: 60 });

    const db = mongo.db('discordbot');
    const collection = db.collection('youtube');
    
    await collection.updateOne({ threadId: thread.id }, { $push: { videos: videoData } }, { upsert: true });
    
    const data = await collection.findOne({ threadId: thread.id });
    const lastVideos = data?.videos?.slice(-5) || [];
    
    const YouTubeEmbed = new EmbedBuilder()
        .setAuthor({ name: videoData.channelName || 'YouTube' })
        .setTitle(videoData.title || 'Noch kein Video verfügbar')
        .setDescription(videoData.description || 'Sobald ein neues Video hochgeladen wird, erscheint es hier!')
        .setColor('Red')
        .setImage(videoData.thumbnail || PLACEHOLDER_IMAGE)
        .setURL(videoData.url || 'https://www.youtube.com');

    let messageContent = `**${videoData.channelName || 'YouTube'} hat ein neues Video veröffentlicht!**\n\n`;
    lastVideos.forEach(v => messageContent += `[${v.title}](${v.url})\n`);
    
    const messages = await thread.messages.fetch({ limit: 1 });
    if (messages.size > 0) {
        const msg = messages.first();
        await msg.edit({ content: messageContent, embeds: [YouTubeEmbed] });
    } else {
        await thread.send({ content: messageContent, embeds: [YouTubeEmbed] });
    }
}

async function checkYouTubeUpdates() {
    const db = mongo.db('discordbot');
    const collection = db.collection('youtube_channels');
    const channels = await collection.find().toArray();

    for (const { channelId, lastVideoId } of channels) {
        const latestVideo = await fetchLatestVideos(channelId);
        if (!latestVideo || latestVideo.id.videoId === lastVideoId) continue;

        await collection.updateOne({ channelId }, { $set: { lastVideoId: latestVideo.id.videoId } });
        await updateThread({
            title: latestVideo.snippet.title,
            description: latestVideo.snippet.description,
            url: `https://www.youtube.com/watch?v=${latestVideo.id.videoId}`,
            thumbnail: latestVideo.snippet.thumbnails.medium.url,
            channelName: latestVideo.snippet.channelTitle
        });
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'youtube-embed') {
        await interaction.deferReply();
        const db = mongo.db('discordbot');
        const data = await db.collection('youtube').findOne();
        const lastVideo = data?.videos?.slice(-1)[0];

        await updateThread(lastVideo || {
            title: 'Noch kein Video verfügbar',
            description: 'Sobald ein neues Video hochgeladen wird, erscheint es hier!',
            url: 'https://www.youtube.com',
            thumbnail: PLACEHOLDER_IMAGE,
            channelName: 'YouTube'
        });
        await interaction.editReply({ content: 'Das YouTube-Embed wurde aktualisiert!', ephemeral: true });
    }
});
*/
