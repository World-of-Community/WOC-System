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
.strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
.cell { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); padding: 14px 16px; min-width: 0; }
.eyebrow { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.value { font-size: 26px; font-weight: 500; letter-spacing: -0.02em; margin: 4px 0 1px; font-variant-numeric: tabular-nums; white-space: nowrap; }
.foot { display: flex; gap: 7px; font-size: 12px; min-height: 18px; }
.hint { color: var(--faint); }
.trend { font-family: var(--mono); font-size: 11.5px; }
.trend.up { color: var(--good); }
.trend.down { color: var(--bad); }
</style>
