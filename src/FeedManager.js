const fs = require('fs');
const cron = require('node-cron');
const Parser = require('rss-parser');
const parser = new Parser();
const { EmbedBuilder } = require("discord.js")

module.exports = {
    
    // Free Games
    Giga: async (client, lastEntries) => {
        try {
            const feed = await parser.parseURL("https://www.giga.de/rss/games.rss"); 

            if (feed.items && feed.items.length > 0) {
                const newestEntry = feed.items[0];
                const description = newestEntry.description || newestEntry.contentSnippet || `**Beschreibung wurde nicht gefunden.**`
                if (!await module.exports.isEntrySent("https://www.giga.de/rss/games.rss", newestEntry.guid, lastEntries)) {
                    const embed = new EmbedBuilder();
                    if (newestEntry.title) embed.setTitle(newestEntry.title);
                    if (newestEntry.link) embed.setURL(newestEntry.link);

                    embed.setColor('Green')
                        .setAuthor({ name: "» Giga", url: feed.link, iconURL: "https://th.bing.com/th/id/OIP.doSKK2VtIVmPin6orrFFkwHaHa?rs=1&pid=ImgDetMain" })
                        .setDescription(`> ${description}\n\n**© Erstellt von [World Of Community](https://discord.gg/zYk4GdSZSc)**`)
                        .setImage(newestEntry.enclosure?.url)
                        .setTimestamp();

                    const channel = client.channels.cache.get('1230540230470144073');
                    if (channel) {
                        channel.send({ content: '`🎮` » Es gibt neue **Gaming News**, <@&1231257421016469596>!', embeds: [embed] })
                            .catch(error => console.error('Error sending embed message:', error));
                    }

                    module.exports.markEntryAsSent("https://www.giga.de/rss/games.rss", newestEntry.guid, lastEntries);
                }
            }
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
        }
    },

    // Film News
    Filmstarts: async (client, lastEntries) => {
        try {
            const feed = await parser.parseURL("https://www.filmstarts.de/rss/nachrichten.xml");

            if (feed.items && feed.items.length > 0) {
                const newestEntry = feed.items[0];

                if (!await module.exports.isEntrySent("https://www.filmstarts.de/rss/nachrichten.xml", newestEntry.guid, lastEntries)) {
                    const embed = new EmbedBuilder();
                    if (newestEntry.title) embed.setTitle(newestEntry.title);
                    if (newestEntry.link) embed.setURL(newestEntry.link);

                    if (newestEntry.contentSnippet) {
                        embed.setDescription(`> ${newestEntry.contentSnippet}\n\n**© Erstellt von [World Of Community](https://discord.gg/zYk4GdSZSc)**`);
                    }

                    if (newestEntry.enclosure && newestEntry.enclosure.url) {
                        embed.setImage(newestEntry.enclosure.url);
                    } else if (newestEntry['media:thumbnail'] && newestEntry['media:thumbnail'].url) {
                        embed.setImage(newestEntry['media:thumbnail'].url);
                    }    
                    const imageUrl = await module.exports.getImageFromContent(newestEntry['content:encoded']);
                    embed.setColor('Blue')
                    .setAuthor({ name: "» Filmstarts", url: feed.link, iconURL: "https://www.appgefahren.de/wp-content/uploads/2016/06/Filmstarts-icon.jpg" })
                    .setTimestamp();

                    const channel = client.channels.cache.get('1230540761708105728')
                    if (channel) {
                        channel.send({ content: '`📺` » Es gibt was neues von **Filmstarts**, <@&1231257532844998666>!', embeds: [embed] })
                        .catch(error => console.error('Error sending embed message:', error));
                    }

                    module.exports.markEntryAsSent("https://www.filmstarts.de/rss/nachrichten.xml", newestEntry.guid, lastEntries);
                }
            }
        } catch (error) {
            console.error('Error fetching RSS feed:', error);
        }
    },

    // Welt News
    Tagesschau: async (client, lastEntries) => {
        try {
            const feed = await parser.parseURL("https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml");

            if (feed.items && feed.items.length > 0) {
                const newestEntry = feed.items[0];

                if (!await module.exports.isEntrySent("https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml", newestEntry.guid, lastEntries)) {
                    const embed = new EmbedBuilder();
                    if (newestEntry.title) embed.setTitle(newestEntry.title);
                    if (newestEntry.link) embed.setURL(newestEntry.link);

                    if (newestEntry.contentSnippet) {
                        embed.setDescription(`> ${newestEntry.contentSnippet}\n\n**© Erstellt von [World Of Community](https://discord.gg/zYk4GdSZSc)**`);
                    }

                    embed.setColor('Blue')
                        .setAuthor({ name: "» Tagesschau", url: feed.link, iconURL: "https://upload.wikimedia.org/wikinews/de/e/e4/Tagesschau-logo.jpg" })
                        .setImage(await module.exports.getImageFromContent(newestEntry['content:encoded']))
                        .setTimestamp();

                    const channel = client.channels.cache.get('1230540900439031929');
                    if (channel) {
                        channel.send({ content: '`🌍` » Es gibt eine neue **Welt News**, <@&1231257309313765396>', embeds: [embed] })
                            .catch(error => console.error('Error sending embed message:', error));
                    }

                    module.exports.markEntryAsSent("https://www.tagesschau.de/infoservices/alle-meldungen-100~rss2.xml", newestEntry.guid, lastEntries);
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