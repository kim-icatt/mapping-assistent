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
  const name = parts[parts.length - 1] as string | undefined
  if (!name) return null
  return (schemas[name] as Record<string, unknown>) ?? null
}

// Returns children for a property that is an object, $ref, or array-of-objects
function childrenFor(
  p: Record<string, unknown>,
  allSchemas: Record<string, unknown>,
  path: string,
): SchemaField[] | undefined {
  if (p.$ref && typeof p.$ref === 'string') {
    const refSchema = resolveRef(p.$ref, allSchemas)
    if (refSchema) return extractChildren(refSchema, allSchemas, path)
  }
  if (p.type === 'object' && p.properties) {
    return extractChildren(p, allSchemas, path)
  }
  if (p.type === 'array') {
    const items = p.items as Record<string, unknown> | undefined
    if (items) return childrenFor(items, allSchemas, path)
  }
  return undefined
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

    // Resolve $ref at this level so mapType and description come from the target schema
    let display = p
    if (p.$ref && typeof p.$ref === 'string') {
      const refSchema = resolveRef(p.$ref, allSchemas)
      if (refSchema) display = { ...refSchema, type: 'object' }
    }

    const field: SchemaField = {
      id: path,
      name: propName,
      path,
      dataType: mapType(display),
      required: required.includes(propName),
      description: display.description as string | undefined,
      maxLength: display.maxLength as number | undefined,
    }

    const nested = childrenFor(p, allSchemas, path)
    if (nested) field.children = nested

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

      // Resolve $ref at this level so display type/description come from target schema
      let display = p
      if (p.$ref && typeof p.$ref === 'string') {
        const refSchema = resolveRef(p.$ref, schemas)
        if (refSchema) display = { ...refSchema, type: 'object' }
      }

      const field: SchemaField = {
        id: path,
        name: propName,
        path,
        dataType: mapType(display),
        required: required.includes(propName),
        description: display.description as string | undefined,
        maxLength: display.maxLength as number | undefined,
      }

      const children = childrenFor(p, schemas, path)
      if (children) field.children = children

      fields.push(field)
    }
  }

  return fields
}
