const Discord = require('discord.js');
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  guildId: String,
  userId: String,
  todos: [
    {
      text: String,
      done: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});
const Todo = mongoose.model("Todo", todoSchema);