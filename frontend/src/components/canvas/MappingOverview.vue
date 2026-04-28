<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaField } from '@/types'
import { useMappings } from '@/composables/useMappings'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
}>()

const emit = defineEmits<{
  FieldMappingRemoved: [payload: { sourceFieldId: string; targetFieldId: string }]
}>()

const store = useMappings()

const FALLBACK_TYPE = { bg: 'bg-slate-100', text: 'text-slate-400', label: '?' }
const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
  string:  { bg: 'bg-blue-50',    text: 'text-blue-600',   label: 'str'  },
  number:  { bg: 'bg-amber-50',   text: 'text-amber-600',  label: 'num'  },
  boolean: { bg: 'bg-purple-50',  text: 'text-purple-600', label: 'bool' },
  date:    { bg: 'bg-emerald-50', text: 'text-emerald-600',label: 'date' },
  object:  { bg: 'bg-slate-100',  text: 'text-slate-500',  label: 'obj'  },
  array:   { bg: 'bg-cyan-50',    text: 'text-cyan-600',   label: 'arr'  },
  unknown: FALLBACK_TYPE,
}

function typeOf(dataType: string) {
  return typeConfig[dataType] ?? FALLBACK_TYPE
}

const rows = computed(() =>
  store.mappings.map((m) => ({
    id: m.id,
    sourceFieldId: m.sourceFieldId,
    targetFieldId: m.targetFieldId,
    source: props.sourceFields.find((f) => f.id === m.sourceFieldId),
    target: props.targetFields.find((f) => f.id === m.targetFieldId),
  })),
)

function remove(mappingId: string, sourceFieldId: string, targetFieldId: string) {
  store.removeMapping(mappingId)
  emit('FieldMappingRemoved', { sourceFieldId, targetFieldId })
}
</script>

<template>
  <div class="flex flex-col bg-white border border-slate-200 rounded-sm overflow-hidden">
    <!-- Header -->
    <div class="px-4 py-2.5 border-b border-slate-200 flex items-center gap-2">
      <span class="text-sm font-bold text-slate-700">Koppelingen</span>
      <span class="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">
        {{ store.mappings.length }}
      </span>
    </div>

    <!-- Empty state -->
    <div
      v-if="rows.length === 0"
      class="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center text-slate-400 text-sm"
      data-testid="empty-state"
    >
      <p>Nog geen koppelingen aangemaakt.</p>
      <p class="mt-1">Selecteer een bronveld en een doelveld om te beginnen.</p>
    </div>

    <!-- Mapping rows -->
    <div v-else class="flex-1 overflow-y-auto divide-y divide-slate-100">
      <div
        v-for="row in rows"
        :key="row.id"
        class="flex items-center gap-2 px-3 py-2 text-sm"
        data-testid="mapping-row"
      >
        <!-- Source field -->
        <div class="flex-1 flex items-center gap-1.5 min-w-0">
          <span class="font-mono text-slate-800 truncate text-[13px]">
            {{ row.source?.name ?? row.sourceFieldId }}
          </span>
          <span
            v-if="row.source"
            :class="['text-[11px] leading-none px-1.5 py-0.5 rounded font-medium shrink-0', typeOf(row.source.dataType).bg, typeOf(row.source.dataType).text]"
          >{{ typeOf(row.source.dataType).label }}</span>
        </div>

        <!-- Arrow -->
        <span class="text-slate-300 shrink-0">→</span>

        <!-- Target field -->
        <div class="flex-1 flex items-center gap-1.5 min-w-0">
          <span class="font-mono text-slate-800 truncate text-[13px]">
            {{ row.target?.name ?? row.targetFieldId }}
          </span>
          <span
            v-if="row.target"
            :class="['text-[11px] leading-none px-1.5 py-0.5 rounded font-medium shrink-0', typeOf(row.target.dataType).bg, typeOf(row.target.dataType).text]"
          >{{ typeOf(row.target.dataType).label }}</span>
          <span
            v-if="row.target?.required"
            data-testid="req-badge"
            class="text-[10px] leading-none px-1 py-0.5 rounded bg-red-50 text-red-600 font-bold shrink-0 tracking-wide"
          >VERPL</span>
          <span
            v-if="row.target?.maxLength != null"
            class="text-[10px] leading-none px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-medium shrink-0"
          >max {{ row.target.maxLength }}</span>
        </div>

        <!-- Remove button -->
        <button
          class="shrink-0 text-slate-300 hover:text-red-500 transition-colors font-bold px-1 leading-none"
          data-testid="remove-mapping"
          aria-label="Verwijder koppeling"
          @click="remove(row.id, row.sourceFieldId, row.targetFieldId)"
        >×</button>
      </div>
    </div>
  </div>
</template>
