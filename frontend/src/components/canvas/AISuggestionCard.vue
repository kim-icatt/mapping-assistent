<script setup lang="ts">
defineProps<{
  sourceName: string
  targetName: string
  confidenceScore: number
}>()

function badge(score: number) {
  if (score >= 0.8) return { label: 'Hoog', cls: 'bg-green-100 text-green-700' }
  if (score >= 0.5) return { label: 'Middel', cls: 'bg-amber-100 text-amber-700' }
  return { label: 'Laag', cls: 'bg-red-100 text-red-600' }
}
</script>

<template>
  <div
    class="border-l-2 border-[--color-source] bg-white border border-slate-200 rounded px-3 py-2.5 flex items-center gap-2"
    data-testid="suggestion-card"
  >
    <div class="flex-1 min-w-0 flex items-center gap-1.5 text-[13px] font-mono">
      <span class="text-[--color-source] truncate">{{ sourceName }}</span>
      <span class="text-slate-400 shrink-0">→</span>
      <span class="text-[--color-destination] truncate">{{ targetName }}</span>
    </div>
    <span
      :class="['shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded', badge(confidenceScore).cls]"
      data-testid="confidence-badge"
    >
      {{ badge(confidenceScore).label }} · {{ Math.round(confidenceScore * 100) }}%
    </span>
  </div>
</template>
