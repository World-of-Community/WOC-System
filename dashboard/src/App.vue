<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api, unwrap } from "./api.ts";
import { markSignedIn } from "./router.ts";
import { toasts } from "./toast.ts";
import Icon from "./components/Icon.vue";

const route = useRoute();
const router = useRouter();
const modules = ref<{ id: string; label: string }[]>([]);
const authed = computed(() => !route.meta.public);

watch(authed, async (value) => {
  if (value && modules.value.length === 0) {modules.value = await unwrap(api.get("/api/modules"), { quiet: true }).catch(() => []);}
}, { immediate: true });

async function logout() {
  await api.post("/api/auth/logout");
  markSignedIn(false);
  modules.value = [];
  router.push({ name: "login" });
}
</script>

<template>
  <div v-if="authed" class="shell">
    <aside class="sidebar">
      <div class="brand">
        <span class="wordmark">WOC</span>
        <span class="eyebrow">Dashboard</span>
      </div>

      <nav>
        <RouterLink v-for="m in modules" :key="m.id" :to="{ name: m.id }" class="nav" active-class="active">
          <Icon :name="m.id" /> {{ m.label }}
        </RouterLink>
      </nav>

      <div class="spacer" />
      <button class="nav" @click="logout"><Icon name="logout" /> Abmelden</button>
    </aside>
    <main><RouterView /></main>
  </div>
  <RouterView v-else />

  <div class="toasts">
    <div v-for="t in toasts" :key="t.id" class="toast" :class="t.kind">{{ t.message }}</div>
  </div>
</template>

<style scoped>
.shell { display: grid; grid-template-columns: 216px 1fr; min-height: 100vh; }
.sidebar {
  position: sticky; top: 0; height: 100vh;
  display: flex; flex-direction: column; gap: 2px;
  padding: 20px 12px;
  background: var(--surface);
  border-right: 1px solid var(--line);
}
.brand { display: flex; align-items: baseline; gap: 10px; padding: 0 10px 22px; }
.wordmark { font: 600 17px var(--mono); letter-spacing: .04em; }
nav { display: flex; flex-direction: column; gap: 1px; }
.nav {
  display: flex; align-items: center; gap: 10px;
  padding: 7px 10px; border: 0; border-radius: 6px; background: none;
  color: var(--muted); font-weight: 500; text-align: left; text-decoration: none;
  position: relative;
}
.nav:hover { color: var(--text); background: var(--raised); }
.nav.active { color: var(--text); background: var(--raised); }
.nav.active::before { content: ""; position: absolute; left: -12px; top: 7px; bottom: 7px; width: 2px; background: var(--accent); }
.nav :deep(svg) { opacity: .7; }
.nav.active :deep(svg) { opacity: 1; }
.spacer { flex: 1; }
main { min-width: 0; }

.toasts { position: fixed; right: 20px; bottom: 20px; display: flex; flex-direction: column; gap: 8px; z-index: 50; }
.toast { padding: 9px 14px; border-radius: 6px; background: var(--raised); border: 1px solid var(--line-strong); border-left-width: 3px; }
.toast.bad { border-left-color: var(--bad); }
.toast.ok { border-left-color: var(--good); }

@media (max-width: 860px) {
  .shell { grid-template-columns: 1fr; }
  .sidebar { position: static; height: auto; flex-direction: row; flex-wrap: wrap; align-items: center; }
  .brand { width: 100%; padding-bottom: 8px; }
  nav { flex-direction: row; flex-wrap: wrap; }
  .spacer { display: none; }
  .nav.active::before { display: none; }
}
</style>
