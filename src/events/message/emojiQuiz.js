import { Events } from "discord.js";
import { checkAnswer } from "#systems/emojiQuiz.js";

export default {
  name: Events.MessageCreate,

  async execute(client, message) {
    if (message.author.bot || !message.guild || !message.content) {return;}
    await checkAnswer(message);
  },
};
