<script setup lang="ts">
import MappingCanvas from '@/components/canvas/MappingCanvas.vue'
import MappingOverview from '@/components/canvas/MappingOverview.vue'
import { useSourceSchema } from '@/composables/useSourceSchema'
import { useTargetSchema } from '@/composables/useTargetSchema'
import { useAISuggestions } from '@/composables/useAISuggestions'

const { fields: sourceFields, schemaName: sourceSchemaName, error: sourceError, loadFromFile: loadSourceFromFile, loadFromUrl: loadSourceFromUrl } = useSourceSchema()
const { fields: targetFields, schemaName: targetSchemaName, error: targetError, loadFromFile: loadTargetFromFile, loadFromUrl: loadTargetFromUrl } = useTargetSchema()
const aiStore = useAISuggestions()

async function onSourceFileSelected(file: File) { await loadSourceFromFile(file) }
async function onSourceUrlEntered(url: string) { await loadSourceFromUrl(url) }
async function onTargetFileSelected(file: File) { await loadTargetFromFile(file) }
async function onTargetUrlEntered(url: string) { await loadTargetFromUrl(url) }

async function testAI() {
  const flat = (fields: typeof sourceFields.value): typeof sourceFields.value =>
    fields.flatMap((f) => [f, ...(f.children ? flat(f.children) : [])])
  const zaakSource = flat(sourceFields.value).filter((f) => f.path.startsWith('Zaak')).slice(0, 10)
  const zaakTarget = flat(targetFields.value).filter((f) => f.path.startsWith('Zaak')).slice(0, 10)
  const result = await aiStore.generateSuggestions(zaakSource, zaakTarget)
  alert(`Got ${result.length} suggestions — check the browser console for details.`)
}
</script>

<template>
  <main class="flex h-full gap-4 p-4 bg-slate-100 overflow-hidden">
    <div
      v-if="sourceError || targetError"
      class="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg shadow"
      data-testid="schema-error"
    >
      {{ sourceError || targetError }}
    </div>
    <div class="flex-1 min-w-0">
      <MappingCanvas
        :source-fields="sourceFields"
        :target-fields="targetFields"
        :source-label="sourceSchemaName || 'Bronschema'"
        :target-label="targetSchemaName || 'Doelschema'"
        @source-file-selected="onSourceFileSelected"
        @source-url-entered="onSourceUrlEntered"
        @target-file-selected="onTargetFileSelected"
        @target-url-entered="onTargetUrlEntered"
      />
    </div>
    <!-- TEMP: AI test button — remove after Task 2 -->
    <div class="absolute bottom-4 right-4 z-50">
      <button
        class="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow"
        :disabled="aiStore.isLoading"
        @click="testAI"
      >
        {{ aiStore.isLoading ? 'Fetching…' : 'Test AI' }}
      </button>
    </div>
    <div class="w-80 shrink-0">
      <MappingOverview
        :source-fields="sourceFields"
        :target-fields="targetFields"
      />
    </div>
  </main>
</template>
