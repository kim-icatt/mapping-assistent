export type SuggestionStatus = 'pending' | 'accepted' | 'rejected'

export interface AiSuggestion {
  id: string
  sourceFieldId: string
  targetFieldId: string
  confidenceScore: number // 0.0 – 1.0
  reasoning?: string
  status: SuggestionStatus
}
