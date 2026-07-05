import { EmbedBuilder } from "discord.js";

export default {
    name: "message",
    description: "» Sendet eine Nachricht an ein Nutzer per Direktnachricht. 💬",
    type: 1,
    default_member_permissions: "268435456",
    options: [
        {
            "name": "user",
            "description": "» Der Benutzer, an den die Nachricht gesendet werden soll",
            "required": true,
            "type": 6
        },
        {
            "type": 3,
            "name": "nachricht",
            "description": "» Die Nachricht, die gesendet werden soll",
            "required": true
        },
        {
            "type": 3,
            "name": "image",
            "description": "» URL des Bildes, das hinzugefügt werden soll",
            "required": false
        }
    ],

    async run(client, interaction) {
        const member = interaction.options.getMember('user');
        const message = interaction.options.getString('nachricht');
        const imageUrl = interaction.options.getString('image');

        // Embed für die DM-Nachricht erstellen
        const Nachrichtembed = new EmbedBuilder()
            .setTitle('Du hast eine neue Nachricht!')
            .setDescription(
                `» Hallo, ${member} du hast gerade eine neue Nachricht von \`${interaction.user.displayName}\` bekommen.\n\n` +
                `> \`💬\` » **Nachricht:** ${message}\n\n` +
                `> \`🚑\` » Öffne ein Ticket im Support bei Fragen oder Problemen.`
            )
            .setColor('Blurple')
            .setFooter({ text: `${interaction.guild.name}`, iconURL: `${interaction.guild.iconURL()}` })
            .setTimestamp();

        // Optional: Bild hinzufügen, wenn vorhanden
        if (imageUrl) {
            Nachrichtembed.setImage(imageUrl);
        }

        // Nachricht und Embed an den Benutzer per DM senden
        try {
            await member.send({ embeds: [Nachrichtembed] });
            await interaction.reply({ content: `> \`✅\` » Ich habe die Nachricht erfolgreich an ${member} gesendet!`, ephemeral: true });
        } catch (error) {
            console.error(`Fehler beim Senden der Nachricht an ${member}:`, error);
            await interaction.reply({ content: `> \`❌\` » Beim Senden der Nachricht an ${member} ist ein Fehler aufgetreten.\n> \`📌\` » Bitte schau im Server-Log nach oder melde dich bei einem Admin.`, ephemeral: true });
        }
    },
};
