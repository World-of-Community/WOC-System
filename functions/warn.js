const { EmbedBuilder } = require("discord.js");
const warndb = require("../Datenbank/warndb");
const { client } = require("../src");

async function getWarnlistEmbed(interaction) {
    // Fetch all warning data for the guild
    let warnings = await warndb.find({ guildId: interaction.guild.id });

    // Helper function to format date with leading zeros
    function formatDate(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = d.getFullYear();
        return `${day}.${month}.${year}`;
    }

    // Warnliste formatieren
    let list = '';
    await warnings.forEach(async ({ userId, warnings }) => {
        const warnCount = warnings.length;
        const warnText = warnCount === 1 ? 'Warnung' : 'Warnungen';  // Singular or plural
        const user = await interaction.guild.members.cache.get(userId)

        warnings.forEach((warn, index) => {
            // Display based on the count of warnings
            const date = formatDate(warn.date);
            list += `<@${userId}> (${user?.user.username}) (${user?.user.displayName}) - \`${warnCount}\` ${warnText} (Grund: ${warn.reason}, Datum: ${date})\n`;
        });
    });

    const WarnEmbed = new EmbedBuilder()
        .setTitle('Information zu den Warnungen der Nutzer')
        .setDescription(warnings.length !== '' ? list : "> `❌` » Keine Warnungen vorhanden!")
        .setColor('Red'); 
    
    return WarnEmbed
}

async function updateWarnlist(interaction) {
    const embed = await getWarnlistEmbed(interaction);

    const channel = await interaction.guild.channels.cache.get('877446081036836884');
    const message = await channel.messages.fetch('1283824671506301051');

    message.edit({ embeds: [embed] })
}

module.exports = { getWarnlistEmbed, updateWarnlist }