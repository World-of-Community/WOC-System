const fs = require('fs');
const cron = require('node-cron');
const Parser = require('rss-parser');
const parser = new Parser();
const { EmbedBuilder } = require("discord.js");

const rssConfig = require('./json/rssConfig.json');
const { parseString } = require('xml2js');

module.exports = {
    processRSSFeed: async (client, lastEntries) => {
        try {
            for (const feedConfig of rssConfig.feeds) {
                const feed = await parser.parseURL(feedConfig.url);

                if (feed.items && feed.items.length > 0) {
                    const newestEntry = feed.items[0];
                    const description = newestEntry.description || newestEntry.contentSnippet || `**Beschreibung wurde nicht gefunden.**`;

                    if (!await module.exports.isEntrySent(feedConfig.url, newestEntry.guid, lastEntries)) {
                        const embed = new EmbedBuilder();
                        if (newestEntry.title) embed.setTitle(newestEntry.title);
                        if (newestEntry.link) embed.setURL(newestEntry.link);
                        if (newestEntry.contentSnippet) {
                            embed.setDescription(`> ${newestEntry.contentSnippet}\n\n**© Erstellt von [World Of Community](https://discord.gg/zYk4GdSZSc)**`);
                        }
                      
                          // Bildextraktion
                            let imageUrl = await module.exports.extractImageFromEnclosure(newestEntry);
                            if (!imageUrl) {
                                imageUrl = await module.exports.extractImageFromMediaThumbnail(newestEntry);
                            }
                            if (!imageUrl && newestEntry['content:encoded']) {
                                imageUrl = await module.exports.extractImageFromContentEncoded(newestEntry['content:encoded']);
                            }

                            if (imageUrl) {
                                embed.setImage(imageUrl);
                            }

                        embed.setColor(feedConfig.message.color)
                            .setAuthor({ name: `» ${feedConfig.name}`, url: feed.link, iconURL: feedConfig.iconURL })
                            .setTimestamp();

                        const channel = client.channels.cache.get(feedConfig.message.channelId);
                        if (channel) {
                            channel.send({ content: feedConfig.message.content, embeds: [embed] })
                                .catch(error => console.error('Error sending embed message:', error));
                        }

                        module.exports.markEntryAsSent(feedConfig.url, newestEntry.guid, lastEntries);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
        }
    },

    isEntrySent: async (feedUrl, entryGuid, lastEntries) => {
        return lastEntries[feedUrl] === entryGuid;
    },

    markEntryAsSent: async (feedUrl, entryGuid, lastEntries) => {
        lastEntries[feedUrl] = entryGuid;
        module.exports.saveLastEntries(lastEntries);
    },

    saveLastEntries: async (lastEntries) => {
        fs.writeFile("src/json/lastEntries.json", JSON.stringify(lastEntries), (err) => {
            if (err) {
                console.error('Error saving lastEntries:', err);
            }
        });
    },

    getImageFromContent: async (content) => {
        let imageUrl = null;

        imageUrl = await module.exports.extractImageFromContentEncoded(content);

        if (!imageUrl) {
            imageUrl = await module.exports.extractImageFromMediaThumbnail(content);
        }
        return imageUrl;
    },

    extractImageFromEnclosure: async (item) => {
        if (item.enclosure && item.enclosure.url) {
            return item.enclosure.url;
        }
        return null;
    },
    

    extractImageFromMediaThumbnail: async (item) => {
        if (item['media:thumbnail'] && item['media:thumbnail'].url) {
            return item['media:thumbnail'].url;
        }
        return null;
    },

    extractImageFromContentEncoded: async (content) => {
        const regex = /<img\s+.*?src=(['"])(.*?)\1.*?>/i;
        const match = content.match(regex);
        return match ? match[2] : null;
    },
    

    shortenContent: async (content, maxLength) => {
        if (content.length <= maxLength) {
            return content;
        } else {
            return content.substring(0, maxLength - 3) + "...";
        }
    },
};
