import { problem, routes, t, type Middleware } from "@vxnsin/inkan";
import { dashboardToken } from "./services.ts";

// Placeholder login with a shared token. The Discord login replaces `login` and fills the
// session with the Discord account; `requireUser` and everything behind it stays as it is.
export type DashboardUser = { id: string; name: string };

export type SessionData = { user: DashboardUser };

export const requireUser: Middleware = async (ctx, next) => {
  const user = (ctx as any).session.get("user") as DashboardUser | undefined;
  if (!user) {throw problem(401, "unauthorized", "Nicht angemeldet");}
  ctx.state.user = user;
  await next();
};

export const userOf = (ctx: { state: Record<string, unknown> }) => ctx.state.user as DashboardUser;

const User = t.object({ id: t.string(), name: t.string() }).named("DashboardUser");

export const authRoutes = routes()
  .post(
    "/auth/login",
    {
      summary: "Anmelden mit dem Dashboard-Token",
      body: t.object({ token: t.string() }),
      response: { 200: User, 403: t.problem() },
    },
    (ctx: any) => {
      if (ctx.body.token !== dashboardToken) {throw problem(403, "wrong-token", "Falscher Token");}
      const user: DashboardUser = { id: "dashboard", name: "Dashboard" };
      ctx.session.regenerate().set("user", user);
      return user;
    },
  )
  .post("/auth/logout", { summary: "Abmelden", response: { 204: t.empty() } }, (ctx: any) => {
    ctx.session.destroy();
  })
  .get(
    "/auth/me",
    { summary: "Wer bin ich?", response: { 200: User, 401: t.problem() }, use: [requireUser] },
    (ctx: any) => userOf(ctx),
  );
