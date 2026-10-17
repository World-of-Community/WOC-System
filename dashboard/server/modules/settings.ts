import { problem, routes, t } from "@vxnsin/inkan";
import Settings from "#models/Settings.js";
import { SETTINGS_SCHEMA } from "#config/settings.schema.js";
import { coerce } from "#core/settings.js";
import { COMMANDS } from "#config/dashboardProtocol.js";
import { bridge } from "../services.ts";
import { requireUser, userOf } from "../auth.ts";

const Entry = t.object({
  key: t.string(),
  type: t.string(),
  description: t.string(),
  default: t.any(),
  value: t.any(),
});
const Group = t.object({ name: t.string(), label: t.string(), keys: t.array(Entry) });

export const settingsRoutes = routes().use(requireUser);

settingsRoutes.get(
  "/settings",
  { summary: "Alle Einstellungen, nach Gruppen", response: { 200: t.array(Group) } },
  async () => {
    const docs = new Map<string, any>(((await Settings.find().lean()) as any[]).map((d) => [d._id, d]));
    return Object.entries(SETTINGS_SCHEMA).map(([name, def]) => ({
      name,
      label: def.label,
      keys: Object.entries(def.keys).map(([key, spec]) => ({
        key,
        type: spec.type,
        description: spec.description,
        default: spec.default ?? null,
        value: docs.get(name)?.[key] ?? spec.default ?? null,
      })),
    }));
  },
);

settingsRoutes.put(
  "/settings/:group/:key",
  {
    summary: "Eine Einstellung speichern oder zurücksetzen",
    params: t.object({ group: t.string(), key: t.string() }),
    body: t.object({ value: t.any().optional(), reset: t.boolean().optional() }),
    response: { 200: t.object({ value: t.any(), synced: t.boolean() }), 400: t.problem(), 404: t.problem() },
  },
  async (ctx) => {
    const { group, key } = ctx.params;
    const spec = SETTINGS_SCHEMA[group]?.keys?.[key];
    if (!spec) {throw problem(404, "unknown-setting", "Unbekannte Einstellung");}

    let value: unknown;
    try {
      if (ctx.body.reset) {value = spec.default;}
      else if (ctx.body.value === null || ctx.body.value === undefined) {value = null;}
      else {value = coerce(spec.type, ctx.body.value);}
    } catch (error) {
      throw problem(400, "invalid-value", (error as Error).message);
    }

    await Settings.updateOne(
      { _id: group },
      { $set: { [key]: value, updatedAt: new Date(), updatedBy: `dashboard:${userOf(ctx).id}` } },
      { upsert: true },
    );
    const sync = await bridge.send(COMMANDS.settingsReload);
    return { value: value ?? null, synced: sync.ok };
  },
);
