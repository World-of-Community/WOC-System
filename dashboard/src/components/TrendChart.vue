<script setup lang="ts">
import { computed, ref } from "vue";

// Line/area chart or grouped bars over labelled points, drawn as plain SVG.
type Series = { name: string; color: string; values: (number | null)[] };

const props = defineProps<{
  labels: string[];
  series: Series[];
  kind?: "area" | "bars";
  height?: number;
  format?: (n: number) => string;
}>();

const W = 640;
const H = computed(() => props.height ?? 200);
const PAD = { top: 12, right: 8, bottom: 22, left: 40 };
const fmt = (n: number) => (props.format ? props.format(n) : n.toLocaleString("de-DE"));

const all = computed(() => props.series.flatMap((s) => s.values).filter((v): v is number => v !== null));
const hasData = computed(() => all.value.some((v) => v > 0));

const range = computed(() => {
  const max = Math.max(...all.value, 1);
  const min = props.kind === "bars" ? 0 : Math.min(...all.value, max);
  const span = max - min || 1;
  // area charts zoom to the data so small member changes stay visible
  const lo = props.kind === "bars" ? 0 : Math.max(0, min - span * 0.25);
  const hi = max + span * 0.1;
  return { lo, hi };
});

const innerW = W - PAD.left - PAD.right;
const innerH = computed(() => H.value - PAD.top - PAD.bottom);
const x = (i: number) => PAD.left + (props.labels.length <= 1 ? innerW / 2 : (i / (props.labels.length - 1)) * innerW);
const y = (v: number) => PAD.top + innerH.value - ((v - range.value.lo) / (range.value.hi - range.value.lo || 1)) * innerH.value;

const ticks = computed(() => {
  const { lo, hi } = range.value;
  return [0, 1, 2, 3].map((i) => lo + ((hi - lo) * i) / 3);
});

function path(values: (number | null)[]) {
  let d = "";
  values.forEach((v, i) => {
    if (v === null) {return;}
    d += `${d ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`;
  });
  return d;
}
const area = (values: (number | null)[]) => {
  const pts = values.map((v, i) => (v === null ? null : [x(i), y(v)])).filter(Boolean) as number[][];
  if (pts.length < 2) {return "";}
  return `${path(values)}L${pts.at(-1)![0].toFixed(1)},${PAD.top + innerH.value}L${pts[0][0].toFixed(1)},${PAD.top + innerH.value}Z`;
};

const slot = computed(() => innerW / Math.max(props.labels.length, 1));
const barW = computed(() => Math.max(2, Math.min(18, (slot.value * 0.7) / props.series.length)));

const hover = ref<number | null>(null);
function onMove(e: MouseEvent) {
  const box = (e.currentTarget as SVGElement).getBoundingClientRect();
  const px = ((e.clientX - box.left) / box.width) * W;
  const i = props.kind === "bars"
    ? Math.floor((px - PAD.left) / slot.value)
    : Math.round(((px - PAD.left) / innerW) * (props.labels.length - 1));
  hover.value = Math.min(Math.max(i, 0), props.labels.length - 1);
}

const labelEvery = computed(() => Math.ceil(props.labels.length / 7));
const uid = Math.random().toString(36).slice(2, 8);
</script>

<template>
  <div class="chart">
    <svg :viewBox="`0 0 ${W} ${H}`" preserveAspectRatio="none" :style="{ height: `${H}px` }" @mousemove="onMove" @mouseleave="hover = null">
      <defs>
        <linearGradient v-for="(s, i) in series" :id="`g${uid}${i}`" :key="s.name" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="s.color" stop-opacity="0.16" />
          <stop offset="1" :stop-color="s.color" stop-opacity="0" />
        </linearGradient>
      </defs>

      <g v-for="tick in ticks" :key="tick">
        <line :x1="PAD.left" :x2="W - PAD.right" :y1="y(tick)" :y2="y(tick)" class="grid" />
        <text :x="PAD.left - 8" :y="y(tick) + 4" class="axis" text-anchor="end">{{ fmt(Math.round(tick)) }}</text>
      </g>

      <template v-if="kind === 'bars'">
        <g v-for="(s, si) in series" :key="s.name">
          <rect
            v-for="(v, i) in s.values" :key="i"
            :x="PAD.left + i * slot + (slot - barW * series.length) / 2 + si * barW"
            :y="y(v ?? 0)" :width="barW - 1" :height="Math.max(0, PAD.top + innerH - y(v ?? 0))"
            rx="1" :fill="s.color" :opacity="hover === null || hover === i ? 1 : 0.45"
          />
        </g>
      </template>
      <template v-else>
        <g v-for="(s, i) in series" :key="s.name">
          <path :d="area(s.values)" :fill="`url(#g${uid}${i})`" />
          <path :d="path(s.values)" fill="none" :stroke="s.color" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" />
        </g>
        <g v-if="hover !== null">
          <line :x1="x(hover)" :x2="x(hover)" :y1="PAD.top" :y2="PAD.top + innerH" class="cursor" />
          <template v-for="s in series" :key="s.name">
            <circle v-if="s.values[hover] !== null" :cx="x(hover)" :cy="y(s.values[hover]!)" r="3.5" :fill="s.color" stroke="var(--surface)" stroke-width="2" />
          </template>
        </g>
      </template>

      <template v-for="(l, i) in labels" :key="i">
        <text v-if="i % labelEvery === 0" :x="kind === 'bars' ? PAD.left + i * slot + slot / 2 : x(i)" :y="H - 6" class="axis" text-anchor="middle">{{ l }}</text>
      </template>
    </svg>

    <div v-if="hover !== null" class="tip" :class="{ left: hover > labels.length / 2 }">
      <div class="tip-title">{{ labels[hover] }}</div>
      <div v-for="s in series" :key="s.name" class="tip-row">
        <i :style="{ background: s.color }" /> {{ s.name }} <b>{{ s.values[hover] === null ? "–" : fmt(s.values[hover]!) }}</b>
      </div>
    </div>

    <div v-if="!hasData" class="nodata">Noch keine Daten – sie werden ab jetzt vom Bot gesammelt.</div>
  </div>
</template>

<style scoped>
.chart { position: relative; }
svg { width: 100%; display: block; overflow: visible; }
.grid { stroke: var(--line); stroke-dasharray: 3 4; }
.axis { fill: var(--faint); font-size: 10.5px; font-family: var(--font); }
.cursor { stroke: var(--line-strong); }
.tip {
  position: absolute; top: 0; right: 0; pointer-events: none;
  background: var(--raised); border: 1px solid var(--line-strong); border-radius: 6px;
  padding: 7px 11px; font-size: 12.5px;
}
.tip.left { right: auto; left: 44px; }
.tip-title { color: var(--muted); margin-bottom: 4px; }
.tip-row { display: flex; align-items: center; gap: 7px; }
.tip-row b { margin-left: auto; padding-left: 14px; font-variant-numeric: tabular-nums; }
.tip-row i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
.nodata {
  position: absolute; inset: 0; display: grid; place-items: center; text-align: center; padding: 0 20px;
  color: var(--muted); background: rgba(20, 21, 25, 0.82); font-size: 13px;
}
</style>
