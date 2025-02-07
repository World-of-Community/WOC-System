const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const mongoose = require('mongoose');
const axios = require('axios');
const YouTubeChannel = require("../../../Datenbank/youtubedb");

// YouTube API Key
const YT_API_KEY = 'Dein_Youtube_API_Schlüssel'; // Deinen YouTube API Key hier einfügen

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube-update')
        .setDescription('» Überprüfe auf neue YouTube-Videos und benachrichtige den Benutzer.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const member = interaction.member;
        try {
            // Überprüfen, ob es neue Videos gibt
            await checkYouTubeUpdates(member);

            await interaction.reply({ content: `> \`✅\` » Die YouTube-Updates wurden erfolgreich überprüft!`, ephemeral: true });

        } catch (error) {
            await interaction.reply({ content: `> \`❌\` » Es gab einen Fehler bei der Überprüfung der YouTube-Updates.\n\n**${error.message}**`, ephemeral: true });
        }
    },
};

// YouTube-Daten prüfen und eine Nachricht senden, wenn ein Update verfügbar ist
async function checkYouTubeUpdates(member) {
    const db = mongoose.connection.db;
    const collection = db.collection('youtube_channels');
    const channels = await collection.find().toArray();

    for (const { channelId, lastVideoId } of channels) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${YT_API_KEY}&channelId=${channelId}&order=date&part=snippet&type=video&maxResults=1`;
        const response = await axios.get(url);
        const latestVideo = response.data.items[0];

        if (latestVideo.id.videoId !== lastVideoId) {
            // Wenn ein neues Video vorhanden ist, sende eine Nachricht
            await collection.updateOne({ channelId }, { $set: { lastVideoId: latestVideo.id.videoId } });
            const videoEmbed = new EmbedBuilder()
                .setTitle(latestVideo.snippet.title)
                .setDescription(latestVideo.snippet.description)
                .setURL(`https://www.youtube.com/watch?v=${latestVideo.id.videoId}`)
                .setImage(latestVideo.snippet.thumbnails.medium.url)
                .setAuthor({ name: latestVideo.snippet.channelTitle });

            // Überprüfe, ob der Benutzer YouTube-Updates haben möchte und sende das Video
            await member.send({ content: `Ein neues Video von deinem YouTube-Kanal ist verfügbar!`, embeds: [videoEmbed] });
        }
    }
}

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
