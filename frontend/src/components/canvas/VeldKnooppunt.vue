<script setup lang="ts">
const props = defineProps<{
  data: {
    name: string
    dataType: string
    required: boolean
    side?: 'source' | 'target'
  }
}>()

const typeConfig: Record<string, { bg: string; text: string; label: string }> = {
  string:  { bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'str'  },
  number:  { bg: 'bg-amber-50',  text: 'text-amber-600',  label: 'num'  },
  boolean: { bg: 'bg-purple-50', text: 'text-purple-600', label: 'bool' },
  date:    { bg: 'bg-emerald-50',text: 'text-emerald-600',label: 'date' },
  object:  { bg: 'bg-slate-100', text: 'text-slate-500',  label: 'obj'  },
  array:   { bg: 'bg-cyan-50',   text: 'text-cyan-600',   label: 'arr'  },
  enum:    { bg: 'bg-rose-50',   text: 'text-rose-600',   label: 'enum' },
  unknown: { bg: 'bg-slate-100', text: 'text-slate-400',  label: '?'    },
}

const tc = typeConfig[props.data.dataType] ?? typeConfig.unknown
</script>

<template>
  <div
    class="w-full flex items-center gap-2 py-2 pl-3 pr-3 border-b border-slate-100 text-sm transition-colors hover:bg-slate-50 group cursor-default"
    :aria-label="`${props.data.name}, ${props.data.dataType}${props.data.required ? ', verplicht' : ''}`"
  >
    <!-- Left dot indicator -->
    <span class="shrink-0 w-1.5 h-1.5 rounded-full bg-slate-200" />

    <!-- Field name (monospace) -->
    <span class="font-mono truncate flex-1 text-slate-800 font-medium text-[13px]">{{ props.data.name }}</span>

    <!-- Type badge -->
    <span :class="['text-[11px] leading-none px-1.5 py-0.5 rounded font-medium shrink-0', tc.bg, tc.text]">
      {{ tc.label }}
    </span>

    <!-- Required badge -->
    <span
      v-if="props.data.required"
      data-testid="req-badge"
      class="text-[10px] leading-none px-1 py-0.5 rounded bg-red-50 text-red-600 font-bold shrink-0 tracking-wide"
    >REQ</span>
  </div>
</template>
