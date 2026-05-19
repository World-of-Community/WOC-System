import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, } from "discord.js";
import bandb from "../../../Datenbank/bandb.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("» Entbanne einen User oder sende eine Entbannungs-Info. 🔓")
    .addSubcommand(sub =>
      sub
        .setName("user")
        .setDescription("» Entbannt einen User.")
        .addUserOption(option =>
          option
            .setName("user")
            .setDescription("» Welcher User soll entbannt werden?")
            .setRequired(true)
        )
    )
    .addSubcommand(sub =>
      sub
        .setName("info")
        .setDescription("» Sendet Informationen zur Entbannung.")
        .addStringOption(option =>
          option
            .setName("typ")
            .setDescription("Welche Nachricht soll gesendet werden?")
            .setRequired(true)
            .addChoices(
              { name: "Statusupdate", value: "statusupdate" },
              { name: "Wichtiger Hinweis", value: "hinweis" },
              { name: "vorerst abgelehnt", value: "vorerst_abgelehnt" }
            )
        )
        .addIntegerOption(option =>
          option
            .setName("dauer")
            .setDescription("Wie viele Tage soll der Antrag gültig sein? (Standard 2 Tage)")
            .setMinValue(1)
            .setMaxValue(30)
        )
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const sub = interaction.options.getSubcommand();

    // ------------------------------------------------------
    // 🔓 /unban user
    // ------------------------------------------------------
    if (sub === "user") {
      const user = interaction.options.getUser("user");

      if (!user) {
        return interaction.reply({ content: "> `❌` » Der Benutzer wurde nicht gefunden.", ephemeral: true });
      }

      const logChannelId = "1263436406655680513";
      const threadId = "1269998219266490538";

      const logChannel = interaction.guild.channels.cache.get(logChannelId);
      if (!logChannel) {
        return interaction.reply({ content: "> `❌` » Log-Kanal konnte nicht gefunden werden.", ephemeral: true });
      }

      let thread;
      try {
        thread = logChannel.threads.cache.get(threadId) || await interaction.client.channels.fetch(threadId);
      } catch (err) {
        console.error("Thread konnte nicht geladen werden:", err);
        return interaction.reply({ content: "> `❌` » Thread konnte nicht geladen werden.", ephemeral: true });
      }

      if (!thread) {
        return interaction.reply({
          content: "> `❌` » Der Thread wurde nicht gefunden.",
          ephemeral: true
        });
      }

      try {
        // Falls archiviert → automatisch öffnen
        if (thread.archived) {
          await thread.setArchived(false, "Automatisch vom Bot geöffnet");
        }

        // Falls gesperrt → entsperren
        if (thread.locked) {
          await thread.setLocked(false, "Automatisch vom Bot entsperrt");
        }

      } catch (err) {
        return interaction.reply({
          content: "> `❌` » Der Thread ist archiviert oder gesperrt und konnte nicht automatisch geöffnet werden.",
          ephemeral: true
        });
      }

      const botMember = interaction.guild.members.me;
      const perms = thread.permissionsFor(botMember);
      if (!perms || !perms.has(PermissionFlagsBits.SendMessages)) {
        return interaction.reply({ content: "> `❌` » Ich habe keine Rechte, um im Thread zu schreiben.", ephemeral: true });
      }

      try {
        let banInfo;
        try {
          banInfo = await interaction.guild.bans.fetch(user.id);
        } catch (err) {
          if (err.code === 10026) {
            return interaction.reply({ content: `> \`❌\` » ${user} ist nicht gebannt oder wurde bereits entbannt.`, ephemeral: true });
          }
          throw err;
        }

        await interaction.guild.bans.remove(user.id, `Entbannt von ${interaction.user.tag}`);

        const unbanEmbed = new EmbedBuilder()
          .setTitle("`🔓` - Nutzer entbannt")
          .setDescription(`${user} wurde von ${interaction.user} entbannt.\n\n> **Benutzername:** ${user.tag} (\`${user.id}\`)\n> **Entbannt am:** <t:${Math.floor(Date.now() / 1000)}:F>`)
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setColor("Green")
          .setFooter({ text: `©️ ${interaction.guild.name} | Unban-System`, iconURL: interaction.client.user.displayAvatarURL() });

        await thread.send({ embeds: [unbanEmbed] });

        await interaction.reply({ content: `> \`✅\` » ${user} wurde erfolgreich entbannt.`, ephemeral: true });
      } catch (error) {
        console.error("Fehler beim Entbannen:", error);
        if (error.code === 10026) {
          return interaction.reply({ content: `> \`❌\` » ${user} ist nicht gebannt oder wurde bereits entbannt.`, ephemeral: true });
        } else if (error.code === 50013) {
          return interaction.reply({ content: "> `❌` » Ich habe nicht genügend Rechte, um diesen Benutzer zu entbannen.", ephemeral: true });
        } else {
          return interaction.reply({ content: "> `⚠️` » Unerwarteter Fehler beim Entbannen. Bitte überprüfe die Logs.", ephemeral: true });
        }
      }
    }

    // ------------------------------------------------------
    // 📩 /unban info
    // ------------------------------------------------------
    if (sub === "info") {
      const typ = interaction.options.getString("typ");
      const dauer = interaction.options.getInteger("dauer") ?? 2;
      const jetzt = new Date();

      const futureDate = new Date(jetzt.getTime() + dauer * 24 * 60 * 60 * 1000);
      const timestamp = Math.floor(futureDate.getTime() / 1000);

      const dreiMonateSpäter = new Date(jetzt);
      dreiMonateSpäter.setMonth(dreiMonateSpäter.getMonth() + 3);
      const dreiMonateTimestamp = Math.floor(dreiMonateSpäter.getTime() / 1000);

      const zweiTageSpäter = new Date(jetzt.getTime() + 2 * 24 * 60 * 60 * 1000);
      const zweiTageTimestamp = Math.floor(zweiTageSpäter.getTime() / 1000);

      let embed;

      if (typ === "statusupdate") {
        embed = new EmbedBuilder()
          .setTitle("`🟠` Statusupdate – Entbannung")
          .setDescription(
            `Lieber Nutzer,\n\n` +
            `du hast jetzt die Möglichkeit, einen Antrag auf Entbannung zu stellen.\n` +
            `Bitte beachte dabei unbedingt unsere inhaltlichen Kriterien, welche du vor der Ticketerstellung in <#819555839362072606> bestätigt hast.\n\n` +
            `Bitte sende uns bis zum <t:${timestamp}:F> (<t:${timestamp}:R>) einen Antrag auf Entbannung zu. Ansonsten wird dieser automatisch abgelehnt.`
          )
          .setColor("Orange")
          .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() });
      }

      if (typ === "hinweis") {
        embed = new EmbedBuilder()
          .setTitle("`❗` Wichtiger Hinweis")
          .setDescription(
            `Lieber Nutzer,\n\n` +
            `wir haben deinen Antrag geprüft und festgestellt, dass dieser **nicht** unseren inhaltlichen Kriterien entspricht.\n` +
            `Du findest im Kanal <#819555839362072606> entsprechende Informationen und Vorgaben.\n\n` +
            `Wir geben dir nun noch einmal die Gelegenheit, deinen Antrag bis zum <t:${timestamp}:F> (<t:${timestamp}:R>) ` +
            `entsprechend überarbeitet erneut zu senden.`
          )
          .setColor("Red")
          .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() });
      }

      if (typ === "vorerst_abgelehnt") {
        embed = new EmbedBuilder()
          .setTitle("`🔴` Statusupdate - Entbannung")
          .setDescription(
            `Lieber Nutzer,\n\n` +
            `**vielen Dank für deinen Antrag.**\n` +
            `Wir haben diesen geprüft und müssen dir mitteilen, dass er vorerst **abgelehnt** wurde.\n\n` +
            `Du hast die Möglichkeit, am <t:${dreiMonateTimestamp}:F> (<t:${dreiMonateTimestamp}:R>) erneut einen Antrag einzureichen.\n` +
            `Bis zum <t:${zweiTageTimestamp}:F> (<t:${zweiTageTimestamp}:R>) kannst du uns außerdem Fragen zu dem weiteren Verfahren stellen. ` +
            `Bitte beachte, dass dies jedoch nichts an unserer Entscheidung ändert.`
          )
          .setColor("Red")
          .setFooter({ text: interaction.guild.name, iconURL: interaction.client.user.displayAvatarURL() });
      }

      await interaction.channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed] });

      await interaction.reply({
        content: `> Die Nachricht wurde erfolgreich im Kanal gesendet.` +
          (typ !== "vorerst_abgelehnt" ? ` (**Gültigkeit: ${dauer} Tage**)` : ""),
        ephemeral: true,
      });
    }
  },
};
