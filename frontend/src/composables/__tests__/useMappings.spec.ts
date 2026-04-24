import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMappings } from '../useMappings'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('useMappings', () => {
  // Scenario: Select source field and map to target field
  it('creates a mapping from sourceFieldId to targetFieldId', () => {
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    expect(store.mappings).toHaveLength(1)
    expect(store.mappings[0]!.sourceFieldId).toBe('src-1')
    expect(store.mappings[0]!.targetFieldId).toBe('tgt-1')
  })

  it('assigns a unique id to each mapping', () => {
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    store.createMapping({ sourceFieldId: 'src-2', targetFieldId: 'tgt-2' })

    expect(store.mappings[0]!.id).toBeTruthy()
    expect(store.mappings[1]!.id).toBeTruthy()
    expect(store.mappings[0]!.id).not.toBe(store.mappings[1]!.id)
  })

  it('returns the created FieldMapping from createMapping', () => {
    const store = useMappings()
    const result = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    expect(result).not.toBeNull()
    expect(result?.sourceFieldId).toBe('src-1')
  })

  // Scenario: Source field already mapped gives warning
  it('returns null and does not create a mapping when source is already mapped', () => {
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    const second = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-2' })

    expect(second).toBeNull()
    expect(store.mappings).toHaveLength(1)
  })

  it('returns null for duplicate source-target pair', () => {
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    const duplicate = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    expect(duplicate).toBeNull()
    expect(store.mappings).toHaveLength(1)
  })

  it('hasMapping returns true when source field has an active mapping', () => {
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    expect(store.hasMapping('src-1')).toBe(true)
  })

  it('hasMapping returns false when source field has no mapping', () => {
    const store = useMappings()
    expect(store.hasMapping('src-1')).toBe(false)
  })
})
