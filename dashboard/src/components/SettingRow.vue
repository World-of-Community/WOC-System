<script setup lang="ts">
import { computed, ref } from "vue";
import { api, unwrap } from "../api.ts";
import { notify } from "../toast.ts";

type Spec = { key: string; type: string; description: string; default: unknown; value: unknown };
type Snapshot = { roles: { id: string; name: string }[]; channels: { id: string; name: string; type: string }[] };

const props = defineProps<{ group: string; spec: Spec; snapshot: Snapshot }>();
const emit = defineEmits<{ saved: [value: unknown] }>();

const LIST = new Set(["roleList", "channelList"]);

const options = computed(() => {
  const { type } = props.spec;
  if (type === "role" || type === "roleList") {return props.snapshot.roles.map((r) => ({ id: r.id, label: r.name }));}
  if (["channel", "category", "thread", "channelList"].includes(type)) {
    const wanted = type === "category" ? (c: { type: string }) => c.type === "GuildCategory" : (c: { type: string }) => c.type !== "GuildCategory";
    return props.snapshot.channels.filter(wanted).map((c) => ({ id: c.id, label: c.name }));
  }
  return [];
});

type Kind = "bool" | "multi" | "select" | "json" | "csv" | "text";
const kind = computed<Kind>(() => {
  const { type } = props.spec;
  if (type === "boolean") {return "bool";}
  if (LIST.has(type) && options.value.length) {return "multi";}
  if (options.value.length && !LIST.has(type)) {return "select";}
  if (type === "json") {return "json";}
  if (type === "roleList" || type === "channelList" || type === "stringList") {return "csv";}
  return "text";
});

const initial = (v: unknown): any => {
  if (kind.value === "json") {return JSON.stringify(v, null, 2);}
  if (kind.value === "csv") {return ((v as string[]) ?? []).join(", ");}
  if (kind.value === "select") {return (v as string) ?? "";}
  if (kind.value === "multi") {return [...((v as string[]) ?? [])];}
  return v ?? (kind.value === "bool" ? false : "");
};

const saved = ref<unknown>(props.spec.value);
const draft = ref<any>(initial(props.spec.value));
const busy = ref(false);

const dirty = computed(() => JSON.stringify(draft.value) !== JSON.stringify(initial(saved.value)));

function payload() {
  if (kind.value === "select") {return draft.value || null;}
  if (kind.value === "text" && draft.value === "" && props.spec.type !== "string") {return null;}
  return draft.value;
}

async function save(reset = false) {
  busy.value = true;
  try {
    const res = await unwrap(api.put("/api/settings/:group/:key", {
      params: { group: props.group, key: props.spec.key },
      body: reset ? { reset: true } : { value: payload() },
    }));
    saved.value = res.value;
    draft.value = initial(res.value);
    notify(res.synced ? "Gespeichert" : "Gespeichert – der Bot übernimmt es beim nächsten Start", res.synced ? "ok" : "bad");
    emit("saved", res.value);
  } finally {
    busy.value = false;
  }
}
</script>

<template>
  <div class="row">
    <div class="meta">
      <div class="name">{{ spec.description }}</div>
      <div class="path mono">{{ group }}.{{ spec.key }}</div>
    </div>

    <div class="field">
      <label v-if="kind === 'bool'" class="switch"><input v-model="draft" type="checkbox"><span /></label>
      <select v-else-if="kind === 'multi'" v-model="draft" multiple>
        <option v-for="o in options" :key="o.id" :value="o.id">{{ o.label }}</option>
      </select>
      <select v-else-if="kind === 'select'" v-model="draft">
        <option value="">– leer –</option>
        <option v-if="draft && !options.some((o) => o.id === draft)" :value="draft">unbekannt ({{ draft }})</option>
        <option v-for="o in options" :key="o.id" :value="o.id">{{ o.label }}</option>
      </select>
      <textarea v-else-if="kind === 'json'" v-model="draft" spellcheck="false" />
      <input v-else v-model="draft" type="text" :placeholder="kind === 'csv' ? 'kommagetrennt' : ''">
    </div>

    <div class="actions">
      <button class="btn primary" :disabled="!dirty || busy" @click="save()">Speichern</button>
      <button class="btn ghost" :disabled="busy" title="Standardwert" @click="save(true)">Reset</button>
    </div>
  </div>
</template>

<style scoped>
.row { display: grid; grid-template-columns: 250px 1fr 190px; gap: 18px; align-items: start; padding: 14px 0; border-bottom: 1px solid var(--line); }
.row:last-child { border-bottom: 0; }
.name { font-weight: 550; }
.path { color: var(--faint); font-size: 11.5px; margin-top: 2px; }
.field { padding-top: 2px; }
.actions { display: flex; gap: 6px; justify-content: flex-end; }
@media (max-width: 860px) { .row { grid-template-columns: 1fr; gap: 8px; } .actions { justify-content: flex-start; } }
</style>
