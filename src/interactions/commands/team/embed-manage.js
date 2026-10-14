import { EmbedBuilder, MessageFlags } from "discord.js";
import logger from "#core/logger.js";

const colorMap = {
  red: "#FF0000",
  blue: "#0000FF",
  green: "#008000",
  yellow: "#FFFF00",
  purple: "#800080",
  orange: "#FFA500",
  pink: "#FFC0CB",
  cyan: "#00FFFF",
  white: "#FFFFFF",
  black: "#000000",
  brown: "#A52A2A",
  gray: "#808080",
  grey: "#808080",
  gold: "#FFD700",
  silver: "#C0C0C0",
  lime: "#00FF00",
  navy: "#000080",
  teal: "#008080",
  maroon: "#800000",
  olive: "#808000",
  violet: "#EE82EE",
  magenta: "#FF00FF",
  indigo: "#4B0082",
  turquoise: "#40E0D0",
  beige: "#F5F5DC",
  coral: "#FF7F50",
  lavender: "#E6E6FA",
  salmon: "#FA8072",
  chocolate: "#D2691E",
  crimson: "#DC143C",
  khaki: "#F0E68C",
  azure: "#F0FFFF",
  tan: "#D2B48C",
  orchid: "#DA70D6",
  plum: "#DDA0DD",
  wheat: "#F5DEB3",
  tomato: "#FF6347",
  periwinkle: "#CCCCFF",
  chartreuse: "#7FFF00",
  seashell: "#FFF5EE",
};

export default {
  name: "embed",
  description: "Erstellt oder bearbeitet ein Embed",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      type: 1,
      name: "create",
      description: "Erstellt ein Embed",
      options: [
        {
          name: "channel",
          description: "Zielkanal",
          required: true,
          type: 7,
        },
        {
          type: 3,
          name: "title",
          description: "Titel",
          required: true,
        },
        {
          type: 3,
          name: "description",
          description: "Beschreibung (\\n für Zeilenumbruch)",
          required: true,
        },
        {
          type: 3,
          name: "color",
          description: "Farbe als Name oder Hex",
          required: false,
        },
        {
          type: 3,
          name: "image",
          description: "Bild-URL",
          required: false,
        },
        {
          type: 3,
          name: "footer",
          description: "Footer-Text",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "edit",
      description: "Bearbeitet ein bestehendes Embed",
      options: [
        {
          channel_types: [
            0,
          ],
          name: "channel",
          description: "Zielkanal",
          required: true,
          type: 7,
        },
        {
          type: 3,
          name: "message_id",
          description: "Nachrichten-ID",
          required: true,
        },
        {
          type: 3,
          name: "title",
          description: "Neuer Titel",
          required: false,
        },
        {
          type: 3,
          name: "description",
          description: "Neue Beschreibung (\\n für Zeilenumbruch)",
          required: false,
        },
        {
          type: 3,
          name: "color",
          description: "Neue Farbe",
          required: false,
        },
        {
          type: 3,
          name: "image",
          description: "Neue Bild-URL",
          required: false,
        },
        {
          type: 3,
          name: "footer",
          description: "Neuer Footer-Text",
          required: false,
        },
      ],
    },
  ],

  async run(client, interaction) {
    const sub = interaction.options.getSubcommand();
    const colorInput = interaction.options.getString("color")?.toLowerCase();
    const color = colorInput && colorMap[colorInput] ? colorMap[colorInput] : (colorInput || "#00AE86");

    if (sub === "create") {
      const channel = interaction.options.getChannel("channel");
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description").replace(/\\n/g, "\n");
      const image = interaction.options.getString("image");
      const footer = interaction.options.getString("footer");

      const embed = new EmbedBuilder().setTitle(title).setDescription(description).setColor(color);
      if (image) {embed.setImage(image);}
      if (footer) {embed.setFooter({ text: footer, iconURL: interaction.guild.iconURL({ dynamic: true }) || "" });}

      await channel.send({ embeds: [embed] });
      return interaction.reply({ content: "> ✅ » Embed erfolgreich erstellt.", flags: MessageFlags.Ephemeral });
    }

    if (sub === "edit") {
      const channel = interaction.options.getChannel("channel");
      const messageId = interaction.options.getString("message_id");
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description")?.replace(/\\n/g, "\n");
      const image = interaction.options.getString("image");
      const footer = interaction.options.getString("footer");

      try {
        const message = await channel.messages.fetch(messageId);
        const embed = EmbedBuilder.from(message.embeds[0]);

        if (title) {embed.setTitle(title);}
        if (description) {embed.setDescription(description);}
        if (color) {embed.setColor(color);}
        if (image) {embed.setImage(image);}
        if (footer) {embed.setFooter({ text: footer, iconURL: interaction.guild.iconURL({ dynamic: true }) || "" });}

        await message.edit({ embeds: [embed] });
        return interaction.reply({ content: "> ✅ » Embed erfolgreich bearbeitet.", flags: MessageFlags.Ephemeral });
      } catch (err) {
        logger.error(err);
        return interaction.reply({ content: "> ❌ » Fehler: Nachricht nicht gefunden oder Bearbeitung fehlgeschlagen.", flags: MessageFlags.Ephemeral });
      }
    }
  },
};
