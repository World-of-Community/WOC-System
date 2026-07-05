import { EmbedBuilder } from "discord.js";
import userdb from "../../models/userdb.js";

export default {
    name: "messages",
    description: "» Zeigt an, wieviel jemand gechattet hat. ✍️",
    type: 1,
    options: [
        {
            "name": "mitglied",
            "description": "» Welches Profil möchtest du Abrufen?",
            "required": false,
            "type": 6
        }
    ],

    async run(client, interaction) {
        const member = await interaction.options.getMember('mitglied') || interaction.member

        if (member.user.bot) {
            return interaction.reply({ content: "> \`❌\` » Du kannst keine Statistiken über Bots abrufen!", ephemeral: true });
        }

        const userData = await userdb.findOne({ userID: member.id })

        if (userData) {
        const MessageEmbed = new EmbedBuilder()
        .setTitle(`\`👤\` × ${member.user.displayName}'s Nachrichten`)
        .setDescription(`<a:Chat1:976129450112593990> » ${member} hat \`${userData.giveaway.messages || '0'}\` Nachrichten geschrieben.`)
        .setColor('Blurple')
        .setThumbnail(`${member.user.displayAvatarURL({ dynamic: true })}`)
        .setFooter({ text: `» Meine Stats auf ${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
        .setTimestamp();

        await interaction.reply({ embeds: [MessageEmbed], ephemeral: true })
        } else return await interaction.reply({ content: `> \`❌\` » Ich konnte keine Statistiken über ${member} finden.`, ephemeral: true })
    }
}
