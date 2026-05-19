import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import serverdb from '../../../Datenbank/serverdb.js';
export default {
    data: new SlashCommandBuilder()
        .setName('role-bypass')
        .setDescription('» Einstellen der Rollen für das Gewinnspiel-System. 🎁')
        .addSubcommand(subcommand => subcommand.setName('add').setDescription('» Lege eine Rolle fest, welche keine GW-Anforderungen erfüllen muss. 🎀')
        .addRoleOption(option => option.setName('role').setDescription('Welche Rolle möchtest du wählen?').setRequired(true)))

        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('» Entferne eine Rolle fest, welche keine GW-Anforderungen erfüllen muss. 🎀')
        .addRoleOption(option => option.setName('role').setDescription('Welche Rolle möchtest du wählen?').setRequired(true)))

        .addSubcommand(subcommand => subcommand.setName('list').setDescription('» Zeigt alle Rollen an, welche keine GW-Anforderungen erfüllen muss. 🎀')),

    async execute(interaction) {

    if (!interaction.member.permissions.has('Administrator')) return interaction.reply({ content: '> `❌` » Du hast dazu keine Rechte diesen Befehl zu benutzen.', ephemeral: true })
         if (interaction.options.getSubcommand() === 'add') {
             const role = interaction.options.getRole('role')
             const data = await serverdb.findOne({ guildID: interaction.guild.id, roleBypass: { $in: [role.id] } })

             if (data) return interaction.reply({ content: `> ⚠️ » die ${role} ist bereits hinzugefügt.`, ephemeral: true })
             const serverData = await serverdb.findOneAndUpdate({ guildID: interaction.guild.id }, { $push: { roleBypass: role.id } })

             await interaction.reply({ content: `> \`✅\` » Du hast die ${role} erfolgreich hinzugefügt.`, ephemeral: true })
         }

         if (interaction.options.getSubcommand() === 'remove') {
             const role = interaction.options.getRole('role')
             const data = await serverdb.findOne({ guildID: interaction.guild.id, roleBypass: { $in: [role.id] } })

             if (!data) return interaction.reply({ content: '> ⚠️ » Diese Rolle wurde bereits entfernt.', ephemeral: true })
             const serverData = await serverdb.findOneAndUpdate({ guildID: interaction.guild.id }, { $pull: { roleBypass: role.id } })

             await interaction.reply({ content: `> \`✅\` » Du hast die ${role} erfolgreich entfernt.`, ephemeral: true })
         }

         if (interaction.options.getSubcommand() === 'list') {
             const serverData = await serverdb.findOne({ guildID: interaction.guild.id })

             const roleListe = serverData.roleBypass.map(roleId => `<@&${roleId}>`).join('\n')
             const embed = new EmbedBuilder()
                 .setTitle('Hier sind alle ByPass Rollen aufgelistet')
                 .setDescription(`${roleListe || '**Keine Rollen als Bypass aufgelistet.**'}`)
                 .setColor('Blurple')
             await interaction.reply({ embeds: [embed], ephemeral: true })
         }
     }
}
