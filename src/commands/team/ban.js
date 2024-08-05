const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const fs = require('fs')
const ms = require("ms");
const bandb = require("../../../Datenbank/bandb");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('» Banne einen User. 🔒')
        .addUserOption(option => option.setName('user').setDescription('» Welcher User soll Gebannt werden?').setRequired(true))
        .addStringOption(option => option.setName('grund').setDescription('» Gebe ein Grund an').setRequired(true))
        .addStringOption(option => option.setName('dauer').setDescription('» Gebe eine Dauer an (5d 30m) (Keine = Perma)')
        .addChoices({ name: '🕒 » 15 Minuten', value: '15 Minuten' }, { name: '🕒 » 30 Minuten', value: '30 Minuten' }, { name: '🕒 » 45 Minuten', value: '45 Minuten' }, { name: '🕒 » 1 Stunde', value: '1 Stunde'}, { name: '🕒 » 2 Stunden', value: '2 Stunden'}, { name: '🕒 » 3 Stunden', value: '3 Stunden'}, { name: '🕒 » 6 Stunden', value: '6 Stunden'}, { name: '🕒 » 12 Stunden', value: '12 Stunden'}, { name: '🕒 » 24 Stunden', value: '24 Stunden'}, { name: '🕒 » 48 Stunden', value: '48 Stunden'}, { name: '⛔ » PERMANENT', value: 'PERMANENT'}).setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        
        const file = fs.readFileSync('src/json/config.json', 'utf-8');
        const config = JSON.parse(file);
        if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) return;
        let banLogEmbed
        const member = interaction.options.getMember('user')
        const reason = interaction.options.getString('grund')
        const duration = interaction.options.getString('dauer') ?? 'Keine Zeit angegeben'
        const banMember = await interaction.guild.members.fetch(member.id)

        const banRole = interaction.guild.roles.cache.find(role => role.id === "1155570143393488896");
        const memberRole = interaction.guild.roles.cache.find(role => role.id === "815920703067914290");


        const createdAt = `<t:${Math.round(member.user.createdTimestamp / 1000)}>`;
        const joinedAt = `<t:${Math.round(banMember.joinedTimestamp / 1000)}>`;

        if (duration) {
            const durationDauer = ms(duration)
            const currentDate = new Date();

            const endDate = new Date(currentDate.getTime() + durationDauer);
            const timestamp = Math.floor(endDate / 1000);

            banLogEmbed = new EmbedBuilder()
                .setTitle(`\`⛔\` - ${member.displayName} wurde gebannt.`)
                .setDescription(`${member} wurde von ${interaction.user} gebannt.\n\n\`👤\` **- BENUTZER INFORMATIONEN**\n> Banngrund: \`${reason}\`\n> Dauer: \`${duration}\`\n> Benutzername: **${member.user.username}** (\`${member.id}\`) (${member})\n> Account erstellt am: ${createdAt}\n> Beigetreten am: ${joinedAt}`)
                .setThumbnail(member.displayAvatarURL({ dynamic: true, format: 'png'}))
                .setColor('Red')
                .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: `${interaction.client.user.displayAvatarURL()}` })
            
                member.roles.add(banRole)
                member.roles.remove(memberRole)

            const newBan = new bandb({
                creator: interaction.user,
                user: member.id,
                reason: reason,
                duration: durationDauer,
                startTime: new Date(),
                endTime: null,
            });
            await newBan.save()
        } else {
            banLogEmbed = new EmbedBuilder()
                .setTitle(`\`⛔\` - ${member.displayName} wurde gebannt.`)
                .setDescription(`${member} wurde von ${interaction.user} gebannt.\n\n\`👤\` - **BENUTZER INFORMATIONEN**\nBanngrund: \`${reason}\`\nDauer: \`${duration}\`\nBenutzername: **${member.user.username}** (\`${member.id}\`) (${member})\nAccount erstellt am: ${createdAt}\nBeigetreten am: ${joinedAt}`)
                .setColor('Red')
                .setFooter({ text: `©️ ${interaction.guild.name} | Bann-System`, iconURL: `${interaction.client.user.displayAvatarURL()}` })
                
                member.roles.add(banRole)
                member.roles.remove(memberRole)

            const newBan = new bandb({
                creator: interaction.user,
                user: member.id,
                reason: reason,
            });
            await newBan.save()
        }

        const logchannel = await interaction.guild.channels.cache.get("1263436406655680513");

        await logchannel.threads.cache.get("1269295450721222740").send({embeds: [banLogEmbed]});
        await interaction.reply({ content: `> \`✅\` » Du hast ${member} erfolgreich gebannt, er ist nun im **Bann-Bereich.**`, ephemeral: true })
    }
}