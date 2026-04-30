import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAISuggestions, AIServiceError } from '../useAISuggestions'
import type { SchemaField } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'firstName', path: 'firstName', dataType: 'string', required: true },
  { id: 'src-2', name: 'lastName', path: 'lastName', dataType: 'string', required: true },
]

const unmappedTargetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'first_name', path: 'first_name', dataType: 'string', required: true },
  { id: 'tgt-2', name: 'last_name', path: 'last_name', dataType: 'string', required: true },
]

const mockClaudeResponse = {
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        suggestions: [
          { sourceField: 'firstName', targetField: 'first_name', confidenceScore: 0.95 },
          { sourceField: 'lastName', targetField: 'last_name', confidenceScore: 0.92 },
        ],
      }),
    },
  ],
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.stubEnv('VITE_CLAUDE_API_KEY', 'test-api-key')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('useAISuggestions', () => {
  // Scenario: Fetch suggestions when both schemas are loaded
  it('returns a list of AI suggestions when source and target fields are provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClaudeResponse) }),
    )

    const store = useAISuggestions()
    const result = await store.generateSuggestions(sourceFields, unmappedTargetFields)

    expect(result).toHaveLength(2)
    expect(store.suggestions).toEqual(result)
  })

  it('each suggestion contains a sourceFieldId, targetFieldId, and confidenceScore', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(mockClaudeResponse) }),
    )

    const store = useAISuggestions()
    const result = await store.generateSuggestions(sourceFields, unmappedTargetFields)

    expect(result[0]).toMatchObject({
      sourceFieldId: 'src-1',
      targetFieldId: 'tgt-1',
      confidenceScore: 0.95,
      status: 'pending',
    })
    expect(result[1]).toMatchObject({
      sourceFieldId: 'src-2',
      targetFieldId: 'tgt-2',
      confidenceScore: 0.92,
      status: 'pending',
    })
  })

  // Scenario: All target fields are already mapped
  it('returns an empty list when there are no unmapped target fields', async () => {
    const fetchMock = vi.fn<() => never>()
    vi.stubGlobal('fetch', fetchMock)

    const store = useAISuggestions()
    const result = await store.generateSuggestions(sourceFields, [])

    expect(result).toHaveLength(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  // Scenario: AI service unreachable
  it('throws AIServiceError when the AI service is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const store = useAISuggestions()
    await expect(store.generateSuggestions(sourceFields, unmappedTargetFields)).rejects.toThrow(
      AIServiceError,
    )
  })

  it('does not store any suggestions when the service is unreachable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    const store = useAISuggestions()
    try {
      await store.generateSuggestions(sourceFields, unmappedTargetFields)
    } catch {
      // expected
    }

    expect(store.suggestions).toHaveLength(0)
  })
})
