<script setup lang="ts">
const props = defineProps<{
  data: {
    label: string
    side: 'source' | 'target'
  }
}>()
</script>

<template>
  <div class="schema-kolom-header">
    <span class="schema-naam">{{ props.data.label }}</span>
    <span class="schema-badge" :class="props.data.side">
      {{ props.data.side === 'source' ? 'SOURCE' : 'DEST' }}
    </span>
  </div>
</template>

<style scoped>
.schema-kolom-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 6px 6px 0 0;
  font-size: 13px;
  font-weight: 700;
  min-width: 200px;
  border-bottom: 2px solid #e2e8f0;
}

.schema-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  letter-spacing: 0.05em;
}

.schema-badge.source {
  background: #dbeafe;
  color: #1d4ed8;
}

.schema-badge.target {
  background: #dcfce7;
  color: #15803d;
}
</style>
