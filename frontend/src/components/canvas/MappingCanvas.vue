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
  SourceFileSelected: [file: File]
  SourceUrlEntered: [url: string]
}>()

const mappingsStore = useMappings()
const selectedSourceId = ref<string | null>(null)
const pendingDeleteId = ref<string | null>(null)

const sourceCounter = computed(() => {
  const mappedIds = new Set(mappingsStore.mappings.map((m) => m.sourceFieldId))
  return { mapped: mappedIds.size, total: props.sourceFields.length }
})

const targetCounter = computed(() => {
  const mappedTargetIds = new Set(mappingsStore.mappings.map((m) => m.targetFieldId))
  return {
    mapped: props.targetFields.filter((f) => mappedTargetIds.has(f.id)).length,
    total: props.targetFields.length,
  }
})

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

function onSourceFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) emit('SourceFileSelected', file)
}

const sourceUrlInput = ref('https://cors.redoc.ly/https://esuite-data-extractie-gcp2.esuite-development.net/q/openapi')

function onSourceUrlSubmit() {
  const url = sourceUrlInput.value.trim()
  if (url) emit('SourceUrlEntered', url)
}
</script>

<template>
  <div class="w-full h-full flex flex-col bg-slate-100">
    <!-- Two-panel layout -->
    <div class="relative flex-1 flex overflow-hidden gap-8">
      <!-- Source column -->
      <div
        class="flex-1 flex flex-col overflow-hidden bg-white border border-slate-200 rounded-sm"
        data-testid="source-column"
      >
        <SchemaColumnHeader v-if="sourceLabel" :data="{ label: sourceLabel, side: 'source' }" :counter="sourceCounter" />

        <!-- Upload UI when no source schema loaded -->
        <div
          v-if="sourceFields.length === 0"
          class="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center"
          data-testid="source-upload"
        >
          <p class="text-sm text-slate-400">Laad een bronschema (OpenAPI YAML of JSON)</p>

          <!-- File picker -->
          <label class="cursor-pointer px-3 py-1.5 text-sm rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
            Bestand kiezen
            <input
              type="file"
              accept=".yaml,.yml,.json"
              class="sr-only"
              data-testid="source-file-input"
              @change="onSourceFileChange"
            />
          </label>

          <span class="text-xs text-slate-300">of</span>

          <!-- URL input -->
          <form class="flex gap-2 w-full max-w-xs" @submit.prevent="onSourceUrlSubmit">
            <input
              v-model="sourceUrlInput"
              type="url"
              placeholder="https://api.example.com/openapi.json"
              class="flex-1 min-w-0 text-xs border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-blue-400"
              data-testid="source-url-input"
            />
            <button
              type="submit"
              class="shrink-0 px-2 py-1.5 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
              data-testid="source-url-submit"
            >
              Laden
            </button>
          </form>
        </div>

        <!-- Field nodes -->
        <div v-else class="flex-1 overflow-y-auto" data-scroll-container>
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
        <SchemaColumnHeader v-if="targetLabel" :data="{ label: targetLabel, side: 'target' }" :counter="targetCounter" />
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

