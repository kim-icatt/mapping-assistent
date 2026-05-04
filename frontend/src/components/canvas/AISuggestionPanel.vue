<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaField } from '@/types'
import { useAISuggestions } from '@/composables/useAISuggestions'
import { useMappings } from '@/composables/useMappings'
import AISuggestionCard from './AISuggestionCard.vue'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
}>()

const aiStore = useAISuggestions()
const mappingsStore = useMappings()

const mappedTargetIds = computed(() => new Set(mappingsStore.mappings.map((m) => m.targetFieldId)))

function flattenFields(fields: SchemaField[]): SchemaField[] {
  return fields.flatMap((f) => [f, ...(f.children ? flattenFields(f.children) : [])])
}

// Capped to Zaak context only to control prompt size and cost during PoC
const zaakSourceFields = computed(() =>
  flattenFields(props.sourceFields).filter((f) => f.path.startsWith('Zaak')).slice(0, 5),
)

const unmappedTargetFields = computed(() =>
  props.targetFields.filter((f) => !mappedTargetIds.value.has(f.id)),
)

const zaakUnmappedTargetFields = computed(() =>
  unmappedTargetFields.value.filter((f) => f.path.startsWith('Zaak')).slice(0, 5),
)

const resolvedSuggestions = computed(() => {
  const allSource = flattenFields(props.sourceFields)
  return aiStore.suggestions.map((s) => ({
    id: s.id,
    sourceName: allSource.find((f) => f.id === s.sourceFieldId)?.name ?? s.sourceFieldId,
    targetName: props.targetFields.find((f) => f.id === s.targetFieldId)?.name ?? s.targetFieldId,
    confidenceScore: s.confidenceScore,
  }))
})

async function generate() {
  await aiStore.generateSuggestions(zaakSourceFields.value, zaakUnmappedTargetFields.value)
}
</script>

<template>
  <!-- Loading -->
  <div
    v-if="aiStore.isLoading"
    class="flex-1 flex items-center justify-center py-10"
    data-testid="loading-state"
  >
    <div class="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>

  <!-- Empty: all target fields already mapped -->
  <div
    v-else-if="zaakUnmappedTargetFields.length === 0"
    class="flex-1 flex flex-col items-center justify-center text-center px-6 py-10 text-slate-400 text-sm"
    data-testid="empty-state"
  >
    <p>Geen ongemapte doelvelden.</p>
  </div>

  <!-- Suggestions list -->
  <div v-else-if="aiStore.suggestions.length > 0" class="flex-1 overflow-y-auto flex flex-col gap-2 p-3">
    <AISuggestionCard
      v-for="s in resolvedSuggestions"
      :key="s.id"
      :suggestion-id="s.id"
      :source-name="s.sourceName"
      :target-name="s.targetName"
      :confidence-score="s.confidenceScore"
      @accept="aiStore.acceptSuggestion($event)"
      @reject="aiStore.rejectSuggestion($event)"
    />
  </div>

  <!-- Default: generate button -->
  <div v-else class="flex-1 flex items-center justify-center py-10">
    <button
      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg"
      data-testid="generate-button"
      @click="generate"
    >
      Genereer suggesties
    </button>
  </div>
</template>
