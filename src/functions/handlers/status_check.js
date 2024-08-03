const cronitor = require('cronitor')('bbfc3034eaee49229dc7d1cfb4b65935');
const { Events } = require("discord.js")  
  module.exports = (client) => {
    client.handleStatus = async () => {
        const monitor = new cronitor.Monitor('System Bot');

        client.on(Events.ShardError, error => {
            monitor.ping({message: "Error", state: "fail"})
            console.error('A websocket connection encountered an error:', error);
        });
        process.on('unhandledRejection', error => {
            monitor.ping({message: "Error", state: "fail"})
            console.error('A websocket connection encountered an error:', error);
        });
    }
  };
  