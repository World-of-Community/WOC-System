import { MessageFlags } from "discord.js";
import { UserError } from "#core/errors.js";
import { sendNewFlag, stopQuiz, REGIONS } from "#systems/flagQuiz.js";

const REGION_LABELS = {
  africa: "Afrika",
  americas: "Amerika",
  antarctica: "Antarktis",
  asia: "Asien",
  europe: "Europa",
  oceania: "Ozeanien",
};

export default {
  name: "flaggenquiz",
  description: "» Flaggenquiz in einem Kanal starten oder beenden. 🚩",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      type: 1,
      name: "start",
      description: "Startet ein Flaggenquiz (ersetzt ein laufendes im Kanal)",
      options: [
        { type: 7, name: "kanal", description: "Kanal für das Quiz", required: true, channel_types: [0] },
        {
          type: 3,
          name: "region",
          description: "Nur Flaggen aus dieser Region",
          required: false,
          choices: REGIONS.filter((r) => r !== "antarctica").map((r) => ({ name: REGION_LABELS[r] ?? r, value: r })),
        },
      ],
    },
    {
      type: 1,
      name: "stop",
      description: "Beendet das Flaggenquiz in einem Kanal",
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
        content: stopped ? `> \`🛑\` » Flaggenquiz in ${channel} beendet.` : `> \`❌\` » In ${channel} läuft kein Flaggenquiz.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const region = interaction.options.getString("region");
    await stopQuiz(channel);
    await sendNewFlag(channel, { region });
    await interaction.reply({
      content: `> \`✅\` » Flaggenquiz in ${channel} gestartet${region ? ` (${REGION_LABELS[region]})` : ""}.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};
