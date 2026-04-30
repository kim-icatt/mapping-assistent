import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SchemaField, AiSuggestion } from '@/types'
import type { AISuggestionsGenerated } from '@/domain/events/AISuggestionsGenerated'

export class AIServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'AIServiceError'
  }
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const CLAUDE_MODEL = 'claude-sonnet-4-6'

interface ClaudeApiSuggestion {
  sourceField: string
  targetField: string
  confidenceScore: number
}

function flattenFields(fields: SchemaField[]): SchemaField[] {
  return fields.flatMap((f) => [f, ...(f.children ? flattenFields(f.children) : [])])
}

export const useAISuggestions = defineStore('aiSuggestions', () => {
  const suggestions = ref<AiSuggestion[]>([])
  const isLoading = ref(false)
  const error = ref<AIServiceError | null>(null)

  async function generateSuggestions(
    sourceFields: SchemaField[],
    unmappedTargetFields: SchemaField[],
  ): Promise<AiSuggestion[]> {
    if (unmappedTargetFields.length === 0) {
      suggestions.value = []
      return []
    }

    isLoading.value = true
    error.value = null

    const apiKey = import.meta.env.VITE_CLAUDE_API_KEY as string | undefined
    if (!apiKey) throw new AIServiceError('Claude API key not configured')

    const allSourceFields = flattenFields(sourceFields)
    const sourcePaths = allSourceFields.map((f) => f.path)
    const targetPaths = unmappedTargetFields.map((f) => f.path)

    const systemPrompt =
      'You are a field mapping assistant. Given source and target schema field paths, suggest the best one-to-one mappings. Return a JSON object with a "suggestions" array where each item has "sourceField" (path), "targetField" (path), and "confidenceScore" (number 0.0–1.0). Only return valid JSON, no markdown.'

    const userMessage = `Source fields: ${JSON.stringify(sourcePaths)}\n\nUnmapped target fields: ${JSON.stringify(targetPaths)}\n\nReturn JSON suggestions.`

    let responseData: unknown
    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 1024,
          system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: userMessage }],
        }),
      })

      if (!response.ok) {
        throw new AIServiceError(`Claude API returned ${response.status}`)
      }

      responseData = await response.json()
    } catch (e) {
      isLoading.value = false
      if (e instanceof AIServiceError) throw e
      const err = new AIServiceError('AI service unreachable', e)
      error.value = err
      throw err
    }

    try {
      const text =
        (responseData as { content: Array<{ type: string; text: string }> }).content[0]?.text ?? ''
      const parsed = JSON.parse(text) as { suggestions: ClaudeApiSuggestion[] }

      const resolved: AiSuggestion[] = parsed.suggestions.reduce<AiSuggestion[]>((acc, s) => {
        const src = allSourceFields.find((f) => f.path === s.sourceField || f.name === s.sourceField)
        const tgt = unmappedTargetFields.find(
          (f) => f.path === s.targetField || f.name === s.targetField,
        )
        if (!src || !tgt) return acc
        acc.push({
          id: crypto.randomUUID() as string,
          sourceFieldId: src.id,
          targetFieldId: tgt.id,
          confidenceScore: Math.max(0, Math.min(1, s.confidenceScore)),
          status: 'pending',
        })
        return acc
      }, [])

      suggestions.value = resolved

      const event: AISuggestionsGenerated = {
        type: 'AISuggestionsGenerated',
        suggestions: resolved,
        timestamp: new Date().toISOString(),
      }
      window.dispatchEvent(new CustomEvent('AISuggestionsGenerated', { detail: event }))

      return resolved
    } catch (e) {
      const err = new AIServiceError('Failed to parse AI response', e)
      error.value = err
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return { suggestions, isLoading, error, generateSuggestions }
})
