const { SlashCommandBuilder, ChannelType } = require('discord.js');

//Placeholder Code muss noch gecodet werden

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blacklist')
    .setDescription('Manage blacklisted channels.')
    .addStringOption(option => 
      option.setName('settings')
        .setDescription('Add, remove, or list blacklisted channels')
        .setRequired(true)
        .addChoices(
          { name: 'Add', value: 'add' },
          { name: 'Remove', value: 'remove' },
          { name: 'List', value: 'list' }
        ))
    .addChannelOption(option => 
      option.setName('channel')
        .setDescription('The channel to blacklist/unblacklist')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)),

  async execute(interaction) {
    const settings = interaction.options.getString('settings');
    const channel = interaction.options.getChannel('channel');

    // Blacklist management (could be saved in a database like MongoDB)
    let blacklistedChannels = []; // Load this from the database

    if (settings === 'add') {
      if (channel) {
        if (!blacklistedChannels.includes(channel.id)) {
          blacklistedChannels.push(channel.id);
          // Save blacklistedChannels to database here
          await interaction.reply(`Channel ${channel} has been blacklisted.`);
        } else {
          await interaction.reply(`Channel ${channel} is already blacklisted.`);
        }
      } else {
        await interaction.reply('Please provide a valid channel.');
      }
    } else if (settings === 'remove') {
      if (channel) {
        const index = blacklistedChannels.indexOf(channel.id);
        if (index > -1) {
          blacklistedChannels.splice(index, 1);
          // Save blacklistedChannels to database here
          await interaction.reply(`Channel ${channel} has been unblacklisted.`);
        } else {
          await interaction.reply(`Channel ${channel} is not blacklisted.`);
        }
      } else {
        await interaction.reply('Please provide a valid channel.');
      }
    } else if (settings === 'list') {
      if (blacklistedChannels.length > 0) {
        const channelList = blacklistedChannels.map(id => `<#${id}>`).join(', ');
        await interaction.reply(`Blacklisted channels: ${channelList}`);
      } else {
        await interaction.reply('No channels are currently blacklisted.');
      }
    }
  }
};
