<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { api, unwrap } from "../api.ts";
import { notify } from "../toast.ts";

const tab = ref<"suggestions" | "pool">("suggestions");
const suggestions = ref<any[]>([]);
const entries = ref<any[]>([]);
const difficulties = ref<string[]>([]);
const query = ref("");
const form = reactive({ begriff: "", emojis: "", tipp: "", schwierigkeit: "mittel" });

onMounted(async () => {
  const [s, pool] = await Promise.all([
    unwrap(api.get("/api/emojiquiz/suggestions", { query: { status: "offen" } })),
    unwrap(api.get("/api/emojiquiz/entries")),
  ]);
  suggestions.value = s;
  entries.value = pool.entries;
  difficulties.value = pool.difficulties;
});

const shown = computed(() => {
  const q = query.value.trim().toLowerCase();
  return entries.value.filter((e) => e.begriff.toLowerCase().includes(q) || e.emojis.includes(q));
});

async function review(s: any, accept: boolean) {
  await unwrap(api.post("/api/emojiquiz/suggestions/:id/review", { params: { id: s._id }, body: { accept } }));
  suggestions.value = suggestions.value.filter((x) => x._id !== s._id);
  notify(accept ? `${s.begriff} angenommen` : `${s.begriff} abgelehnt`);
  if (accept) {entries.value = (await unwrap(api.get("/api/emojiquiz/entries"))).entries;}
}

async function add() {
  const created = await unwrap(api.post("/api/emojiquiz/entries", { body: { ...form, schwierigkeit: form.schwierigkeit as "mittel" } }));
  entries.value = [...entries.value, created].sort((a, b) => a.begriff.localeCompare(b.begriff));
  form.begriff = form.emojis = form.tipp = "";
  notify(`${created.begriff} hinzugefügt`);
}

async function remove(e: any) {
  if (!confirm(`"${e.begriff}" wirklich löschen?`)) {return;}
  await unwrap(api.delete("/api/emojiquiz/entries/:id", { params: { id: e._id } }));
  entries.value = entries.value.filter((x) => x._id !== e._id);
}

const date = (iso: string) => new Date(iso).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Emoji-Quiz</h1>
        <p class="sub">Vorschläge der Community prüfen und den Rätsel-Pool pflegen.</p>
      </div>
    </div>

    <div class="tabs">
      <button class="tab" :class="{ active: tab === 'suggestions' }" @click="tab = 'suggestions'">Vorschläge <b v-if="suggestions.length">{{ suggestions.length }}</b></button>
      <button class="tab" :class="{ active: tab === 'pool' }" @click="tab = 'pool'">Rätsel-Pool <b>{{ entries.length }}</b></button>
    </div>

    <template v-if="tab === 'suggestions'">
      <div v-if="!suggestions.length" class="card empty">Keine offenen Vorschläge.</div>
      <div v-for="s in suggestions" :key="s._id" class="card suggestion">
        <div class="emojis">{{ s.emojis }}</div>
        <div class="body">
          <div><b>{{ s.begriff }}</b> <span class="tag">{{ s.schwierigkeit }}</span></div>
          <div class="muted meta">Tipp: {{ s.tipp || "–" }} · von {{ s.username ?? s.userId }} · {{ date(s.timestamp) }}</div>
        </div>
        <div class="actions">
          <button class="btn good" @click="review(s, true)">Annehmen</button>
          <button class="btn danger" @click="review(s, false)">Ablehnen</button>
        </div>
      </div>
    </template>

    <template v-else>
      <form class="card add" @submit.prevent="add">
        <input v-model="form.begriff" type="text" placeholder="Begriff" required>
        <input v-model="form.emojis" type="text" placeholder="Emojis" required>
        <select v-model="form.schwierigkeit"><option v-for="d in difficulties" :key="d">{{ d }}</option></select>
        <input v-model="form.tipp" type="text" placeholder="Tipp (optional)">
        <button class="btn primary">Hinzufügen</button>
      </form>

      <div class="toolbar"><input v-model="query" type="search" placeholder="Pool durchsuchen …"></div>
      <div class="card">
        <table>
          <thead><tr><th>Begriff</th><th>Emojis</th><th>Stufe</th><th>Tipp</th><th /></tr></thead>
          <tbody>
            <tr v-for="e in shown" :key="e._id">
              <td><b>{{ e.begriff }}</b></td>
              <td class="big">{{ e.emojis }}</td>
              <td><span class="tag">{{ e.schwierigkeit }}</span></td>
              <td class="muted">{{ e.tipp }}</td>
              <td class="right"><button class="btn ghost" @click="remove(e)">Löschen</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<style scoped>
.tab b { margin-left: 6px; font-weight: 600; color: var(--accent); }
.suggestion { display: flex; align-items: center; gap: 18px; margin-bottom: 10px; }
.emojis { font-size: 34px; min-width: 90px; text-align: center; }
.body { flex: 1; }
.meta { font-size: 12.5px; margin-top: 2px; }
.actions { display: flex; gap: 8px; }
.add { display: grid; grid-template-columns: 1.2fr 1.5fr 130px 1.5fr auto; gap: 10px; margin-bottom: 14px; align-items: center; }
.toolbar { margin-bottom: 12px; max-width: 320px; }
.big { font-size: 22px; }
.right { text-align: right; }
@media (max-width: 860px) {
  .add { grid-template-columns: 1fr; }
  .suggestion { flex-wrap: wrap; }
}
</style>
