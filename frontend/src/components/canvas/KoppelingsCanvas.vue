<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaField } from '@/types'
import VeldKnooppunt from './VeldKnooppunt.vue'
import SchemaKolomHeader from './SchemaKolomHeader.vue'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
  sourceLabel?: string
  targetLabel?: string
}>()

const isEmpty = computed(() => props.sourceFields.length === 0 && props.targetFields.length === 0)
</script>

<template>
  <div class="w-full h-full flex flex-col bg-slate-100">
    <!-- Empty state -->
    <div
      v-if="isEmpty"
      class="flex items-center justify-center h-full text-slate-400 text-sm"
      data-testid="empty-state"
    >
      <p>Laad een bron- en doelschema om te beginnen met koppelen.</p>
    </div>

    <!-- Two-panel layout -->
    <div v-else class="flex-1 flex overflow-hidden gap-px">
      <!-- Source column -->
      <div
        class="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-sm"
        data-testid="source-kolom"
      >
        <SchemaKolomHeader v-if="sourceLabel" :data="{ label: sourceLabel, side: 'source' }" />
        <div class="flex-1 overflow-y-auto">
          <VeldKnooppunt
            v-for="field in sourceFields"
            :key="field.id"
            :data="{ name: field.name, dataType: field.dataType, required: field.required, side: 'source' }"
          />
        </div>
      </div>

      <!-- Target column -->
      <div
        class="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-sm"
        data-testid="target-kolom"
      >
        <SchemaKolomHeader v-if="targetLabel" :data="{ label: targetLabel, side: 'target' }" />
        <div class="flex-1 overflow-y-auto">
          <VeldKnooppunt
            v-for="field in targetFields"
            :key="field.id"
            :data="{ name: field.name, dataType: field.dataType, required: field.required, side: 'target' }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
