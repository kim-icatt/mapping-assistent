<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

const props = defineProps<{
  data: {
    name: string
    dataType: string
    required: boolean
    side?: 'source' | 'target'
  }
}>()
</script>

<template>
  <div
    class="veld-knooppunt"
    :aria-label="`${props.data.name}, ${props.data.dataType}${props.data.required ? ', verplicht' : ''}`"
  >
    <Handle v-if="props.data.side !== 'target'" type="source" :position="Position.Right" />
    <Handle v-if="props.data.side !== 'source'" type="target" :position="Position.Left" />

    <span class="veld-naam">{{ props.data.name }}</span>
    <span class="datatype-chip" :data-type="props.data.dataType">{{ props.data.dataType }}</span>
    <span v-if="props.data.required" class="req-badge" data-testid="req-badge">REQ</span>
  </div>
</template>

<style scoped>
.veld-knooppunt {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  min-width: 180px;
}

.veld-naam {
  font-weight: 600;
  flex: 1;
}

.datatype-chip {
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 3px;
  background: #e2e8f0;
  color: #475569;
}

.datatype-chip[data-type='string'] { background: #dbeafe; color: #1d4ed8; }
.datatype-chip[data-type='number'] { background: #ffedd5; color: #c2410c; }
.datatype-chip[data-type='date']   { background: #ccfbf1; color: #0f766e; }
.datatype-chip[data-type='object'] { background: #f3e8ff; color: #7e22ce; }
.datatype-chip[data-type='array']  { background: #dcfce7; color: #15803d; }
.datatype-chip[data-type='enum']   { background: #fef9c3; color: #a16207; }
.datatype-chip[data-type='boolean']{ background: #fee2e2; color: #b91c1c; }

.req-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 4px;
  border-radius: 3px;
  background: #fee2e2;
  color: #b91c1c;
}
</style>
