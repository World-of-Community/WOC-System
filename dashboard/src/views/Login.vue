<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api.ts";
import { markSignedIn } from "../router.ts";

const router = useRouter();
const token = ref("");
const error = ref("");
const busy = ref(false);

async function submit() {
  busy.value = true;
  error.value = "";
  const res = await api.post("/api/auth/login", { body: { token: token.value } });
  busy.value = false;
  if (!res.ok) {
    error.value = (res as any).problem?.detail ?? "Anmeldung fehlgeschlagen";
    return;
  }
  markSignedIn(true);
  router.push({ name: "overview" });
}
</script>

<template>
  <div class="wrap">
    <form class="card login" @submit.prevent="submit">
      <div class="mark">WOC</div>
      <h1>Dashboard</h1>
      <p class="sub">Melde dich an, um den Bot zu verwalten.</p>
      <input v-model="token" type="password" placeholder="Dashboard-Token" autofocus autocomplete="current-password">
      <button class="btn primary" :disabled="busy || !token">Anmelden</button>
      <div class="error">{{ error }}</div>
    </form>
  </div>
</template>

<style scoped>
.wrap { min-height: 100vh; display: grid; place-items: center; padding: 20px; }
.login { width: 100%; max-width: 340px; display: flex; flex-direction: column; gap: 12px; padding: 26px; }
.login h1 { font-size: 18px; }
.login .sub { margin: -6px 0 6px; }
.mark { font: 600 13px var(--mono); letter-spacing: .1em; color: var(--accent); }
.btn { padding: 8px; }
.error { min-height: 20px; color: var(--bad); font-size: 13px; }
</style>
