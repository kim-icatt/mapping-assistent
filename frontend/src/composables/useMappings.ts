import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FieldMapping } from '@/types'

export const useMappings = defineStore('mappings', () => {
  const mappings = ref<FieldMapping[]>([])

  function hasMapping(sourceFieldId: string): boolean {
    return mappings.value.some((m) => m.sourceFieldId === sourceFieldId)
  }

  function createMapping({
    sourceFieldId,
    targetFieldId,
  }: {
    sourceFieldId: string
    targetFieldId: string
  }): FieldMapping | null {
    if (hasMapping(sourceFieldId)) {
      return null
    }

    const mapping: FieldMapping = {
      id: crypto.randomUUID(),
      sourceFieldId,
      targetFieldId,
      transformation: { type: 'direct' },
      status: 'confirmed',
    }

    mappings.value.push(mapping)
    return mapping
  }

  return { mappings, hasMapping, createMapping }
})
