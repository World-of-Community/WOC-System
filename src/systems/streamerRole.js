import { ActivityType, DiscordAPIError, PermissionFlagsBits } from "discord.js";
import logger from "#core/logger.js";
import { settings } from "#core/settings.js";

const log = logger.child("StreamerRole");

// warn about missing role / permissions only once per process, not on every presence update
const warned = new Set();
function warnOnce(key, message) {
  if (warned.has(key)) {return;}
  warned.add(key);
  log.warn(message);
}

const normalizeActivities = (activities) => (Array.isArray(activities) ? activities.filter(Boolean) : []);

export function getStreamingActivity(activities) {
  return normalizeActivities(activities).find((a) => a?.type === ActivityType.Streaming) ?? null;
}

function formatDiscordError(error) {
  return error instanceof DiscordAPIError ? `${error.message} (code: ${error.code})` : error?.message ?? String(error);
}

async function resolveMember(presence) {
  if (presence?.member) {return presence.member;}
  const userId = presence?.userId ?? presence?.user?.id;
  if (!presence?.guild || !userId) {return null;}
  return presence.guild.members.cache.get(userId) ?? presence.guild.members.fetch(userId).catch(() => null);
}

function resolveRole(guild) {
  const roleId = settings.get("roles.streamer");
  const role = guild?.roles?.cache?.get(roleId);
  if (!role) {
    warnOnce("role", `Streamer role ${roleId} not found`);
    return null;
  }

  const me = guild.members.me;
  if (!me?.permissions.has(PermissionFlagsBits.ManageRoles)) {
    warnOnce("perms", "Missing ManageRoles permission");
    return null;
  }
  if (role.position >= me.roles.highest.position) {
    warnOnce("hierarchy", `Role ${role.name} is above the bot's highest role`);
    return null;
  }
  return role;
}

export async function syncStreamerRoleForMember(member, activitiesInput, source = "unknown") {
  if (!member) {return { status: "missing_member" };}
  if (member.user?.bot) {return { status: "ignored_bot" };}

  const role = resolveRole(member.guild);
  if (!role) {return { status: "role_unavailable" };}

  const streaming = getStreamingActivity(activitiesInput ?? member.presence?.activities);
  const hasRole = member.roles.cache.has(role.id);

  if (!streaming && !hasRole) {return { status: "not_streaming_no_role" };}
  if (streaming && hasRole) {return { status: "already_had_role" };}

  try {
    if (streaming) {
      await member.roles.add(role, "Streamer ist aktuell live");
      log.info(`Role added: ${member.user.tag} (${streaming.name ?? "stream"}, ${source})`);
      return { status: "added_role" };
    }
    await member.roles.remove(role, "Streamer ist nicht mehr live");
    log.info(`Role removed: ${member.user.tag} (${source})`);
    return { status: "removed_role" };
  } catch (error) {
    log.error(`Role change failed for ${member.user?.tag ?? member.id}: ${formatDiscordError(error)}`);
    return { status: streaming ? "role_add_failed" : "role_remove_failed", error };
  }
}

export async function handlePresenceUpdate(oldPresence, newPresence) {
  if (!newPresence) {return { status: "missing_new_presence" };}

  const wasStreaming = Boolean(getStreamingActivity(oldPresence?.activities));
  const isStreaming = Boolean(getStreamingActivity(newPresence.activities));
  if (wasStreaming === isStreaming) {return { status: "unchanged" };}

  const member = await resolveMember(newPresence);
  if (!member) {return { status: "missing_member_from_presence" };}

  return syncStreamerRoleForMember(member, newPresence.activities, "presenceUpdate");
}

// On startup: members currently streaming get the role, members with the role but no stream lose it.
export async function syncStreamerStateOnStartup(client) {
  let changed = 0;

  for (const guild of client.guilds.cache.values()) {
    const role = guild.roles.cache.get(settings.get("roles.streamer"));
    const candidateIds = new Set();

    for (const member of guild.members.cache.values()) {
      if (getStreamingActivity(member.presence?.activities)) {candidateIds.add(member.id);}
    }
    for (const member of role?.members.values() ?? []) {
      candidateIds.add(member.id);
    }

    for (const memberId of candidateIds) {
      const member = guild.members.cache.get(memberId) ?? await guild.members.fetch(memberId).catch(() => null);
      if (!member) {continue;}
      const result = await syncStreamerRoleForMember(member, member.presence?.activities, "startupSync");
      if (result.status === "added_role" || result.status === "removed_role") {changed += 1;}
    }
  }

  log.info(`Startup sync done, ${changed} role change(s)`);
}
