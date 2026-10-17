import { routes, t } from "@vxnsin/inkan";
import Settings from "#models/Settings.js";
import { SETTINGS_SCHEMA } from "#config/settings.schema.js";
import { COMMANDS } from "#config/dashboardProtocol.js";
import { bridge } from "../services.ts";
import { requireUser, userOf } from "../auth.ts";

const Command = t.object({ name: t.string(), description: t.string(), category: t.string(), enabled: t.boolean() });

async function disabledList(): Promise<string[]> {
  const doc: any = await Settings.findById("system").lean();
  return doc?.disabledCommands ?? (SETTINGS_SCHEMA.system.keys.disabledCommands.default as string[]);
}

export const commandsRoutes = routes().use(requireUser);

commandsRoutes.get(
  "/commands",
  { summary: "Alle Slash-Commands des Bots", response: { 200: t.object({ botOnline: t.boolean(), commands: t.array(Command) }) } },
  async () => {
    const snapshot = await bridge.snapshot();
    const disabled = new Set((await disabledList()).map((n) => n.toLowerCase()));
    const commands = (snapshot?.commands ?? [])
      .map((c) => ({ ...c, enabled: !disabled.has(c.name.toLowerCase()) }))
      .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    return { botOnline: Boolean(snapshot), commands };
  },
);

commandsRoutes.put(
  "/commands/:name",
  {
    summary: "Command aktivieren oder deaktivieren",
    params: t.object({ name: t.string() }),
    body: t.object({ enabled: t.boolean() }),
    response: { 200: t.object({ enabled: t.boolean(), synced: t.boolean() }) },
  },
  async (ctx) => {
    const name = ctx.params.name.toLowerCase();
    const next = new Set((await disabledList()).map((n) => n.toLowerCase()));
    if (ctx.body.enabled) {next.delete(name);} else {next.add(name);}

    await Settings.updateOne(
      { _id: "system" },
      { $set: { disabledCommands: [...next], updatedAt: new Date(), updatedBy: `dashboard:${userOf(ctx).id}` } },
      { upsert: true },
    );
    const sync = await bridge.send(COMMANDS.commandsSync, {}, 20_000);
    return { enabled: ctx.body.enabled, synced: sync.ok };
  },
);
