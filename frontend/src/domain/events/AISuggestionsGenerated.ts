import type { AiSuggestion } from '@/types'

export interface AISuggestionsGenerated {
  type: 'AISuggestionsGenerated'
  suggestions: AiSuggestion[]
  timestamp: string
}
