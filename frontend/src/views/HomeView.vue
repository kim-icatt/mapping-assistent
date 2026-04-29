<script setup lang="ts">
import MappingCanvas from '@/components/canvas/MappingCanvas.vue'
import MappingOverview from '@/components/canvas/MappingOverview.vue'
import { useSourceSchema } from '@/composables/useSourceSchema'

import type { SchemaField } from '@/types'
import { ref } from 'vue'

const { fields: sourceFields, schemaName: sourceSchemaName, error: sourceError, loadFromFile, loadFromUrl } = useSourceSchema()

const targetFields = ref<SchemaField[]>([])

async function onSourceFileSelected(file: File) {
  await loadFromFile(file)
}

async function onSourceUrlEntered(url: string) {
  await loadFromUrl(url)
}
</script>

<template>
  <main class="flex h-full gap-4 p-4 bg-slate-100 overflow-hidden">
    <div v-if="sourceError" class="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg shadow" data-testid="source-error">
      {{ sourceError }}
    </div>
    <div class="flex-1 min-w-0">
      <MappingCanvas
        :source-fields="sourceFields"
        :target-fields="targetFields"
        :source-label="sourceSchemaName || 'Bronschema'"
        target-label="Doelschema"
        @source-file-selected="onSourceFileSelected"
        @source-url-entered="onSourceUrlEntered"
      />
    </div>
    <div class="w-80 shrink-0">
      <MappingOverview
        :source-fields="sourceFields"
        :target-fields="targetFields"
      />

    </div>
  </main>
</template>
