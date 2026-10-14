import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { settings, formatValue } from "#core/settings.js";
import { UserError } from "#core/errors.js";
import { iterateSettings } from "#config/settings.schema.js";

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
  ],

  async autocomplete(interaction) {
    const focused = interaction.options.getFocused(true);
    const query = focused.value.toLowerCase();

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
        await interaction.reply({ embeds: [embed], ephemeral: true });
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
      await interaction.reply({ embeds: embeds.slice(0, 10), ephemeral: true });
      return;
    }

    const key = interaction.options.getString("key");
    let spec;
    try {
      spec = settings.list().find((s) => s.path === key);
      if (!spec) {throw new Error();}
    } catch {
      throw new UserError(`> \`❌\` » Unbekannte Einstellung \`${key}\`.`);
    }

    if (sub === "get") {
      const embed = new EmbedBuilder()
        .setTitle(`\`⚙️\` ${spec.path}`)
        .setDescription(`${spec.description ?? ""}\n\n**Typ:** \`${spec.type}\`\n**Wert:** ${formatValue(spec.type, spec.value)}\n**Standard:** ${formatValue(spec.type, spec.default)}`)
        .setColor("Orange");
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    if (sub === "set") {
      const raw = interaction.options.getString("wert");
      let value;
      try {
        value = await settings.set(key, raw, interaction.user.id);
      } catch (error) {
        throw new UserError(`> \`❌\` » ${error.message}`);
      }
      await interaction.reply({ content: `> \`✅\` » \`${key}\` ist jetzt ${formatValue(spec.type, value)}`, ephemeral: true });
      return;
    }

    if (sub === "reset") {
      const value = await settings.reset(key, interaction.user.id);
      await interaction.reply({ content: `> \`✅\` » \`${key}\` wurde zurückgesetzt auf ${formatValue(spec.type, value)}`, ephemeral: true });
    }
  },
};
