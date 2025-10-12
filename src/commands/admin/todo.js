const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const Todo = require("../../../Datenbank/tododb");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("item")
    .setDescription("» ToDo-Liste verwalten (Administrator). ⚙️")
    
    .addSubcommand(sub => sub.setName("add").setDescription("» Fügt eine Aufgabe hinzu. 🟢").addStringOption(opt => opt.setName("text").setDescription("Aufgabe").setRequired(true)))
    .addSubcommand(sub => sub.setName("remove").setDescription("» Entfernt eine Aufgabe. ❌").addIntegerOption(opt => opt.setName("index").setDescription("Nummer der Aufgabe").setRequired(true)))
    .addSubcommand(sub => sub.setName("edit").setDescription("» Bearbeitet eine Aufgabe. ✏️").addIntegerOption(opt => opt.setName("index").setDescription("Nummer der Aufgabe").setRequired(true)).addStringOption(opt => opt.setName("text").setDescription("Neuer Text").setRequired(true)))
    .addSubcommand(sub => sub.setName("toggle").setDescription("» Ändert den Status einer Aufgabe (Offen → In Bearbeitung → Erledigt).").addIntegerOption(opt => opt.setName("index").setDescription("Nummer der Aufgabe").setRequired(true)))
    .addSubcommand(sub => sub.setName("list").setDescription("» Zeigt alle Aufgaben an. 📝"))
    .addSubcommand(sub => sub.setName("move").setDescription("» Verschiebt eine Aufgabe an eine andere Position. 🔀").addIntegerOption(opt => opt.setName("index").setDescription("Nummer der Aufgabe").setRequired(true)).addIntegerOption(opt => opt.setName("position").setDescription("Neue Position").setRequired(true)))
    .addSubcommand(sub => sub.setName("priority").setDescription("» Setzt die Priorität einer Aufgabe. ⚡").addIntegerOption(opt => opt.setName("index").setDescription("Nummer der Aufgabe").setRequired(true)).addStringOption(opt => opt.setName("level").setDescription("Priorität: niedrig/mittel/hoch").setRequired(true)))
    
    // CONFIG
    .addSubcommand(sub => sub.setName("config setup").setDescription("» Erstellt die Grundkonfiguration für die ToDo-Liste. ⚙️"))
    .addSubcommand(sub => sub.setName("config edit").setDescription("» Bearbeitet bestehende Konfigurationen. ⚙️").addStringOption(opt => opt.setName("key").setDescription("Konfigurationsschlüssel").setRequired(true)).addStringOption(opt => opt.setName("value").setDescription("Neuer Wert").setRequired(true)))
    .addSubcommand(sub => sub.setName("config rename").setDescription("» Ändert den Namen der ToDo-Liste. ⚙️").addStringOption(opt => opt.setName("name").setDescription("Neuer Name").setRequired(true)))
    
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    const userId = interaction.user.id;
    const guildId = interaction.guild.id;

    let data = await Todo.findOne({ guildId, userId });
    if (!data) {
      data = await Todo.create({ guildId, userId, todos: [], config: { name: "Meine ToDo-Liste" }, messageId: null, channelId: null });
    }

    const saveAndReply = async (content) => { await data.save(); return interaction.reply({ content, ephemeral: true }); };
    const updateEmbed = async () => {
      if (data.todos.length === 0) return;
      const embed = new EmbedBuilder()
        .setTitle(data.config.name)
        .setDescription(data.todos.map((t, i) => {
          const e = t.status === "offen" ? "`🟥`" : t.status === "bearbeitung" ? "`🟧`" : "`✅`";
          return `${i + 1}. ${e} ${t.text} (Priorität: ${t.priority || "mittel"})`;
        }).join("\n"))
        .setColor("Blue");

      if (data.messageId && data.channelId) {
        try {
          const channel = await interaction.client.channels.fetch(data.channelId);
          const msg = await channel.messages.fetch(data.messageId);
          await msg.edit({ embeds: [embed] });
          return;
        } catch {
          data.messageId = null;
          data.channelId = null;
          await data.save();
        }
      }

      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      data.messageId = msg.id;
      data.channelId = msg.channelId;
      await data.save();
    };

    // --- TODO Subcommands ---
    if (sub === "add") {
      const text = interaction.options.getString("text");
      data.todos.push({ text, status: "offen", priority: "mittel" });
      await updateEmbed();
      return saveAndReply(`> \`🟥\` » Aufgabe hinzugefügt: **${text}**`);
    }

    if (sub === "remove") {
      const index = interaction.options.getInteger("index") - 1;
      if (index < 0 || index >= data.todos.length) return interaction.reply({ content: "> `❌` » Ungültige Aufgaben-Nummer.", ephemeral: true });
      const removed = data.todos.splice(index, 1);
      await updateEmbed();
      return saveAndReply(`> \`🗑️\` » Aufgabe entfernt: **${removed[0].text}**`);
    }

    if (sub === "edit") {
      const index = interaction.options.getInteger("index") - 1;
      if (index < 0 || index >= data.todos.length) return interaction.reply({ content: "> `❌` » Ungültige Aufgaben-Nummer.", ephemeral: true });
      const text = interaction.options.getString("text");
      data.todos[index].text = text;
      await updateEmbed();
      return saveAndReply(`> \`✏️\` » Aufgabe bearbeitet: **${text}**`);
    }

    if (sub === "toggle") {
      const index = interaction.options.getInteger("index") - 1;
      if (index < 0 || index >= data.todos.length) return interaction.reply({ content: "> `❌` » Ungültige Aufgaben-Nummer.", ephemeral: true });
      const cycle = { "offen": "bearbeitung", "bearbeitung": "erledigt", "erledigt": "offen" };
      data.todos[index].status = cycle[data.todos[index].status];
      const emoji = data.todos[index].status === "offen" ? "`🟥`" : data.todos[index].status === "bearbeitung" ? "`🟧`" : "`✅`";
      await updateEmbed();
      return saveAndReply(`> ${emoji} Status von Aufgabe **${data.todos[index].text}** geändert.`);
    }

    if (sub === "move") {
      const index = interaction.options.getInteger("index") - 1;
      const pos = interaction.options.getInteger("position") - 1;
      if (index < 0 || index >= data.todos.length || pos < 0 || pos >= data.todos.length) return interaction.reply({ content: "> ❌ Ungültige Position.", ephemeral: true });
      const [item] = data.todos.splice(index, 1);
      data.todos.splice(pos, 0, item);
      await updateEmbed();
      return saveAndReply(`> \`🔀\` » Aufgabe verschoben: **${item.text}**`);
    }

    if (sub === "priority") {
      const index = interaction.options.getInteger("index") - 1;
      const level = interaction.options.getString("level").toLowerCase();
      if (!["niedrig", "mittel", "hoch"].includes(level)) return interaction.reply({ content: "> ❌ Ungültige Priorität.", ephemeral: true });
      if (index < 0 || index >= data.todos.length) return interaction.reply({ content: "> ❌ Ungültige Aufgaben-Nummer.", ephemeral: true });
      data.todos[index].priority = level;
      await updateEmbed();
      return saveAndReply(`> \`⚡\` » Priorität von Aufgabe **${data.todos[index].text}** gesetzt auf **${level}**.`);
    }

    // --- CONFIG Subcommands ---
    if (sub === "setup") {
      data.config = { name: "Meine ToDo-Liste" };
      await updateEmbed();
      return saveAndReply("> `⚙️` » ToDo-Liste konfiguriert.");
    }

    if (sub === "configedit") {
      const key = interaction.options.getString("key");
      const value = interaction.options.getString("value");
      data.config[key] = value;
      await updateEmbed();
      return saveAndReply(`> \`⚙️\` » Konfiguration **${key}** geändert auf **${value}**.`);
    }

    if (sub === "configrename") {
      const name = interaction.options.getString("name");
      data.config.name = name;
      await updateEmbed();
      return saveAndReply(`> \`⚙️\` » ToDo-Liste umbenannt zu **${name}**.`);
    }

    if (sub === "list") {
      if (data.todos.length === 0) return interaction.reply({ content: "> `📝` » Keine Aufgaben vorhanden.", ephemeral: true });
      await updateEmbed();
      return interaction.reply({ content: "> `✅` » ToDo-Liste angezeigt.", ephemeral: true });
    }
  }
};
