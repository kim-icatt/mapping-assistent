import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { FieldMapping } from '@/types'

export const useMappings = defineStore('mappings', () => {
  const mappings = ref<FieldMapping[]>([])
  const selectedMappingId = ref<string | null>(null)

  function selectMapping(id: string | null): void {
    selectedMappingId.value = id
  }

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
    // Prevent exact duplicate pairs only
    const isDuplicate = mappings.value.some(
      (m) => m.sourceFieldId === sourceFieldId && m.targetFieldId === targetFieldId,
    )
    if (isDuplicate) return null

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

  function removeMapping(id: string): void {
    mappings.value = mappings.value.filter((m) => m.id !== id)
    if (selectedMappingId.value === id) selectedMappingId.value = null
  }

  return { mappings, selectedMappingId, hasMapping, createMapping, removeMapping, selectMapping }
})
