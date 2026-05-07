export interface AISuggestionAccepted {
  type: 'AISuggestionAccepted'
  sourceFieldId: string
  targetFieldId: string
  confidenceScore: number
  timestamp: string
}
