import type { DataType, SchemaField } from '@/types'

function mapType(prop: Record<string, unknown>): DataType {
  if (prop.format === 'date' || prop.format === 'date-time') return 'date'
  const map: Record<string, DataType> = {
    string: 'string',
    integer: 'number',
    number: 'number',
    boolean: 'boolean',
    object: 'object',
    array: 'array',
  }
  return map[prop.type as string] ?? 'unknown'
}

function resolveRef(ref: string, schemas: Record<string, unknown>): Record<string, unknown> | null {
  // Handles local $ref: '#/components/schemas/Foo' or '#/definitions/Foo'
  const parts = ref.split('/')
  const name = parts[parts.length - 1]
  return (schemas[name] as Record<string, unknown>) ?? null
}

function extractChildren(
  schema: Record<string, unknown>,
  allSchemas: Record<string, unknown>,
  parentPath: string,
): SchemaField[] | undefined {
  const properties = schema.properties as Record<string, unknown> | undefined
  if (!properties) return undefined

  const required = (schema.required as string[]) ?? []
  const children: SchemaField[] = []

  for (const [propName, prop] of Object.entries(properties)) {
    const p = prop as Record<string, unknown>
    const path = `${parentPath}.${propName}`
    let resolvedProp = p
    let nestedChildren: SchemaField[] | undefined

    if (p.$ref && typeof p.$ref === 'string') {
      const refSchema = resolveRef(p.$ref, allSchemas)
      if (refSchema) {
        resolvedProp = { ...refSchema, type: 'object' }
        nestedChildren = extractChildren(refSchema, allSchemas, path)
      }
    } else if (p.type === 'object' && p.properties) {
      nestedChildren = extractChildren(p, allSchemas, path)
    }

    const field: SchemaField = {
      id: path,
      name: propName,
      path,
      dataType: mapType(resolvedProp),
      required: required.includes(propName),
      description: resolvedProp.description as string | undefined,
      maxLength: resolvedProp.maxLength as number | undefined,
    }
    if (nestedChildren) field.children = nestedChildren

    children.push(field)
  }

  return children.length > 0 ? children : undefined
}

export function parseOpenApiToFields(spec: unknown): SchemaField[] {
  if (!spec || typeof spec !== 'object') throw new Error('Invalid spec: expected an object')

  const s = spec as Record<string, unknown>

  if (!('openapi' in s) && !('swagger' in s)) {
    throw new Error('Geen geldig OpenAPI-schema: veld "openapi" of "swagger" ontbreekt')
  }

  const schemas: Record<string, unknown> =
    ((s.components as Record<string, unknown>)?.schemas as Record<string, unknown>) ??
    (s.definitions as Record<string, unknown>) ??
    {}

  const schemaNames = Object.keys(schemas)
  if (schemaNames.length === 0) return []

  const fields: SchemaField[] = []
  const multiSchema = schemaNames.length > 1

  for (const schemaName of schemaNames) {
    const schema = schemas[schemaName] as Record<string, unknown>
    const properties = schema.properties as Record<string, unknown> | undefined
    if (!properties) continue

    const required = (schema.required as string[]) ?? []

    for (const [propName, prop] of Object.entries(properties)) {
      const p = prop as Record<string, unknown>
      const path = multiSchema ? `${schemaName}.${propName}` : propName

      let resolvedProp = p
      let children: SchemaField[] | undefined

      if (p.$ref && typeof p.$ref === 'string') {
        const refSchema = resolveRef(p.$ref, schemas)
        if (refSchema) {
          resolvedProp = { ...refSchema, type: 'object' }
          children = extractChildren(refSchema, schemas, path)
        }
      } else if (p.type === 'object' && p.properties) {
        children = extractChildren(p, schemas, path)
      }

      const field: SchemaField = {
        id: path,
        name: propName,
        path,
        dataType: mapType(resolvedProp),
        required: required.includes(propName),
        description: resolvedProp.description as string | undefined,
        maxLength: resolvedProp.maxLength as number | undefined,
      }
      if (children) field.children = children

      fields.push(field)
    }
  }

  return fields
}
