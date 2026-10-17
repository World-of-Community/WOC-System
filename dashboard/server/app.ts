import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { inkan, serveStatic } from "@vxnsin/inkan";
import { session } from "@inkanjs/session";
import { mongoReady, sessionSecret, sessionStore } from "./services.ts";
import { authRoutes, type SessionData } from "./auth.ts";
import { coreRoutes } from "./modules/core.ts";
import { overviewRoutes } from "./modules/overview.ts";
import { settingsRoutes } from "./modules/settings.ts";
import { emojiquizRoutes } from "./modules/emojiquiz.ts";
import { commandsRoutes } from "./modules/commands.ts";

await mongoReady;

const dist = fileURLToPath(new URL("../dist", import.meta.url));

// One chain, so the typed client in src/api.ts sees every route.
export const app = inkan({
  title: "WOC Dashboard",
  version: "1.0.0",
  docs: "/api/docs",
  openapi: "/api/openapi.json",
  inspector: "/api/_inkan",
})
  .register(session<SessionData>({ secret: sessionSecret, store: sessionStore, rolling: true, cookie: { maxAge: 7 * 86400, sameSite: "strict" } }))
  .mount("/api", authRoutes)
  .mount("/api", coreRoutes)
  .mount("/api", overviewRoutes)
  .mount("/api", settingsRoutes)
  .mount("/api", emojiquizRoutes)
  .mount("/api", commandsRoutes);

// built frontend (vite build); under `vite` the dev server serves it instead
if (existsSync(dist)) {app.register(serveStatic({ dir: dist, spa: true, exclude: ["/api"] }));}

app.listen(Number(process.env.DASHBOARD_PORT ?? 3000));
