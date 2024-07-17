require("dotenv").config()
const fs = require("fs")
const { REST } = require("@discordjs/rest")
const { Routes } = require("discord-api-types/v10")
const deployCommands = async function deploy() {

    const file = fs.readFileSync('src/json/config.json', 'utf-8');
    const config = JSON.parse(file);
    const commands = []
    const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"))

    commandFiles.forEach(commandFile => {
        const command = require(`./commands/${commandFile}`)
        if (command.data) {
            commands.push(command.data.toJSON())
        }
    })

    const restClient = new REST({ version: "10" }).setToken(config.token)

    //restClient.put(Routes.applicationCommands(config.application, config.server),
    //    { body: commands })
    //    .then(() => console.log("Successfully registered Commands!"))
    //    .catch(console.error)

    // for global commands
restClient.delete(Routes.applicationCommand(config.application, config.server))
.then(() => console.log('Successfully deleted application command'))
.catch(console.error);
}

module.exports = { deployCommands }