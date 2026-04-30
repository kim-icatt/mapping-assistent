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

  // Scenario: Display nested $ref structure
  it('resolves $ref properties into children on the parent field', () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          Zaak: {
            type: 'object',
            properties: {
              adres: { $ref: '#/components/schemas/Adres' },
            },
          },
          Adres: {
            type: 'object',
            properties: {
              straat: { type: 'string' },
              huisnummer: { type: 'integer' },
            },
          },
        },
      },
    }
    const fields = parseOpenApiToFields(spec)
    const adres = fields.find((f) => f.name === 'adres')
    expect(adres).toBeDefined()
    expect(adres?.dataType).toBe('object')
    expect(adres?.children).toHaveLength(2)
    expect(adres?.children?.find((c) => c.name === 'straat')?.dataType).toBe('string')
  })

  it('resolves array items with $ref into children', () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          Order: {
            type: 'object',
            properties: {
              lines: {
                type: 'array',
                items: { $ref: '#/components/schemas/OrderLine' },
              },
            },
          },
          OrderLine: {
            type: 'object',
            properties: {
              product: { type: 'string' },
              quantity: { type: 'integer' },
            },
          },
        },
      },
    }
    const fields = parseOpenApiToFields(spec)
    const lines = fields.find((f) => f.name === 'lines')
    expect(lines?.dataType).toBe('array')
    expect(lines?.children).toHaveLength(2)
    expect(lines?.children?.find((c) => c.name === 'product')).toBeDefined()
  })

  it('resolves inline array items with object properties into children', () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          Invoice: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    sku: { type: 'string' },
                    price: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    }
    const fields = parseOpenApiToFields(spec)
    const items = fields.find((f) => f.name === 'items')
    expect(items?.dataType).toBe('array')
    expect(items?.children).toHaveLength(2)
    expect(items?.children?.find((c) => c.name === 'sku')).toBeDefined()
  })

  it('resolves inline object properties into children', () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          Item: {
            type: 'object',
            properties: {
              meta: {
                type: 'object',
                properties: {
                  key: { type: 'string' },
                  value: { type: 'string' },
                },
              },
            },
          },
        },
      },
    }
    const fields = parseOpenApiToFields(spec)
    const meta = fields.find((f) => f.name === 'meta')
    expect(meta?.children).toHaveLength(2)
    expect(meta?.children?.find((c) => c.name === 'key')).toBeDefined()
  })
})
