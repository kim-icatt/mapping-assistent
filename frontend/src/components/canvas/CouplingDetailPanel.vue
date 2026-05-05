<script setup lang="ts">
import { computed } from 'vue'
import type { SchemaField } from '@/types'
import { useMappings } from '@/composables/useMappings'
import {
  getValidationStatus,
  getConstraintReason,
  getIncompatibilityReason,
} from '@/utils/validationStatus'

const props = defineProps<{
  sourceFields: SchemaField[]
  targetFields: SchemaField[]
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

function findField(fields: SchemaField[], id: string): SchemaField | null {
  for (const f of fields) {
    if (f.id === id) return f
    if (f.children) {
      const found = findField(f.children, id)
      if (found) return found
    }
  }
  return null
}

const selectedMapping = computed(() =>
  store.selectedMappingId
    ? store.mappings.find((m) => m.id === store.selectedMappingId) ?? null
    : null,
)

const sourceField = computed(() =>
  selectedMapping.value
    ? findField(props.sourceFields, selectedMapping.value.sourceFieldId)
    : null,
)

const targetField = computed(() =>
  selectedMapping.value
    ? findField(props.targetFields, selectedMapping.value.targetFieldId)
    : null,
)

const validationStatus = computed(() =>
  sourceField.value && targetField.value
    ? getValidationStatus(sourceField.value, targetField.value)
    : null,
)

const constraintReason = computed(() =>
  sourceField.value && targetField.value && validationStatus.value === 'constrained'
    ? getConstraintReason(sourceField.value, targetField.value)
    : null,
)

const incompatibilityReason = computed(() =>
  sourceField.value && targetField.value && validationStatus.value === 'incompatible'
    ? getIncompatibilityReason(sourceField.value, targetField.value)
    : null,
)
</script>

<template>
  <div
    v-if="selectedMapping && sourceField && targetField"
    class="flex flex-col bg-white border border-slate-200 rounded-sm overflow-hidden"
    data-testid="coupling-detail-panel"
  >
    <!-- Header -->
    <div class="px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
      <span class="text-sm font-medium text-slate-700">Koppelingsdetail</span>
      <button
        class="text-slate-400 hover:text-slate-600 transition-colors leading-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 rounded"
        data-testid="detail-close"
        aria-label="Close coupling detail"
        @click="store.selectMapping(null)"
      >×</button>
    </div>

    <!-- Source field -->
    <div class="px-4 pt-4 pb-2" data-testid="detail-source-field">
      <p class="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Bronveld</p>
      <div class="flex items-center gap-2">
        <span class="font-mono text-sm text-[color:var(--color-source)] truncate flex-1">
          {{ sourceField.name }}
        </span>
        <span :class="['shrink-0 text-[11px] leading-none px-1.5 py-0.5 rounded font-medium', typeOf(sourceField.dataType).bg, typeOf(sourceField.dataType).text]">
          {{ typeOf(sourceField.dataType).label }}
        </span>
        <span v-if="sourceField.required" class="shrink-0 bg-rose-50 text-rose-600 text-[10px] rounded px-1 font-medium">REQ</span>
      </div>
      <p v-if="sourceField.dataType === 'string' && sourceField.maxLength" class="text-[11px] text-slate-400 mt-0.5">
        max. {{ sourceField.maxLength }}
      </p>
    </div>

    <!-- Arrow separator -->
    <div class="px-4 py-1 text-center text-slate-300 text-xs">→</div>

    <!-- Target field -->
    <div class="px-4 pt-2 pb-4" data-testid="detail-target-field">
      <p class="text-[11px] uppercase tracking-wide text-slate-400 mb-1">Doelveld</p>
      <div class="flex items-center gap-2">
        <span class="font-mono text-sm text-[color:var(--color-destination)] truncate flex-1">
          {{ targetField.name }}
        </span>
        <span :class="['shrink-0 text-[11px] leading-none px-1.5 py-0.5 rounded font-medium', typeOf(targetField.dataType).bg, typeOf(targetField.dataType).text]">
          {{ typeOf(targetField.dataType).label }}
        </span>
        <span v-if="targetField.required" class="shrink-0 bg-rose-50 text-rose-600 text-[10px] rounded px-1 font-medium">REQ</span>
      </div>
      <p v-if="targetField.dataType === 'string' && targetField.maxLength" class="text-[11px] text-slate-400 mt-0.5">
        max. {{ targetField.maxLength }}
      </p>
    </div>

    <!-- Validation section -->
    <div
      class="mx-4 mb-4 rounded p-3 text-sm"
      :class="{
        'bg-emerald-50 text-emerald-700': validationStatus === 'compatible',
        'bg-amber-50 text-amber-700': validationStatus === 'constrained',
        'bg-red-50 text-red-700': validationStatus === 'incompatible',
      }"
      role="status"
      data-testid="detail-validation-section"
    >
      <!-- Compatible -->
      <template v-if="validationStatus === 'compatible'">
        <span class="font-medium">✓ Koppeling is compatibel.</span>
      </template>

      <!-- Constrained -->
      <template v-else-if="validationStatus === 'constrained'">
        <span class="font-medium">⚠ {{ constraintReason }}</span>
        <div
          class="mt-2 border border-dashed border-amber-200 rounded p-2 text-[11px] italic text-slate-300"
          data-testid="transformation-placeholder"
        >
          — Transformatieregel —
        </div>
      </template>

      <!-- Incompatible -->
      <template v-else-if="validationStatus === 'incompatible'">
        <span class="font-medium">✕ {{ incompatibilityReason }}</span>
        <p class="mt-1 text-xs" data-testid="remap-note">Deze koppeling moet opnieuw worden gemaakt.</p>
      </template>
    </div>
  </div>
</template>
