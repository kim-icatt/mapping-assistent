export type TransformationType = 'direct' | 'static' | 'expression' | 'truncate' | 'default'

export type MappingStatus = 'confirmed' | 'rejected'

export interface TransformationRule {
  type: TransformationType
  staticValue?: string // used when type === 'static'
  expression?: string  // used when type === 'expression' (e.g. JSONata)
  truncationMaxLength?: number // used when type === 'truncate'
  defaultValue?: string // used when type === 'default'
}

export interface FieldMapping {
  id: string
  sourceFieldId: string
  targetFieldId: string
  transformation: TransformationRule
  status: MappingStatus
  notes?: string
}

export interface MappingSet {
  id: string
  name: string
  sourceSchemaId: string
  targetSchemaId: string
  mappings: FieldMapping[]
  createdAt: string // ISO 8601
  updatedAt: string // ISO 8601
}
