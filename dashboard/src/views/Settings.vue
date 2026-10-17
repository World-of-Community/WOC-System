<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { api, unwrap } from "../api.ts";
import SettingRow from "../components/SettingRow.vue";

const groups = ref<any[]>([]);
const snapshot = ref({ roles: [] as any[], channels: [] as any[] });
const current = ref("");
const query = ref("");

onMounted(async () => {
  const [g, s] = await Promise.all([unwrap(api.get("/api/settings")), unwrap(api.get("/api/snapshot"))]);
  groups.value = g;
  snapshot.value = s;
  current.value = g[0]?.name ?? "";
});

const visible = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (q) {
    return groups.value.flatMap((g) => g.keys
      .filter((k: any) => `${g.name}.${k.key} ${k.description}`.toLowerCase().includes(q))
      .map((spec: any) => ({ group: g.name, spec })));
  }
  const group = groups.value.find((g) => g.name === current.value);
  return (group?.keys ?? []).map((spec: any) => ({ group: group.name, spec }));
});
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>Einstellungen</h1>
        <p class="sub">Alle Rollen, Channels und Werte des Bots – Änderungen gelten sofort.</p>
      </div>
      <input v-model="query" type="search" placeholder="Einstellung suchen …" class="search">
    </div>

    <p v-if="!snapshot.roles.length" class="card hint">Bot offline: Rollen und Channels können nur als ID eingegeben werden.</p>

    <div v-if="!query" class="tabs">
      <button v-for="g in groups" :key="g.name" class="tab" :class="{ active: g.name === current }" @click="current = g.name">{{ g.label }}</button>
    </div>

    <div class="card">
      <SettingRow v-for="item in visible" :key="`${item.group}.${item.spec.key}`" :group="item.group" :spec="item.spec" :snapshot="snapshot" />
      <div v-if="!visible.length" class="empty">Nichts gefunden.</div>
    </div>
  </div>
</template>

<style scoped>
.search { max-width: 300px; }
.hint { margin-bottom: 16px; color: var(--muted); padding: 12px 16px; }
</style>
