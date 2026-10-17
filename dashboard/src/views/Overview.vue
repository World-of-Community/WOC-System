<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { api, unwrap } from "../api.ts";
import StatStrip, { type Stat } from "../components/StatStrip.vue";
import TrendChart from "../components/TrendChart.vue";

const status = ref<any>(null);
const insights = ref<any>(null);

// preset = last N days, custom = explicit from/to
const preset = ref<number | "custom">(30);
const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const todayIso = iso(new Date());
const custom = reactive({ from: iso(new Date(Date.now() - 13 * 864e5)), to: todayIso });

async function loadInsights() {
  const query = preset.value === "custom"
    ? { from: custom.from, to: custom.to }
    : { days: preset.value };
  insights.value = await unwrap(api.get("/api/overview/insights", { query }));
}

onMounted(async () => {
  status.value = await unwrap(api.get("/api/overview"));
  await loadInsights();
});
watch(preset, loadInsights);
watch(custom, () => { if (preset.value === "custom" && custom.from && custom.to && custom.from <= custom.to) {loadInsights();} });

const num = (n: number) => n.toLocaleString("de-DE");
const short = (date: string) => `${date.slice(8)}.${date.slice(5, 7)}.`;
const duration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  return h ? `${num(h)} h ${minutes % 60} min` : `${minutes} min`;
};

const series = computed<any[]>(() => insights.value?.series ?? []);
const labels = computed(() => series.value.map((d) => short(d.date)));
const col = (key: string) => series.value.map((d) => d[key]);

const today = computed(() => series.value.at(-1));
const yesterday = computed(() => series.value.at(-2));
const rangeText = computed(() => (preset.value === "custom" ? "im Zeitraum" : `in ${preset.value} Tagen`));

const peakHour = computed(() => {
  const hours: number[] = insights.value?.hours ?? [];
  const max = Math.max(...hours, 0);
  return max > 0 ? hours.indexOf(max) : null;
});
const hourLabels = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));

function uptime(ms: number) {
  const m = Math.floor(ms / 60000);
  const d = Math.floor(m / 1440);
  const h = Math.floor((m % 1440) / 60);
  return d ? `${d}d ${h}h` : h ? `${h}h ${m % 60}m` : `${m}m`;
}

const stats = computed<Stat[]>(() => {
  const t = insights.value?.totals;
  const days = insights.value?.days ?? 1;
  return [
    { label: "Mitglieder", value: status.value?.guild ? num(status.value.guild.memberCount) : "–", trend: t ? t.joins - t.leaves : null, hint: rangeText.value },
    { label: "Joins heute", value: today.value?.joins ?? 0, hint: `gestern ${yesterday.value?.joins ?? 0}` },
    { label: "Nachrichten heute", value: num(today.value?.messages ?? 0), hint: t ? `Ø ${num(Math.round(t.messages / days))} / Tag` : "" },
    { label: "Voice heute", value: duration(today.value?.voiceMinutes ?? 0), hint: t ? `Peak ${t.voicePeak} gleichzeitig` : "" },
    { label: "Aktivste Stunde", value: peakHour.value === null ? "–" : `${String(peakHour.value).padStart(2, "0")}:00`, hint: "Berlin" },
    { label: "Bot", value: status.value?.ping != null ? `${status.value.ping} ms` : "–", hint: status.value?.startedAt ? `Uptime ${uptime(Date.now() - status.value.startedAt)}` : "Ping" },
  ];
});
</script>

<template>
  <div class="page">
    <div class="page-head">
      <div>
        <h1>{{ status?.guild?.name ?? "Übersicht" }}</h1>
        <p class="sub">
          <span class="status" :class="status?.online ? 'on' : 'off'">{{ status?.online ? "Bot online" : "Bot offline" }}</span>
          <span v-if="status?.botTag" class="mono muted"> · {{ status.botTag }}</span>
        </p>
      </div>

      <div class="range">
        <div class="seg">
          <button v-for="d in [7, 30, 90]" :key="d" :class="{ active: preset === d }" @click="preset = d">{{ d }} Tage</button>
          <button :class="{ active: preset === 'custom' }" @click="preset = 'custom'">Eigener Zeitraum</button>
        </div>
        <div v-if="preset === 'custom'" class="dates">
          <input v-model="custom.from" type="date" :max="custom.to">
          <span class="muted">bis</span>
          <input v-model="custom.to" type="date" :min="custom.from" :max="todayIso">
        </div>
      </div>
    </div>

    <StatStrip :stats="stats" />

    <div v-if="insights" class="charts">
      <div class="card wide">
        <div class="card-head"><h2>Mitglieder</h2><span class="muted">{{ insights.days }} Tage</span></div>
        <TrendChart :labels="labels" :series="[{ name: 'Mitglieder', color: '#ff7b00', values: col('members') }]" />
      </div>

      <div class="card">
        <div class="card-head">
          <h2>Joins &amp; Leaves</h2>
          <span class="legend"><i style="background:#5fb88a" />{{ insights.totals.joins }} <i style="background:#d4645e" />{{ insights.totals.leaves }}</span>
        </div>
        <TrendChart kind="bars" :labels="labels" :series="[{ name: 'Joins', color: '#5fb88a', values: col('joins') }, { name: 'Leaves', color: '#d4645e', values: col('leaves') }]" />
      </div>

      <div class="card">
        <div class="card-head"><h2>Nachrichten</h2><span class="muted">{{ num(insights.totals.messages) }} gesamt</span></div>
        <TrendChart :labels="labels" :series="[{ name: 'Nachrichten', color: '#7e9bd6', values: col('messages') }]" />
      </div>

      <div class="card">
        <div class="card-head"><h2>Voice</h2><span class="muted">{{ duration(insights.totals.voiceMinutes) }} · {{ num(insights.totals.voiceSessions) }} Sessions</span></div>
        <TrendChart :labels="labels" :format="(n) => duration(n)" :series="[{ name: 'Voice-Zeit', color: '#b08fd8', values: col('voiceMinutes') }]" />
      </div>

      <div class="card">
        <div class="card-head"><h2>Gleichzeitig im Voice</h2><span class="muted">Höchstwert pro Tag</span></div>
        <TrendChart kind="bars" :labels="labels" :series="[{ name: 'Peak', color: '#b08fd8', values: col('voicePeak') }]" />
      </div>

      <div class="card wide">
        <div class="card-head"><h2>Aktivität nach Uhrzeit</h2><span class="muted">Nachrichten im Zeitraum</span></div>
        <TrendChart kind="bars" :height="150" :labels="hourLabels" :series="[{ name: 'Nachrichten', color: '#ff7b00', values: insights.hours }]" />
      </div>
    </div>

    <p v-if="insights?.trackingSince" class="foot muted">Aufzeichnung seit {{ insights.trackingSince.split('-').reverse().join('.') }}.</p>
    <p v-else-if="insights" class="foot muted">Der Bot beginnt mit der Aufzeichnung, sobald er mit dem neuen Stand läuft.</p>
  </div>
</template>

<style scoped>
.range { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.dates { display: flex; align-items: center; gap: 8px; }
.charts { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; margin-top: 14px; }
.wide { grid-column: 1 / -1; }
.legend { display: flex; align-items: center; gap: 6px; color: var(--muted); font-family: var(--mono); font-size: 12px; }
.legend i { width: 8px; height: 8px; border-radius: 1px; display: inline-block; margin-left: 6px; }
.foot { margin-top: 18px; font-size: 12.5px; }
@media (max-width: 860px) { .charts { grid-template-columns: 1fr; } .range { align-items: flex-start; } }
</style>
