<script setup lang="ts">
defineProps<{ name: string }>();

// 24x24 stroke icons; unknown names fall back to a dot
const PATHS: Record<string, string> = {
  overview: "M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z",
  settings: "M12 15a3 3 0 100-6 3 3 0 000 6zm7.4-3a7.4 7.4 0 00-.1-1.2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 00-2-1.2L14.5 3h-4l-.4 2.6a7.6 7.6 0 00-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 000 2.4l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 002 1.2l.4 2.6h4l.4-2.6a7.6 7.6 0 002-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z",
  emojiquiz: "M12 21a9 9 0 100-18 9 9 0 000 18zm-3-10h.01M15 11h.01M8.5 14.5a4.5 4.5 0 007 0",
  commands: "M8 9l-4 3 4 3m8-6l4 3-4 3M14 6l-4 12",
  logout: "M15 17l5-5-5-5M20 12H9m4 8H5a1 1 0 01-1-1V5a1 1 0 011-1h8",
  members: "M16 19v-1a4 4 0 00-4-4H7a4 4 0 00-4 4v1m13-9a3 3 0 100-6M21 19v-1a4 4 0 00-3-3.9M9.5 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  pulse: "M3 12h4l3-8 4 16 3-8h4",
  clock: "M12 21a9 9 0 100-18 9 9 0 000 18zm0-14v5l3 2",
  chat: "M21 12a8 8 0 01-11.5 7.2L4 20l1-4.6A8 8 0 1121 12z",
};
</script>

<template>
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path :d="PATHS[name] ?? 'M12 12h.01'" />
  </svg>
</template>
