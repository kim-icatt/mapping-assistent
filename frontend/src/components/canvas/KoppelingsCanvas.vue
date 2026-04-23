<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'
import type { SchemaField } from '@/types'
import VeldKnooppunt from './VeldKnooppunt.vue'
import SchemaKolomHeader from './SchemaKolomHeader.vue'
import CanvasFitView from './CanvasFitView.vue'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
  sourceLabel?: string
  targetLabel?: string
}>()

const NODE_WIDTH = 200
const NODE_HEIGHT = 50
const HEADER_HEIGHT = 52
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

const nodes = computed<Node[]>(() => {
  const result: Node[] = []

  if (props.sourceLabel) {
    result.push({
      id: 'header-src',
      type: 'schemaKolomHeader',
      position: { x: PADDING, y: 0 },
      data: { label: props.sourceLabel, side: 'source' },
      connectable: false,
      selectable: false,
    })
  }

  if (props.targetLabel) {
    result.push({
      id: 'header-tgt',
      type: 'schemaKolomHeader',
      position: { x: targetX.value, y: 0 },
      data: { label: props.targetLabel, side: 'target' },
      connectable: false,
      selectable: false,
    })
  }

  const fieldOffsetY = props.sourceLabel || props.targetLabel ? HEADER_HEIGHT : 0

  props.sourceFields.forEach((field, i) => {
    result.push({
      id: `src-${field.id}`,
      type: 'veldKnooppunt',
      position: { x: PADDING, y: fieldOffsetY + i * NODE_HEIGHT },
      data: { name: field.name, dataType: field.dataType, required: field.required, side: 'source' },
    })
  })

  props.targetFields.forEach((field, i) => {
    result.push({
      id: `tgt-${field.id}`,
      type: 'veldKnooppunt',
      position: { x: targetX.value, y: fieldOffsetY + i * NODE_HEIGHT },
      data: { name: field.name, dataType: field.dataType, required: field.required, side: 'target' },
    })
  })

  return result
})

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
      :zoom-on-double-click="false"
      :pan-on-scroll="false"
    >
      <template #node-veldKnooppunt="nodeProps">
        <VeldKnooppunt :data="nodeProps.data" />
      </template>
      <template #node-schemaKolomHeader="nodeProps">
        <SchemaKolomHeader :data="nodeProps.data" />
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
