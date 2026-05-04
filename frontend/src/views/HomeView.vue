<script setup lang="ts">
import { computed, ref } from 'vue'
import MappingCanvas from '@/components/canvas/MappingCanvas.vue'
import MappingOverview from '@/components/canvas/MappingOverview.vue'
import { useSourceSchema } from '@/composables/useSourceSchema'
import { useTargetSchema } from '@/composables/useTargetSchema'

const { fields: sourceFields, schemaName: sourceSchemaName, error: sourceError, loadFromFile: loadSourceFromFile, loadFromUrl: loadSourceFromUrl } = useSourceSchema()
const { fields: targetFields, schemaName: targetSchemaName, error: targetError, loadFromFile: loadTargetFromFile, loadFromUrl: loadTargetFromUrl } = useTargetSchema()

const activeTab = ref<'koppelingen' | 'ai'>('koppelingen')
const bothSchemasLoaded = computed(() => sourceFields.value.length > 0 && targetFields.value.length > 0)

async function onSourceFileSelected(file: File) { await loadSourceFromFile(file) }
async function onSourceUrlEntered(url: string) { await loadSourceFromUrl(url) }
async function onTargetFileSelected(file: File) { await loadTargetFromFile(file) }
async function onTargetUrlEntered(url: string) { await loadTargetFromUrl(url) }
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
    <div class="flex-1 min-w-0 flex flex-col gap-2 min-h-0">
      <div v-if="bothSchemasLoaded" class="flex justify-end">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm"
          data-testid="open-ai-tab"
          @click="activeTab = 'ai'"
        >
          + AI Suggesties
        </button>
      </div>
      <div class="flex-1 min-h-0">
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
    </div>
    <div class="w-80 shrink-0">
      <MappingOverview
        v-model:active-tab="activeTab"
        :source-fields="sourceFields"
        :target-fields="targetFields"
      />
    </div>
  </main>
</template>
