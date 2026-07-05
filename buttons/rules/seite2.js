import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

export default {
    id: 'seite-2',
    run: async (client, interaction) => {
        const seite2Embed = new EmbedBuilder()
            .setTitle('`🚨` » World Of Community - Server-Regeln (Seite 2)')
            .setDescription('» An diesen Regeln musst du dich jederzeit halten, damit wir eine friedliche Atmosphäre wahren können. Solltest du dies nicht tun, können Sanktionen gegen deinem Account folgen.\n\n───────────────────────── \n\n1️⃣1️⃣ 𑁉 Jegliche Inhalte sind in angemessener Form & Formattierung zu teilen. Dies betrifft zum Beispiel Nicknamen & Nachrichten.\n\n1️⃣2️⃣ 𑁉 Die Verbreitung von Viren oder unerlaubten Clientmodifikationen für Anwendungen ist nicht gestattet.\n\n1️⃣3️⃣ 𑁉 Im Zweifelsfall ist das Team berechtigt nach eigenem Ermessen zu handeln, eine Strafe muss nicht anhand einer Regel gerechtfertigt sein.\n\n1️⃣4️⃣ 𑁉 Das Ausnutzen von Bot-Systemen (Support, Server-Ideen, o.ä.) ist untersagt, um unsere Arbeit nicht zu behindern.\n\n 1️⃣5️⃣ 𑁉 Unterhaltungen sollten immer auf Deutsch (gelegentlich auf Englisch) geführt werden, damit unser Team alle Konversationen nachvollziehen kann.')
            .setColor('Red')
            .setImage('https://cdn.discordapp.com/attachments/1269339771420016722/1269340748256514153/WOC_Banner_Server-Regeln.png?ex=66db36b1&is=66d9e531&hm=cb89a6e2c1d545ed5bd515c5e624c58c200d71920c3febed6238ee18a0997996&')

        const regelButton = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verifizieren')
                    .setLabel('✅ » Verifizieren')
                    .setStyle(ButtonStyle.Success)
            )
        await interaction.reply({ embeds: [seite2Embed], components: [regelButton], ephemeral: true })
    }
};
