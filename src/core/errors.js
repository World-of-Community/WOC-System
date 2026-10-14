import { EmbedBuilder, DiscordAPIError, MessageFlags, codeBlock } from "discord.js";
import logger from "./logger.js";
import { sendLog } from "./discordLog.js";
import { safeReply } from "./reply.js";
import { settings } from "#core/settings.js";

// Thrown by commands/components when the message is meant for the user.
// Not reported as a bot error.
export class UserError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "UserError";
    this.ephemeral = options.ephemeral ?? true;
  }
}

export class AppError extends Error {
  constructor(message, context = {}, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "AppError";
    this.context = context;
  }
}

// Unknown Message/Channel/Member/Interaction, Missing Access, Cannot DM, Missing Permissions, already acknowledged
const IGNORED_DISCORD_CODES = new Set([10003, 10007, 10008, 10062, 50001, 50007, 50013, 40060]);

export function isIgnorableDiscordError(error) {
  return error instanceof DiscordAPIError && IGNORED_DISCORD_CODES.has(error.code);
}

// Same error is only posted to Discord once per minute
const recentReports = new Map();
const REPORT_COOLDOWN = 60_000;

function errorKey(error) {
  return `${error?.name}:${error?.message}`.slice(0, 200);
}

function describeContext(context) {
  return Object.entries(context)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `> **${k}:** ${v}`)
    .join("\n");
}

export async function reportError(error, context = {}) {
  const err = error instanceof Error ? error : new Error(String(error));

  const source = context.source ?? "unknown";
  logger.error(`[${source}]`, err);

  if (isIgnorableDiscordError(err)) {return;}

  const key = errorKey(err);
  const last = recentReports.get(key) ?? 0;
  if (Date.now() - last < REPORT_COOLDOWN) {return;}
  recentReports.set(key, Date.now());

  if (recentReports.size > 200) {
    const oldest = [...recentReports.entries()].sort((a, b) => a[1] - b[1]).slice(0, 100);
    for (const [k] of oldest) {recentReports.delete(k);}
  }

  try {
    const stack = (err.stack ?? err.message ?? "no stack").slice(0, 1800);
    const embed = new EmbedBuilder()
      .setTitle("`❌` | FEHLER BEI BOT")
      .setDescription(`${describeContext({ Quelle: source, ...context, source: undefined })}\n${codeBlock("js", stack)}`)
      .setColor("Orange")
      .setTimestamp();

    await sendLog(settings.get("logThreads.error"), embed);
  } catch (sendError) {
    logger.error("Could not send error report to Discord:", sendError);
  }
}

export const genericErrorMessage = () =>
  "> `❌` » Es ist ein Fehler beim Ausführen aufgetreten!\n" +
  `> \`📌\` » Bitte gib einem Teammitglied Bescheid oder öffne ein Ticket im <#${settings.get("channels.support")}>`;

export async function handleInteractionError(interaction, error, context = {}) {
  if (error instanceof UserError) {
    await safeReply(interaction, { content: error.message, flags: error.ephemeral ? MessageFlags.Ephemeral : undefined });
    return;
  }

  await reportError(error, {
    source: context.source,
    user: interaction?.user ? `${interaction.user.tag} (${interaction.user.id})` : undefined,
    channel: interaction?.channelId ? `<#${interaction.channelId}>` : undefined,
    customId: interaction?.customId,
    command: interaction?.commandName,
  });

  // interaction token expired, nothing left to reply to
  if (error instanceof DiscordAPIError && error.code === 10062) {return;}

  await safeReply(interaction, { content: genericErrorMessage(), flags: MessageFlags.Ephemeral });
}

export function registerProcessHandlers() {
  process.on("unhandledRejection", (reason) => {
    reportError(reason, { source: "process:unhandledRejection" });
  });

  process.on("uncaughtException", (error) => {
    reportError(error, { source: "process:uncaughtException" });
  });

  process.on("warning", (warning) => {
    logger.debug("Node warning:", warning);
  });
}
