import { createRouter, createWebHistory } from "vue-router";
import { api } from "./api.ts";

// Route names match the module ids from /api/modules (dashboard/server/modules/core.ts).
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/login", name: "login", component: () => import("./views/Login.vue"), meta: { public: true } },
    { path: "/", name: "overview", component: () => import("./views/Overview.vue") },
    { path: "/settings", name: "settings", component: () => import("./views/Settings.vue") },
    { path: "/emojiquiz", name: "emojiquiz", component: () => import("./views/EmojiQuiz.vue") },
    { path: "/commands", name: "commands", component: () => import("./views/Commands.vue") },
    { path: "/:rest(.*)*", redirect: "/" },
  ],
});

let signedIn = false;

export function markSignedIn(value: boolean) {
  signedIn = value;
}

router.beforeEach(async (to) => {
  if (to.meta.public) {return true;}
  if (signedIn) {return true;}
  const me = await api.get("/api/auth/me");
  signedIn = me.ok;
  return signedIn ? true : { name: "login" };
});
