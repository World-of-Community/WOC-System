import {
  ActivityType,
  DiscordAPIError,
  PermissionFlagsBits,
} from "discord.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

function normalizeActivities(activities) {
  if (!Array.isArray(activities)) {return [];}
  return activities.filter(Boolean);
}

export function getStreamingActivity(activities) {
  return normalizeActivities(activities)
    .find((activity) => activity?.type === ActivityType.Streaming) ?? null;
}

async function resolveMemberFromPresence(presence) {
  if (presence?.member) {return presence.member;}

  const guild = presence?.guild;
  const userId = presence?.userId ?? presence?.user?.id;
  if (!guild || !userId) {return null;}

  return guild.members.cache.get(userId)
    ?? guild.members.fetch(userId).catch(() => null);
}

async function resolveBotMember(guild) {
  if (!guild) {return null;}
  if (guild.members.me) {return guild.members.me;}
  if (typeof guild.members.fetchMe === "function") {
    return guild.members.fetchMe().catch(() => null);
  }
  return null;
}

function formatDiscordError(error) {
  if (error instanceof DiscordAPIError) {
    return `${error.message} (code: ${error.code})`;
  }
  return error?.message ?? String(error);
}

async function applyRoleChange(member, role, action, reason) {
  try {
    if (action === "add") {
      await member.roles.add(role, reason);
    } else {
      await member.roles.remove(role, reason);
    }
    return true;
  } catch (error) {
    logger.error(
      `[StreamerRole] Rollenänderung fehlgeschlagen (${action}) für ${member.user?.tag ?? member.id}: ${formatDiscordError(error)}`,
    );
    return false;
  }
}

export async function syncStreamerRoleForMember(
  member,
  activitiesInput,
  source = "unknown",
) {
  try {
    if (!member) {
      logger.warn(`[StreamerRole] Kein Member übergeben (${source}).`);
      return { status: "missing_member" };
    }
    if (member.user?.bot) {return { status: "ignored_bot" };}

    const guild = member.guild;
    const role = guild?.roles?.cache?.get(settings.get("roles.streamer"));
    if (!role) {
      logger.warn(`[StreamerRole] Zielrolle ${settings.get("roles.streamer")} nicht gefunden (${source}).`);
      return { status: "missing_role" };
    }

    const botMember = await resolveBotMember(guild);
    if (!botMember) {
      logger.warn(`[StreamerRole] Bot-Member nicht verfügbar in ${guild.name} (${source}).`);
      return { status: "missing_bot_member" };
    }

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      logger.warn(`[StreamerRole] Fehlende Berechtigung: ManageRoles (${source}).`);
      return { status: "missing_permissions" };
    }

    if (role.position >= botMember.roles.highest.position) {
      logger.warn(`[StreamerRole] Rollen-Hierarchie blockiert Änderung für ${role.name} (${source}).`);
      return { status: "hierarchy_blocked" };
    }

    const activities = normalizeActivities(activitiesInput ?? member.presence?.activities);
    const streamingActivity = getStreamingActivity(activities);
    const isStreaming = Boolean(streamingActivity);
    const hasRole = member.roles.cache.has(role.id);

    if (!isStreaming) {
      logger.info(`[StreamerRole] Keine Streaming-Aktivität gefunden für ${member.user.tag} (${source}).`);
      if (!hasRole) {return { status: "not_streaming_no_role" };}

      const removed = await applyRoleChange(
        member,
        role,
        "remove",
        "Streamer ist nicht mehr live",
      );
      if (!removed) {return { status: "role_remove_failed" };}

      logger.info(`[StreamerRole] Rolle entfernt: ${member.user.tag} (${source}).`);
      return { status: "removed_role" };
    }

    logger.info(
      `[StreamerRole] Streaming erkannt bei ${member.user.tag} (${streamingActivity?.name ?? "Unbekannt"} | ${source}).`,
    );

    if (hasRole) {
      logger.info(`[StreamerRole] Rolle bereits vorhanden: ${member.user.tag} (${source}).`);
      return { status: "already_had_role" };
    }

    const added = await applyRoleChange(
      member,
      role,
      "add",
      "Streamer ist aktuell live",
    );
    if (!added) {return { status: "role_add_failed" };}

    logger.info(`[StreamerRole] Rolle vergeben: ${member.user.tag} (${source}).`);
    return { status: "added_role" };
  } catch (error) {
    logger.error(`[StreamerRole] Unerwarteter Fehler (${source}):`, error);
    return { status: "unexpected_error", error };
  }
}

export async function handlePresenceUpdate(oldPresence, newPresence) {
  logger.info("[StreamerRole] PresenceUpdate empfangen.");

  if (!newPresence) {
    logger.warn("[StreamerRole] PresenceUpdate ohne newPresence.");
    return { status: "missing_new_presence" };
  }

  const member = await resolveMemberFromPresence(newPresence);
  if (!member) {
    logger.warn("[StreamerRole] Kein Member aus Presence ermittelbar.");
    return { status: "missing_member_from_presence" };
  }

  const oldStreaming = Boolean(getStreamingActivity(oldPresence?.activities));
  const newStreaming = Boolean(getStreamingActivity(newPresence?.activities));

  if (oldStreaming === newStreaming) {
    logger.info("[StreamerRole] Streaming-Status unverändert im PresenceUpdate.");
  }

  if (!Array.isArray(newPresence.activities)) {
    logger.warn("[StreamerRole] Presence enthält keine verwendbaren activities.");
  }

  return syncStreamerRoleForMember(member, newPresence.activities, "presenceUpdate");
}

export async function syncStreamerStateOnStartup(client) {
  logger.info("[StreamerRole] Starte Initial-Synchronisierung (cache-basiert).");

  for (const guild of client.guilds.cache.values()) {
    const role = guild.roles.cache.get(settings.get("roles.streamer"));
    const candidateIds = new Set();

    for (const member of guild.members.cache.values()) {
      if (normalizeActivities(member.presence?.activities).length > 0) {
        candidateIds.add(member.id);
      }
    }

    if (role) {
      for (const roleMember of role.members.values()) {
        candidateIds.add(roleMember.id);
      }
    }

    if (candidateIds.size === 0) {continue;}

    logger.info(`[StreamerRole] Initial-Sync in ${guild.name}: ${candidateIds.size} Kandidat(en).`);

    for (const memberId of candidateIds) {
      const member = guild.members.cache.get(memberId)
        ?? await guild.members.fetch(memberId).catch(() => null);
      if (!member) {
        logger.warn(`[StreamerRole] Member ${memberId} konnte im Initial-Sync nicht geladen werden.`);
        continue;
      }

      await syncStreamerRoleForMember(member, member.presence?.activities, "startupSync");
    }
  }

  logger.info("[StreamerRole] Initial-Synchronisierung abgeschlossen.");
  logger.info("[StreamerRole] Hinweis: Presence-Daten sind gateway-seitig nicht jederzeit vollständig verfügbar.");
}
