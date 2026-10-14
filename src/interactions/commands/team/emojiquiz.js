import { MessageFlags } from "discord.js";
import { UserError } from "#core/errors.js";
import { sendNewEmoji, stopQuiz, DIFFICULTIES } from "#systems/emojiQuiz.js";

export default {
  name: "emojiquiz",
  description: "» Emoji-Quiz in einem Kanal starten oder beenden. 🧩",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      type: 1,
      name: "start",
      description: "Startet ein Emoji-Quiz (ersetzt ein laufendes im Kanal)",
      options: [
        { type: 7, name: "kanal", description: "Kanal für das Quiz", required: true, channel_types: [0] },
        {
          type: 3,
          name: "schwierigkeit",
          description: "Nur Rätsel dieser Schwierigkeit",
          required: false,
          choices: DIFFICULTIES.map((d) => ({ name: d, value: d })),
        },
      ],
    },
    {
      type: 1,
      name: "stop",
      description: "Beendet das Emoji-Quiz in einem Kanal",
      options: [
        { type: 7, name: "kanal", description: "Kanal des Quiz", required: true, channel_types: [0] },
      ],
    },
  ],

  async run(client, interaction) {
    const channel = interaction.options.getChannel("kanal");
    if (!channel?.isTextBased()) {throw new UserError("> `❌` » Bitte wähle einen Textkanal aus.");}

    if (interaction.options.getSubcommand() === "stop") {
      const stopped = await stopQuiz(channel);
      await interaction.reply({
        content: stopped ? `> \`🛑\` » Emoji-Quiz in ${channel} beendet.` : `> \`❌\` » In ${channel} läuft kein Emoji-Quiz.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const schwierigkeit = interaction.options.getString("schwierigkeit");
    await stopQuiz(channel);
    try {
      await sendNewEmoji(channel, { schwierigkeit });
    } catch (error) {
      throw new UserError(`> \`❌\` » ${error.message}`);
    }
    await interaction.reply({
      content: `> \`✅\` » Emoji-Quiz in ${channel} gestartet${schwierigkeit ? ` (${schwierigkeit})` : ""}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
