import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceSchemaPanel from '../SourceSchemaPanel.vue'
import type { SchemaField } from '@/types'

function field(overrides: Partial<SchemaField> & { name: string }): SchemaField {
  return {
    id: overrides.path ?? overrides.name,
    path: overrides.name,
    dataType: 'string',
    required: false,
    ...overrides,
  }
}

const zaakFields: SchemaField[] = [
  field({ name: 'zaakId', path: 'Zaak.zaakId', id: 'Zaak.zaakId', dataType: 'string', required: true }),
  field({ name: 'omschrijving', path: 'Zaak.omschrijving', id: 'Zaak.omschrijving', dataType: 'string' }),
]

const statusFields: SchemaField[] = [
  field({ name: 'statusCode', path: 'Status.statusCode', id: 'Status.statusCode', dataType: 'string' }),
]

const multiSchemaFields = [...zaakFields, ...statusFields]

describe('SourceSchemaPanel', () => {
  // Scenario: Source fields visible after loading
  it('shows group headers for each schema object', () => {
    const wrapper = mount(SourceSchemaPanel, { props: { fields: multiSchemaFields } })
    // group headers always visible
    expect(wrapper.text()).toContain('Zaak')
    expect(wrapper.text()).toContain('Status')
  })

  it('shows empty state instruction when no fields', () => {
    const wrapper = mount(SourceSchemaPanel, { props: { fields: [] } })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  // Scenario: Field metadata visible per field
  it('shows the data type for each field', () => {
    const wrapper = mount(SourceSchemaPanel, { props: { fields: zaakFields } })
    // FieldNode shows type as abbreviated label (str, num, bool, etc.)
    expect(wrapper.text()).toContain('str')
  })

  it('shows required badge for required fields', () => {
    const wrapper = mount(SourceSchemaPanel, { props: { fields: zaakFields } })
    expect(wrapper.find('[data-testid="req-badge"]').exists()).toBe(true)
  })

  // Scenario: Expand schema object
  it('renders schema group headers', () => {
    const wrapper = mount(SourceSchemaPanel, { props: { fields: multiSchemaFields } })
    expect(wrapper.find('[data-testid="schema-group-Zaak"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="schema-group-Status"]').exists()).toBe(true)
  })

  it('expands and collapses a schema group on header click', async () => {
    const div = document.createElement('div')
    document.body.appendChild(div)
    const wrapper = mount(SourceSchemaPanel, { props: { fields: multiSchemaFields }, attachTo: div })
    // groups start collapsed
    expect(wrapper.find('[data-testid="schema-group-fields-Zaak"]').isVisible()).toBe(false)
    await wrapper.find('[data-testid="schema-group-toggle-Zaak"]').trigger('click')
    // expanded
    expect(wrapper.find('[data-testid="schema-group-fields-Zaak"]').isVisible()).toBe(true)
    await wrapper.find('[data-testid="schema-group-toggle-Zaak"]').trigger('click')
    // collapsed again
    expect(wrapper.find('[data-testid="schema-group-fields-Zaak"]').isVisible()).toBe(false)
    wrapper.unmount()
    div.remove()
  })

  // Scenario: Display nested $ref structure
  it('renders children of a field as an expandable subtree', async () => {
    const fieldsWithChildren: SchemaField[] = [
      field({
        name: 'adres',
        path: 'adres',
        id: 'adres',
        dataType: 'object',
        children: [
          field({ name: 'straat', path: 'adres.straat', id: 'adres.straat', dataType: 'string' }),
        ],
      }),
    ]
    const div = document.createElement('div')
    document.body.appendChild(div)
    const wrapper = mount(SourceSchemaPanel, { props: { fields: fieldsWithChildren }, attachTo: div })
    expect(wrapper.text()).toContain('adres')
    // children start collapsed
    expect(wrapper.find('[data-testid="field-children-adres"]').isVisible()).toBe(false)
    // expand the subtree
    await wrapper.find('[data-testid="field-toggle-adres"]').trigger('click')
    expect(wrapper.find('[data-testid="field-children-adres"]').isVisible()).toBe(true)
    wrapper.unmount()
    div.remove()
  })

  // Scenario: Maximum field length visible for string fields
  it('shows maxLength next to string fields that define it', () => {
    const fieldsWithMax: SchemaField[] = [
      field({ name: 'naam', path: 'naam', id: 'naam', dataType: 'string', maxLength: 255 }),
    ]
    const wrapper = mount(SourceSchemaPanel, { props: { fields: fieldsWithMax } })
    expect(wrapper.text()).toContain('255')
  })
})
