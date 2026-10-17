<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api, unwrap } from "../api.ts";
import { notify } from "../toast.ts";

type Command = { name: string; description: string; category: string; enabled: boolean };

const botOnline = ref(true);
const commands = ref<Command[]>([]);
const query = ref("");
const busy = ref<string | null>(null);

onMounted(async () => {
  const data = await unwrap(api.get("/api/commands"));
  botOnline.value = data.botOnline;
  commands.value = data.commands;
});

const shown = computed(() => {
  const q = query.value.trim().toLowerCase();
  return commands.value.filter((c) => c.name.includes(q) || c.category.toLowerCase().includes(q));
});
const disabledCount = computed(() => commands.value.filter((c) => !c.enabled).length);

async function toggle(c: Command) {
  busy.value = c.name;
  try {
    const res = await unwrap(api.put("/api/commands/:name", { params: { name: c.name }, body: { enabled: !c.enabled } }));
    c.enabled = res.enabled;
    notify(res.synced ? `/${c.name} ${c.enabled ? "aktiviert" : "deaktiviert"}` : "Gespeichert, der Bot hat nicht geantwortet", res.synced ? "ok" : "bad");
  } finally {
    busy.value = null;
  }
}
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Commands</h1>
        <p class="sub">Deaktivierte Commands werden bei Discord ausgetragen. <span v-if="disabledCount" class="tag bad">{{ disabledCount }} aus</span></p>
      </div>
      <input v-model="query" type="search" placeholder="Command oder Bereich suchen …" class="search">
    </div>

    <div v-if="!botOnline" class="card empty">Der Bot ist offline – die Command-Liste kommt vom laufenden Bot.</div>
    <div v-else class="card">
      <table>
        <thead><tr><th>Command</th><th>Bereich</th><th>Beschreibung</th><th>Aktiv</th></tr></thead>
        <tbody>
          <tr v-for="c in shown" :key="c.name" :class="{ off: !c.enabled }">
            <td class="mono">/{{ c.name }}</td>
            <td><span class="tag">{{ c.category }}</span></td>
            <td class="muted">{{ c.description }}</td>
            <td>
              <label class="switch"><input type="checkbox" :checked="c.enabled" :disabled="busy === c.name" @change="toggle(c)"><span /></label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.search { max-width: 300px; }
.off .mono { text-decoration: line-through; color: var(--faint); }
.sub { display: flex; gap: 10px; align-items: center; }
</style>
