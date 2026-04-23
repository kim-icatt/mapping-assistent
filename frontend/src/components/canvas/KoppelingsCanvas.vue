<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'
import type { SchemaField } from '@/types'
import VeldKnooppunt from './VeldKnooppunt.vue'
import CanvasFitView from './CanvasFitView.vue'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
}>()

const NODE_WIDTH = 200
const NODE_HEIGHT = 72
const PADDING = 20

const containerRef = ref<HTMLDivElement | null>(null)
const containerWidth = ref(0)

const resizeObserver = new ResizeObserver((entries) => {
  if (entries[0]) containerWidth.value = entries[0].contentRect.width
})

onMounted(() => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.clientWidth
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  resizeObserver.disconnect()
})

const targetX = computed(() => Math.max(containerWidth.value - NODE_WIDTH - PADDING, 400))

const nodes = computed<Node[]>(() => [
  ...props.sourceFields.map((field, i) => ({
    id: `src-${field.id}`,
    type: 'veldKnooppunt',
    position: { x: PADDING, y: i * NODE_HEIGHT },
    data: { name: field.name, dataType: field.dataType, required: field.required, side: 'source' },
  })),
  ...props.targetFields.map((field, i) => ({
    id: `tgt-${field.id}`,
    type: 'veldKnooppunt',
    position: { x: targetX.value, y: i * NODE_HEIGHT },
    data: { name: field.name, dataType: field.dataType, required: field.required, side: 'target' },
  })),
])

const isEmpty = computed(() => props.sourceFields.length === 0 && props.targetFields.length === 0)

defineExpose({ nodes })
</script>

<template>
  <div ref="containerRef" class="koppelingscanvas">
    <div v-if="isEmpty" class="empty-state" data-testid="empty-state">
      <p>Laad een bron- en doelschema om te beginnen met koppelen.</p>
    </div>

    <VueFlow
      v-else
      :nodes="nodes"
      :edges="[]"
      fit-view-on-init
      :nodes-draggable="false"
      :pan-on-drag="false"
      :zoom-on-scroll="false"
      :zoom-on-pinch="false"
      :pan-on-scroll="false"
    >
      <template #node-veldKnooppunt="nodeProps">
        <VeldKnooppunt :data="nodeProps.data" />
      </template>
      <CanvasFitView :trigger="containerWidth" />
    </VueFlow>
  </div>
</template>

<style scoped>
.koppelingscanvas {
  width: 100%;
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 14px;
}
</style>
