import { describe, it, expect } from 'vitest'
import { parseOpenApiToFields } from '../openApiParser'

const minimalOpenApi3 = {
  openapi: '3.0.0',
  info: { title: 'Test', version: '1.0' },
  components: {
    schemas: {
      Zaak: {
        type: 'object',
        required: ['zaakId'],
        properties: {
          zaakId: { type: 'string', description: 'Unique ID' },
          omschrijving: { type: 'string' },
          prioriteit: { type: 'integer' },
          actief: { type: 'boolean' },
          startDatum: { type: 'string', format: 'date' },
          metadata: { type: 'object' },
          tags: { type: 'array' },
        },
      },
    },
  },
}

const swagger2Spec = {
  swagger: '2.0',
  info: { title: 'Test', version: '1.0' },
  definitions: {
    Item: {
      type: 'object',
      required: ['id'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
      },
    },
  },
}

describe('parseOpenApiToFields', () => {
  // Scenario: Load valid JSON spec via file
  it('parses OpenAPI 3.x components.schemas to SchemaField[]', () => {
    const fields = parseOpenApiToFields(minimalOpenApi3)
    expect(fields.length).toBeGreaterThan(0)
    const zaakId = fields.find((f) => f.name === 'zaakId')
    expect(zaakId).toBeDefined()
    expect(zaakId?.dataType).toBe('string')
    expect(zaakId?.required).toBe(true)
    expect(zaakId?.description).toBe('Unique ID')
  })

  it('parses Swagger 2.x definitions to SchemaField[]', () => {
    const fields = parseOpenApiToFields(swagger2Spec)
    expect(fields).toHaveLength(2)
    expect(fields.find((f) => f.name === 'id')?.required).toBe(true)
    expect(fields.find((f) => f.name === 'name')?.required).toBe(false)
  })

  it('maps integer to number dataType', () => {
    const fields = parseOpenApiToFields(minimalOpenApi3)
    expect(fields.find((f) => f.name === 'prioriteit')?.dataType).toBe('number')
  })

  it('maps boolean dataType', () => {
    const fields = parseOpenApiToFields(minimalOpenApi3)
    expect(fields.find((f) => f.name === 'actief')?.dataType).toBe('boolean')
  })

  it('maps string with format:date to date dataType', () => {
    const fields = parseOpenApiToFields(minimalOpenApi3)
    expect(fields.find((f) => f.name === 'startDatum')?.dataType).toBe('date')
  })

  it('maps object and array dataTypes', () => {
    const fields = parseOpenApiToFields(minimalOpenApi3)
    expect(fields.find((f) => f.name === 'metadata')?.dataType).toBe('object')
    expect(fields.find((f) => f.name === 'tags')?.dataType).toBe('array')
  })

  it('produces unique ids for each field', () => {
    const fields = parseOpenApiToFields(minimalOpenApi3)
    const ids = fields.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  // Scenario: Empty spec without schema objects
  it('returns empty array when spec has no schemas', () => {
    const fields = parseOpenApiToFields({ openapi: '3.0.0', components: { schemas: {} } })
    expect(fields).toHaveLength(0)
  })

  // Scenario: Invalid spec selected
  it('throws on null input', () => {
    expect(() => parseOpenApiToFields(null)).toThrow('Invalid spec')
  })

  it('throws on non-object input', () => {
    expect(() => parseOpenApiToFields('not an object')).toThrow('Invalid spec')
  })

  it('throws when spec is valid JSON but not an OpenAPI/Swagger document', () => {
    expect(() => parseOpenApiToFields({ foo: 'bar', data: [1, 2, 3] })).toThrow('openapi')
  })
})
