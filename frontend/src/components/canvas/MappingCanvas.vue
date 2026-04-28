<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SchemaField } from '@/types'
import FieldNode from './FieldNode.vue'
import SchemaColumnHeader from './SchemaColumnHeader.vue'
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
  FieldMappingRemoved: [payload: { sourceFieldId: string; targetFieldId: string }]
}>()

const mappingsStore = useMappings()
const selectedSourceId = ref<string | null>(null)
const pendingDeleteId = ref<string | null>(null)

const isEmpty = computed(() => props.sourceFields.length === 0 && props.targetFields.length === 0)

const pendingDeleteMapping = computed(() =>
  pendingDeleteId.value ? mappingsStore.mappings.find((m) => m.id === pendingDeleteId.value) ?? null : null,
)

function fieldName(id: string): string {
  return (
    props.sourceFields.find((f) => f.id === id)?.name ??
    props.targetFields.find((f) => f.id === id)?.name ??
    id
  )
}

function onSourceFieldClick(fieldId: string) {
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

function onDeleteRequested(mappingId: string) {
  pendingDeleteId.value = mappingId
}

function confirmDelete() {
  if (!pendingDeleteMapping.value) return
  const { sourceFieldId, targetFieldId } = pendingDeleteMapping.value
  mappingsStore.removeMapping(pendingDeleteMapping.value.id)
  emit('FieldMappingRemoved', { sourceFieldId, targetFieldId })
  pendingDeleteId.value = null
}

function cancelDelete() {
  pendingDeleteId.value = null
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
    <div v-else class="relative flex-1 flex overflow-hidden gap-8">
      <!-- Source column -->
      <div
        class="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-sm"
        data-testid="source-column"
      >
        <SchemaColumnHeader v-if="sourceLabel" :data="{ label: sourceLabel, side: 'source' }" />
        <div class="flex-1 overflow-y-auto" data-scroll-container>
          <FieldNode
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
        data-testid="target-column"
      >
        <SchemaColumnHeader v-if="targetLabel" :data="{ label: targetLabel, side: 'target' }" />
        <div class="flex-1 overflow-y-auto" data-scroll-container>
          <FieldNode
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
      <ConnectionLines @delete-requested="onDeleteRequested" />

      <!-- Delete confirmation overlay -->
      <div
        v-if="pendingDeleteMapping"
        class="absolute inset-0 flex items-center justify-center bg-black/20 z-10"
        data-testid="delete-confirmation"
      >
        <div class="bg-white rounded-lg shadow-lg px-6 py-5 max-w-sm w-full mx-4">
          <p class="text-sm text-slate-700 mb-4">
            Verwijder koppeling van
            <span class="font-mono font-semibold text-slate-900">{{ fieldName(pendingDeleteMapping.sourceFieldId) }}</span>
            naar
            <span class="font-mono font-semibold text-slate-900">{{ fieldName(pendingDeleteMapping.targetFieldId) }}</span>?
          </p>
          <div class="flex justify-end gap-2">
            <button
              class="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded"
              @click="cancelDelete"
            >Annuleren</button>
            <button
              class="px-3 py-1.5 text-sm text-white bg-red-500 hover:bg-red-600 rounded"
              data-testid="confirm-delete"
              @click="confirmDelete"
            >Verwijderen</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
