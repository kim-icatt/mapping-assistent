<script setup lang="ts">
import { computed } from 'vue'
import { VueFlow } from '@vue-flow/core'
import type { Node } from '@vue-flow/core'
import type { SchemaField } from '@/types'
import VeldKnooppunt from './VeldKnooppunt.vue'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
}>()

const TARGET_X = 600
const NODE_HEIGHT = 72

const nodes = computed<Node[]>(() => [
  ...props.sourceFields.map((field, i) => ({
    id: `src-${field.id}`,
    type: 'veldKnooppunt',
    position: { x: 0, y: i * NODE_HEIGHT },
    data: { name: field.name, dataType: field.dataType, required: field.required, side: 'source' },
  })),
  ...props.targetFields.map((field, i) => ({
    id: `tgt-${field.id}`,
    type: 'veldKnooppunt',
    position: { x: TARGET_X, y: i * NODE_HEIGHT },
    data: { name: field.name, dataType: field.dataType, required: field.required, side: 'target' },
  })),
])

const isEmpty = computed(() => props.sourceFields.length === 0 && props.targetFields.length === 0)

defineExpose({ nodes })
</script>

<template>
  <div class="koppelingscanvas">
    <div v-if="isEmpty" class="empty-state" data-testid="empty-state">
      <p>Laad een bron- en doelschema om te beginnen met koppelen.</p>
    </div>

    <VueFlow v-else :nodes="nodes" :edges="[]" fit-view-on-init :nodes-draggable="false">
      <template #node-veldKnooppunt="nodeProps">
        <VeldKnooppunt :data="nodeProps.data" />
      </template>
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
