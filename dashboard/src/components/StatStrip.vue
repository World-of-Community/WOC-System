<script setup lang="ts">
export type Stat = { label: string; value: string | number; hint?: string; trend?: number | null };
defineProps<{ stats: Stat[] }>();
</script>

<template>
  <div class="strip">
    <div v-for="s in stats" :key="s.label" class="cell">
      <div class="eyebrow">{{ s.label }}</div>
      <div class="value">{{ s.value }}</div>
      <div class="foot">
        <span v-if="s.trend !== undefined && s.trend !== null" class="trend" :class="s.trend >= 0 ? 'up' : 'down'">{{ s.trend >= 0 ? "+" : "−" }}{{ Math.abs(s.trend) }}</span>
        <span class="hint">{{ s.hint }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.strip { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); overflow-x: auto; }
.cell { padding: 14px 18px; border-left: 1px solid var(--line); min-width: 140px; }
.cell:first-child { border-left: 0; }
.value { font-size: 26px; font-weight: 500; letter-spacing: -0.02em; margin: 4px 0 1px; font-variant-numeric: tabular-nums; }
.foot { display: flex; gap: 7px; font-size: 12px; min-height: 18px; }
.hint { color: var(--faint); }
.trend { font-family: var(--mono); font-size: 11.5px; }
.trend.up { color: var(--good); }
.trend.down { color: var(--bad); }
</style>
