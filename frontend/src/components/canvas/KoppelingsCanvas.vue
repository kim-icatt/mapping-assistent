<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SchemaField } from '@/types'
import VeldKnooppunt from './VeldKnooppunt.vue'
import SchemaKolomHeader from './SchemaKolomHeader.vue'
import ConnectionLines from './ConnectionLines.vue'
import { useMappings } from '@/composables/useMappings'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
  sourceLabel?: string
  targetLabel?: string
}>()

const emit = defineEmits<{
  FieldMappingCreated: [payload: { sourceFieldId: string; targetFieldId: string }]
}>()

const mappingsStore = useMappings()
const selectedSourceId = ref<string | null>(null)
const warningSourceId = ref<string | null>(null)
let warningTimer: ReturnType<typeof setTimeout> | null = null

const isEmpty = computed(() => props.sourceFields.length === 0 && props.targetFields.length === 0)

function onSourceFieldClick(fieldId: string) {
  if (mappingsStore.hasMapping(fieldId)) {
    warningSourceId.value = fieldId
    selectedSourceId.value = null
    if (warningTimer) clearTimeout(warningTimer)
    warningTimer = setTimeout(() => {
      warningSourceId.value = null
    }, 3000)
    return
  }
  warningSourceId.value = null
  selectedSourceId.value = selectedSourceId.value === fieldId ? null : fieldId
}

function onTargetFieldClick(fieldId: string) {
  if (!selectedSourceId.value) return

  const mapping = mappingsStore.createMapping({
    sourceFieldId: selectedSourceId.value,
    targetFieldId: fieldId,
  })

  if (mapping) {
    emit('FieldMappingCreated', {
      sourceFieldId: mapping.sourceFieldId,
      targetFieldId: mapping.targetFieldId,
    })
  }

  selectedSourceId.value = null
}
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
    <div v-else class="relative flex-1 flex overflow-hidden gap-px">
      <!-- Source column -->
      <div
        class="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-sm"
        data-testid="source-kolom"
      >
        <SchemaKolomHeader v-if="sourceLabel" :data="{ label: sourceLabel, side: 'source' }" />
        <div class="flex-1 overflow-y-auto" data-scroll-container>
          <VeldKnooppunt
            v-for="field in sourceFields"
            :key="field.id"
            :data="{ name: field.name, dataType: field.dataType, required: field.required }"
            :fieldId="field.id"
            side="source"
            :selected="selectedSourceId === field.id"
            @field-click="onSourceFieldClick"
          />
        </div>
      </div>

      <!-- Target column -->
      <div
        class="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-sm"
        data-testid="target-kolom"
      >
        <SchemaKolomHeader v-if="targetLabel" :data="{ label: targetLabel, side: 'target' }" />
        <div class="flex-1 overflow-y-auto" data-scroll-container>
          <VeldKnooppunt
            v-for="field in targetFields"
            :key="field.id"
            :data="{ name: field.name, dataType: field.dataType, required: field.required }"
            :fieldId="field.id"
            side="target"
            @field-click="onTargetFieldClick"
          />
        </div>
      </div>

      <!-- SVG connection line overlay -->
      <ConnectionLines />
    </div>

    <!-- Already-mapped warning -->
    <div
      v-if="warningSourceId"
      data-testid="mapping-warning"
      role="alert"
      class="mx-3 mb-2 px-3 py-1 text-xs rounded bg-amber-50 text-amber-700"
    >
      Dit bronveld is al gekoppeld. Verwijder de bestaande koppeling om opnieuw te koppelen.
    </div>
  </div>
</template>
