import { routes, t } from "@vxnsin/inkan";
import { bridge } from "../services.ts";
import { requireUser } from "../auth.ts";

// Sidebar entries; `id` matches the route name in src/router.ts.
const MODULES = [
  { id: "overview", label: "Übersicht" },
  { id: "settings", label: "Einstellungen" },
  { id: "emojiquiz", label: "Emoji-Quiz" },
  { id: "commands", label: "Commands" },
];

export const coreRoutes = routes()
  .use(requireUser)
  .get(
    "/modules",
    {
      summary: "Module für die Seitenleiste",
      response: { 200: t.array(t.object({ id: t.string(), label: t.string() })) },
    },
    () => MODULES,
  )
  .get(
    "/snapshot",
    {
      summary: "Rollen und Channels des Servers (vom Bot)",
      response: {
        200: t.object({
          roles: t.array(t.object({ id: t.string(), name: t.string(), color: t.string().optional() })),
          channels: t.array(t.object({ id: t.string(), name: t.string(), type: t.string() })),
        }),
      },
    },
    async () => {
      const s = await bridge.snapshot();
      return {
        roles: (s?.roles ?? []).map(({ id, name, color }) => ({ id, name, color })),
        channels: (s?.channels ?? []).map(({ id, name, type }) => ({ id, name, type })),
      };
    },
  );
