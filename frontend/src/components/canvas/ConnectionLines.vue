<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMappings } from '@/composables/useMappings'
import { storeToRefs } from 'pinia'

const mappingsStore = useMappings()
const { mappings } = storeToRefs(mappingsStore)

interface LineCoords {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
}

const lines = ref<LineCoords[]>([])
const svgRef = ref<SVGSVGElement | null>(null)

function getFieldMidY(fieldId: string, side: 'source' | 'target'): { x: number; y: number } | null {
  const el = document.querySelector<HTMLElement>(
    `[data-field-id="${fieldId}"][data-field-side="${side}"]`,
  )
  if (!el || !svgRef.value) return null

  const rect = el.getBoundingClientRect()
  const svgRect = svgRef.value.getBoundingClientRect()

  return {
    x: rect.left - svgRect.left + (side === 'source' ? rect.width : 0),
    y: rect.top - svgRect.top + rect.height / 2,
  }
}

function recalculate() {
  const result: LineCoords[] = []
  for (const mapping of mappings.value) {
    const start = getFieldMidY(mapping.sourceFieldId, 'source')
    const end = getFieldMidY(mapping.targetFieldId, 'target')
    if (start && end) {
      result.push({ id: mapping.id, x1: start.x, y1: start.y, x2: end.x, y2: end.y })
    }
  }
  lines.value = result
}

watch(mappings, () => nextTick(recalculate), { deep: true })

const scrollListeners: { el: Element; fn: () => void }[] = []

function attachScrollListeners() {
  const containers = document.querySelectorAll('[data-scroll-container]')
  containers.forEach((el) => {
    const fn = () => recalculate()
    el.addEventListener('scroll', fn)
    scrollListeners.push({ el, fn })
  })
}

function detachScrollListeners() {
  scrollListeners.forEach(({ el, fn }) => el.removeEventListener('scroll', fn))
  scrollListeners.length = 0
}

onMounted(() => {
  recalculate()
  attachScrollListeners()
  window.addEventListener('resize', recalculate)
})

onUnmounted(() => {
  detachScrollListeners()
  window.removeEventListener('resize', recalculate)
})
</script>

<template>
  <svg
    ref="svgRef"
    class="absolute inset-0 w-full h-full pointer-events-none"
    aria-hidden="true"
    data-testid="connection-lines-svg"
  >
    <g v-for="line in lines" :key="line.id">
      <path
        :d="`M ${line.x1} ${line.y1} C ${line.x1 + (line.x2 - line.x1) * 0.4} ${line.y1}, ${line.x2 - (line.x2 - line.x1) * 0.4} ${line.y2}, ${line.x2} ${line.y2}`"
        fill="none"
        stroke="#6366f1"
        stroke-width="2"
        stroke-opacity="0.7"
        data-testid="connection-path"
      />
      <circle :cx="line.x1" :cy="line.y1" r="4" fill="#6366f1" fill-opacity="0.7" />
      <circle :cx="line.x2" :cy="line.y2" r="4" fill="#6366f1" fill-opacity="0.7" />
    </g>
  </svg>
</template>
