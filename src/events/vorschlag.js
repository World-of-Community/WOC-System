
module.exports = {
    name: "threadCreate",
    async execute(client ,thread) {
        if (thread.ownerId === client.user.id) return;
        const channel = client.channels.cache.get("1254340245772701747");
        if (channel) {
            const ownerid = thread.ownerId
            const ownerfrompost = await client.users.fetch(ownerid);
            const message = await thread.fetchStarterMessage();
        
            const tags = thread.appliedTags;
            const thread2 = await channel.threads.create({ name: thread.name, message: { content: `\`⚙️\` - Bitte warten, Ich erfasse die Daten.` }, appliedTags: tags });
        
            const embed = new EmbedBuilder()
              .setColor("Orange")
              .setTitle(`\`🔎\` **- ${thread.name}**`)
              .setDescription(`⠀\n> ${message}\n⠀\n**─────────────────────────**`)
              .addFields([
                {
                  name: `\`💡\` **- Vorschläge**`,
                  value: `> Erstelle einen Post um deine eigenen Vorschlag einzureichen`,
                },
              ])
              .setFooter({
                text:
                  "Eingereicht von "+
                  ownerfrompost.tag +
                  " » " +
                  ownerfrompost.id
              });
        
            const message2 = await thread2.fetchStarterMessage();
            await message2.react("👍");
            await message2.react("👎");
            await message2.edit({ content: `\`👋\` » ${ownerfrompost}, Ich habe dein Vorschlag eingereicht.`, embeds: [embed]})
            await thread.delete()
        }
    }
}