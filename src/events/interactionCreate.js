const { Events } = require("discord.js");

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        client = interaction.client
        console.log(client.user.tag)
        if (!interaction.isCommand()) return

        const command = client.commands.get(interaction.commandName)

        if (command) {
            try {
                await command.execute(interaction)
            } catch (error) {
                console.error(error)

                if (interaction.deferred || interaction.replied) {
                    interaction.editReply("Es ist ein Fehler beim ausführen aufgetreten!")
                }
                else {
                    interaction.reply("Es ist ein Fehler beim ausführen aufgetreten!")
                }
            }
        }
    }
}