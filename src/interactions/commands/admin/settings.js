import {
  ActionRowBuilder, EmbedBuilder, MessageFlags, ModalBuilder, PermissionFlagsBits, TextInputBuilder, TextInputStyle,
} from "discord.js";
import { settings, formatValue } from "#core/settings.js";
import { UserError } from "#core/errors.js";
import { iterateSettings } from "#config/settings.schema.js";
import {
  getStreamers, addStreamer, removeStreamer, setTwitchStatusEnabled, isTwitchStatusEnabled, updateTwitchStatus,
} from "#systems/twitch.js";
import { searchEntries, removeEntry, listEntries } from "#systems/emojiQuiz.js";

const PAGE_SIZE = 20;

export default {
  name: "settings",
  description: "» Bot-Einstellungen anzeigen und ändern. ⚙️",
  type: 1,
  default_member_permissions: PermissionFlagsBits.Administrator.toString(),
  options: [
    {
      type: 1,
      name: "list",
      description: "Zeigt alle Einstellungen einer Gruppe",
      options: [
        { type: 3, name: "gruppe", description: "Einstellungsgruppe", required: false, autocomplete: true },
      ],
    },
    {
      type: 1,
      name: "get",
      description: "Zeigt eine Einstellung",
      options: [
        { type: 3, name: "key", description: "z.B. roles.verify", required: true, autocomplete: true },
      ],
    },
    {
      type: 1,
      name: "set",
      description: "Ändert eine Einstellung",
      options: [
        { type: 3, name: "key", description: "z.B. roles.verify", required: true, autocomplete: true },
        { type: 3, name: "wert", description: "ID, Erwähnung, Zahl, ja/nein, Liste (kommagetrennt) oder JSON", required: true },
      ],
    },
    {
      type: 1,
      name: "reset",
      description: "Setzt eine Einstellung auf den Standardwert zurück",
      options: [
        { type: 3, name: "key", description: "z.B. roles.verify", required: true, autocomplete: true },
      ],
    },
    {
      type: 2,
      name: "twitch",
      description: "Twitch-Status-System verwalten",
      options: [
        {
          type: 1,
          name: "add",
          description: "Fügt einen Twitch-Kanal hinzu",
          options: [{ type: 3, name: "kanal", description: "Twitch-Name (z.B. red3405_)", required: true }],
        },
        {
          type: 1,
          name: "remove",
          description: "Entfernt einen Twitch-Kanal (löscht dessen Status-Nachricht)",
          options: [{ type: 3, name: "kanal", description: "Twitch-Name", required: true, autocomplete: true }],
        },
        { type: 1, name: "list", description: "Zeigt alle Twitch-Kanäle" },
        { type: 1, name: "enable", description: "Aktiviert die automatische Status-Aktualisierung" },
        { type: 1, name: "disable", description: "Deaktiviert die automatische Status-Aktualisierung" },
      ],
    },
    {
      type: 2,
      name: "emoji",
      description: "Emoji-Quiz-Rätsel verwalten",
      options: [
        { type: 1, name: "add", description: "Fügt ein Rätsel hinzu (öffnet ein Formular)" },
        {
          type: 1,
          name: "remove",
          description: "Entfernt ein Rätsel",
          options: [{ type: 3, name: "begriff", description: "Begriff des Rätsels", required: true, autocomplete: true }],
        },
        { type: 1, name: "list", description: "Zeigt alle Rätsel" },
      ],
    },
  ],

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    const query = focused.value.toLowerCase();

    if (focused.name === "begriff") {
      const entries = await searchEntries(focused.value);
      await interaction.respond(entries.map((e) => ({ name: `${e.emojis} ${e.begriff}`.slice(0, 100), value: e.begriff })));
      return;
    }

    if (focused.name === "kanal") {
      await interaction.respond(
        getStreamers().filter((s) => s.login.includes(query)).slice(0, 25).map((s) => ({ name: s.login, value: s.login })),
      );
      return;
    }

    if (focused.name === "gruppe") {
      const choices = settings.groups()
        .filter((g) => g.name.toLowerCase().includes(query) || g.label.toLowerCase().includes(query))
        .slice(0, 25)
        .map((g) => ({ name: `${g.name} – ${g.label}`, value: g.name }));
      await interaction.respond(choices);
      return;
    }

    const choices = [...iterateSettings()]
      .filter((s) => s.path.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query))
      .slice(0, 25)
      .map((s) => ({ name: `${s.path} – ${s.description ?? s.type}`.slice(0, 100), value: s.path }));
    await interaction.respond(choices);
  },

  async run(client, interaction) {
    const group = interaction.options.getSubcommandGroup(false);
    if (group === "twitch") {
      await runTwitch(interaction);
      return;
    }
    if (group === "emoji") {
      await runEmoji(interaction);
      return;
    }

    const sub = interaction.options.getSubcommand();

    if (sub === "list") {
      const group = interaction.options.getString("gruppe");
      if (group && !settings.schema[group]) {throw new UserError(`> \`❌\` » Unbekannte Gruppe \`${group}\`.`);}

      if (!group) {
        const lines = settings.groups().map((g) => `\`${g.name}\` – ${g.label} (${Object.keys(settings.schema[g.name].keys).length})`);
        const embed = new EmbedBuilder()
          .setTitle("`⚙️` Einstellungsgruppen")
          .setDescription(`${lines.join("\n")}\n\n> \`/settings list gruppe:<name>\` zeigt die Werte.`)
          .setColor("Orange");
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        return;
      }

      const entries = settings.list(group);
      const embeds = [];
      for (let i = 0; i < entries.length; i += PAGE_SIZE) {
        const chunk = entries.slice(i, i + PAGE_SIZE);
        embeds.push(new EmbedBuilder()
          .setTitle(`\`⚙️\` ${settings.schema[group].label} (\`${group}\`)`)
          .setDescription(chunk.map((e) => `**${e.key}** · ${e.description ?? e.type}\n${formatValue(e.type, e.value)}`).join("\n"))
          .setColor("Orange"));
      }
      await interaction.reply({ embeds: embeds.slice(0, 10), flags: MessageFlags.Ephemeral });
      return;
    }

    const key = interaction.options.getString("key");
    const spec = settings.list().find((s) => s.path === key);
    if (!spec) {throw new UserError(`> \`❌\` » Unbekannte Einstellung \`${key}\`.`);}

    if (sub === "get") {
      const embed = new EmbedBuilder()
        .setTitle(`\`⚙️\` ${spec.path}`)
        .setDescription(`${spec.description ?? ""}\n\n**Typ:** \`${spec.type}\`\n**Wert:** ${formatValue(spec.type, spec.value)}\n**Standard:** ${formatValue(spec.type, spec.default)}`)
        .setColor("Orange");
      await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      return;
    }

    if (sub === "set") {
      let value;
      try {
        value = await settings.set(key, interaction.options.getString("wert"), interaction.user.id);
      } catch (error) {
        throw new UserError(`> \`❌\` » ${error.message}`);
      }
      await interaction.reply({ content: `> \`✅\` » \`${key}\` ist jetzt ${formatValue(spec.type, value)}`, flags: MessageFlags.Ephemeral });
      return;
    }

    if (sub === "reset") {
      const value = await settings.reset(key, interaction.user.id);
      await interaction.reply({ content: `> \`✅\` » \`${key}\` wurde zurückgesetzt auf ${formatValue(spec.type, value)}`, flags: MessageFlags.Ephemeral });
    }
  },
};

async function runEmoji(interaction) {
  const sub = interaction.options.getSubcommand();

  if (sub === "add") {
    const input = (id, label, { style = TextInputStyle.Short, required = true, placeholder = "", max = 100 } = {}) =>
      new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId(id).setLabel(label).setStyle(style).setRequired(required).setPlaceholder(placeholder).setMaxLength(max),
      );

    const modal = new ModalBuilder()
      .setCustomId("emoji-quiz-add")
      .setTitle("🧩 Emoji-Rätsel hinzufügen")
      .addComponents(
        input("emojis", "Emojis", { placeholder: "🦁👑" }),
        input("begriff", "Lösung", { placeholder: "König der Löwen" }),
        input("tipp", "Tipp (optional)", { required: false, placeholder: "Film" }),
        input("schwierigkeit", "Schwierigkeit: einfach / mittel / schwer", { required: false, placeholder: "mittel", max: 10 }),
        input("aliases", "Weitere akzeptierte Antworten, kommagetrennt", { required: false, placeholder: "Lion King, Koenig der Loewen", max: 300 }),
      );

    await interaction.showModal(modal);
    return;
  }

  if (sub === "remove") {
    const begriff = interaction.options.getString("begriff");
    try {
      const entry = await removeEntry(begriff);
      await interaction.reply({ content: `> \`✅\` » Rätsel ${entry.emojis} **${entry.begriff}** entfernt.`, flags: MessageFlags.Ephemeral });
    } catch (error) {
      throw new UserError(`> \`❌\` » ${error.message}`);
    }
    return;
  }

  if (sub === "list") {
    const entries = await listEntries();
    if (entries.length === 0) {
      await interaction.reply({ content: "> `❌` » Keine Rätsel eingetragen.", flags: MessageFlags.Ephemeral });
      return;
    }

    const embeds = [];
    for (let i = 0; i < entries.length; i += 30) {
      embeds.push(new EmbedBuilder()
        .setTitle(`\`🧩\` Emoji-Rätsel (${entries.length})`)
        .setDescription(entries.slice(i, i + 30).map((e) => `${e.emojis} **${e.begriff}** · ${e.schwierigkeit}${e.tipp ? ` · _${e.tipp}_` : ""}`).join("\n"))
        .setColor("Orange"));
    }
    await interaction.reply({ embeds: embeds.slice(0, 10), flags: MessageFlags.Ephemeral });
  }
}

async function runTwitch(interaction) {
  const sub = interaction.options.getSubcommand();
  const by = interaction.user.id;

  if (sub === "list") {
    const streamers = getStreamers();
    const lines = streamers.length
      ? streamers.map((s) => `- **${s.login}** – https://twitch.tv/${s.login}${s.messageId ? "" : " (noch keine Status-Nachricht)"}`)
      : ["> Keine Twitch-Kanäle eingetragen."];
    const embed = new EmbedBuilder()
      .setTitle("`🟣` Twitch-Kanäle")
      .setDescription(`${lines.join("\n")}\n\nStatus-System: ${isTwitchStatusEnabled() ? "`✅ an`" : "`❌ aus`"} · Kanal: <#${settings.get("channels.twitch")}>`)
      .setColor("Purple");
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
    return;
  }

  if (sub === "enable" || sub === "disable") {
    await setTwitchStatusEnabled(sub === "enable", by);
    await interaction.reply({ content: `> \`${sub === "enable" ? "✅" : "🛑"}\` » Twitch-Status ist jetzt **${sub === "enable" ? "aktiv" : "deaktiviert"}**.`, flags: MessageFlags.Ephemeral });
    if (sub === "enable") {await updateTwitchStatus().catch(() => {});}
    return;
  }

  const login = interaction.options.getString("kanal");
  try {
    if (sub === "add") {
      const added = await addStreamer(login, by);
      await interaction.reply({ content: `> \`✅\` » **${added}** wurde hinzugefügt.`, flags: MessageFlags.Ephemeral });
      await updateTwitchStatus().catch(() => {});
    } else if (sub === "remove") {
      const removed = await removeStreamer(login, by);
      await interaction.reply({ content: `> \`✅\` » **${removed}** wurde entfernt.`, flags: MessageFlags.Ephemeral });
    }
  } catch (error) {
    throw new UserError(`> \`❌\` » ${error.message}`);
  }
}
