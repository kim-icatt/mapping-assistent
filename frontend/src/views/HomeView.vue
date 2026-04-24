<script setup lang="ts">
import KoppelingsCanvas from '@/components/canvas/KoppelingsCanvas.vue'
import type { SchemaField } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'zaakId', path: 'zaakId', dataType: 'string', required: true },
  { id: 'src-2', name: 'omschrijving', path: 'omschrijving', dataType: 'string', required: false },
  { id: 'src-3', name: 'startDatum', path: 'startDatum', dataType: 'date', required: true },
  { id: 'src-4', name: 'statusCode', path: 'statusCode', dataType: 'string', required: true },
  { id: 'src-5', name: 'prioriteit', path: 'prioriteit', dataType: 'number', required: false },
]

const targetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'uuid', path: 'uuid', dataType: 'string', required: true },
  { id: 'tgt-2', name: 'omschrijving', path: 'omschrijving', dataType: 'string', required: false },
  { id: 'tgt-3', name: 'startdatum', path: 'startdatum', dataType: 'date', required: true },
  { id: 'tgt-4', name: 'status', path: 'status', dataType: 'string', required: true },
]
</script>

<template>
  <main style="height: 100%">
    <KoppelingsCanvas
      :source-fields="sourceFields"
      :target-fields="targetFields"
      source-label="e-Suite"
      target-label="OpenZaak"
    />
  </main>
</template>
