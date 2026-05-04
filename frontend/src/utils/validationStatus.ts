import type { SchemaField } from '@/types'

export type ValidationStatus = 'compatible' | 'constrained' | 'incompatible'

const INCOMPATIBLE_PAIRS = new Set([
  'object-string', 'object-number', 'object-boolean', 'object-date', 'object-array',
  'array-string', 'array-number', 'array-boolean', 'array-date', 'array-object',
  'string-object', 'number-object', 'boolean-object', 'date-object',
  'string-array', 'number-array', 'boolean-array', 'date-array',
])

export function getValidationStatus(source: SchemaField, target: SchemaField): ValidationStatus {
  const key = `${source.dataType}-${target.dataType}`

  if (INCOMPATIBLE_PAIRS.has(key)) return 'incompatible'

  if (source.dataType === 'string' && target.dataType === 'string') {
    if (source.maxLength !== undefined && target.maxLength !== undefined && source.maxLength > target.maxLength) {
      return 'constrained'
    }
  }

  if (source.dataType !== target.dataType) return 'constrained'

  return 'compatible'
}

export function getConstraintReason(source: SchemaField, target: SchemaField): string {
  if (source.dataType === 'string' && target.dataType === 'string' &&
      source.maxLength !== undefined && target.maxLength !== undefined) {
    return `Source field is longer than target field (max ${source.maxLength} vs ${target.maxLength}) — truncation required`
  }
  return `${source.dataType} to ${target.dataType} requires transformation`
}

export function getIncompatibilityReason(source: SchemaField, target: SchemaField): string {
  return `${source.dataType} cannot be converted to ${target.dataType}`
}
