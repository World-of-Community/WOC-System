import { EmbedBuilder, MessageFlags } from "discord.js";
import SeasonPass from "#models/SeasonPass.js";
import {
  MAX_STAGE,
  REWARDS,
  addDailyXp,
  getActiveSeasonPass,
  redeemReward,
} from "#systems/seasonPass.js";
import {
  collectEventItem,
  getActiveEvent,
  getEventPeriods,
} from "#systems/seasonEvents.js";
import { UserError } from "#core/errors.js";
import { settings } from "#core/settings.js";

const EVENT_CHOICES = [
  { name: "Ostern", value: "easter" },
  { name: "Halloween", value: "halloween" },
  { name: "Weihnachten", value: "christmas" },
  { name: "Silvester", value: "newyear" },
];

export default {
  name: "season-test",
  description: "» Testet Season-Events und SeasonPass-Funktionen.",
  type: 1,
  default_member_permissions: "268435456",
  options: [
    {
      type: 1,
      name: "status",
      description: "Zeigt den aktuellen Season-Status.",
    },
    {
      type: 1,
      name: "aktivieren",
      description: "Erzwingt ein Season-Event vorübergehend für Live-Tests.",
      options: [
        {
          type: 3,
          name: "event",
          description: "Welches Event soll gestartet werden?",
          required: true,
          choices: EVENT_CHOICES,
        },
        {
          type: 4,
          name: "dauer",
          description: "Dauer in Minuten (1 bis 1440).",
          required: true,
          min_value: 1,
          max_value: 1440,
        },
      ],
    },
    {
      type: 1,
      name: "deaktivieren",
      description: "Beendet den temporären Season-Event-Override.",
    },
    {
      type: 1,
      name: "event",
      description: "Prüft ein Event mit einem simulierten Datum.",
      options: [
        {
          type: 3,
          name: "event",
          description: "Welches Event soll geprüft werden?",
          required: true,
          choices: EVENT_CHOICES,
        },
        {
          type: 3,
          name: "datum",
          description: "ISO-Datum, z. B. 2026-12-24T12:00:00Z",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "sammeln",
      description: "Sammelt ein Eventitem für einen Nutzer.",
      options: [
        {
          type: 3,
          name: "event",
          description: "Welches Event soll simuliert werden?",
          required: true,
          choices: EVENT_CHOICES,
        },
        {
          type: 6,
          name: "nutzer",
          description: "Für wen soll gesammelt werden?",
          required: false,
        },
        {
          type: 3,
          name: "datum",
          description: "ISO-Datum, z. B. 2026-12-24T12:00:00Z",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "xp",
      description: "Vergibt die tägliche SeasonPass-XP für ein Datum.",
      options: [
        {
          type: 6,
          name: "nutzer",
          description: "Für wen soll XP vergeben werden?",
          required: false,
        },
        {
          type: 3,
          name: "datum",
          description: "ISO-Datum, z. B. 2026-11-08T12:00:00Z",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "belohnung",
      description: "Löst eine SeasonPass-Belohnung für einen Nutzer ein.",
      options: [
        {
          type: 4,
          name: "stufe",
          description: `Stufe 1 bis ${MAX_STAGE}`,
          required: true,
          min_value: 1,
          max_value: MAX_STAGE,
        },
        {
          type: 6,
          name: "nutzer",
          description: "Für wen soll die Belohnung eingelöst werden?",
          required: false,
        },
      ],
    },
    {
      type: 1,
      name: "reset",
      description: "Setzt den SeasonPass eines Nutzers sofort zurück.",
      options: [
        {
          type: 6,
          name: "nutzer",
          description: "Wessen Pass soll zurückgesetzt werden?",
          required: false,
        },
      ],
    },
  ],

  async run(_client, interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("nutzer") ?? interaction.user;

    if (subcommand === "status") {
      await showStatus(interaction, user.id);
      return;
    }

    if (subcommand === "aktivieren") {
      const eventType = interaction.options.getString("event", true);
      const duration = interaction.options.getInteger("dauer", true);
      const expiresAt = new Date(Date.now() + duration * 60_000).toISOString();
      await settings.set("seasonEvents.overrideEvent", eventType, interaction.user.id);
      await settings.set("seasonEvents.overrideExpiresAt", expiresAt, interaction.user.id);

      await interaction.reply({
        content: `> \`✅\` » **${eventType.toUpperCase()}** wurde für **${duration} Minuten** aktiviert.\n> Ablauf: <t:${Math.floor(new Date(expiresAt).getTime() / 1000)}:F>\n> Mit \`/event-system\` kannst du die Anzeige neu senden.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === "deaktivieren") {
      await settings.set("seasonEvents.overrideEvent", null, interaction.user.id);
      await settings.set("seasonEvents.overrideExpiresAt", null, interaction.user.id);
      await interaction.reply({
        content: "> `✅` » Der temporäre Season-Event-Override wurde deaktiviert.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === "event") {
      const eventType = interaction.options.getString("event", true);
      const date = parseDate(interaction.options.getString("datum"));
      const periods = getEventPeriods(date);
      const activeEvent = getActiveEvent(date);
      const period = periods[eventType];

      await interaction.reply({
        content:
          `> **${eventType}** am <t:${Math.floor(date.getTime() / 1000)}:F>\n` +
          `> Status: **${activeEvent === eventType ? "aktiv" : "inaktiv"}**\n` +
          `> Zeitraum: <t:${Math.floor(period.start.getTime() / 1000)}:F> bis <t:${Math.floor(period.end.getTime() / 1000)}:F>`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === "sammeln") {
      const eventType = interaction.options.getString("event", true);
      const date = parseDate(interaction.options.getString("datum"));
      if (getActiveEvent(date) !== eventType) {
        throw new UserError(`> \`❌\` » Das ${eventType}-Event ist am angegebenen Datum nicht aktiv.`);
      }

      const collected = await collectEventItem(user.id, eventType, date);
      await interaction.reply({
        content: collected
          ? `> \`✅\` » ${user} erhielt **${collected.amount}** ${eventType}-Items. Gesamt: **${collected.total}**.`
          : `> \`❗\` » ${user} hat an diesem UTC-Tag bereits gesammelt.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === "xp") {
      const date = parseDate(interaction.options.getString("datum"));
      const before = await getActiveSeasonPass(user.id, interaction.guild);
      const pass = await addDailyXp(user.id, date, null, null, interaction.guild);
      const amount = pass.xp - before.xp;

      await interaction.reply({
        content: `> \`✅\` » ${user} erhielt **${amount} XP** für den UTC-Tag \`${date.toISOString().slice(0, 10)}\`. Gesamt: **${pass.xp} XP**.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    if (subcommand === "belohnung") {
      const stage = interaction.options.getInteger("stufe", true);
      const reward = await redeemReward(user.id, stage, interaction.guild);
      await interaction.reply({
        content: `> \`✅\` » Stufe **${reward.stage}** eingelöst: **${reward.amount.toLocaleString("de-DE")} ${reward.type === "coins" ? "Coins" : "XP"}**.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const pass = await SeasonPass.findOne({ userId: user.id });
    if (!pass) {
      throw new UserError("> `❗` » Für diesen Nutzer existiert noch kein SeasonPass.");
    }

    await SeasonPass.updateOne(
      { _id: pass._id },
      {
        $set: {
          xp: 0,
          lastActiveDay: null,
          premium: false,
          premiumStages: 0,
          redeemedStages: [],
          creatorCode: null,
          startedAt: new Date(),
          expiresAt: new Date(Date.now() - 1),
        },
      },
    );

    await interaction.reply({
      content: `> \`✅\` » SeasonPass von ${user} wurde zurückgesetzt. Beim nächsten Zugriff wird eine neue Season angelegt.`,
      flags: MessageFlags.Ephemeral,
    });
  },
};

async function showStatus(interaction, userId) {
  const now = new Date();
  const pass = await getActiveSeasonPass(userId, interaction.guild);
  const activeEvent = getActiveEvent(now);
  const nextStage = REWARDS.find((reward) => reward.requiredXp > pass.xp);

  const embed = new EmbedBuilder()
    .setTitle("Season-Teststatus")
    .setColor(activeEvent ? "Green" : "Blurple")
    .addFields(
      { name: "Aktives Event", value: activeEvent ?? "Keines", inline: true },
      { name: "SeasonPass-XP", value: pass.xp.toLocaleString("de-DE"), inline: true },
      { name: "Premium", value: pass.premium ? "Ja" : "Nein", inline: true },
      { name: "Season endet", value: `<t:${Math.floor(pass.expiresAt.getTime() / 1000)}:F>`, inline: true },
      { name: "Nächste Stufe", value: nextStage ? `${nextStage.stage} (${nextStage.requiredXp} XP)` : "Alle erreicht", inline: true },
    );

  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
}

function parseDate(value) {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new UserError("> `❌` » Ungültiges Datum. Nutze ISO-Format, z. B. `2026-12-24T12:00:00Z`.");
  }
  return date;
}
