import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MappingOverview from '../MappingOverview.vue'
import { useMappings } from '@/composables/useMappings'
import type { SchemaField } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'zaakId', path: 'zaakId', dataType: 'string', required: true },
  { id: 'src-2', name: 'omschrijving', path: 'omschrijving', dataType: 'string', required: false },
]

const targetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'uuid', path: 'uuid', dataType: 'string', required: true, maxLength: 36 },
  { id: 'tgt-2', name: 'startdatum', path: 'startdatum', dataType: 'date', required: false },
]

function mountOverview() {
  return mount(MappingOverview, {
    global: { plugins: [createPinia()] },
    props: { sourceFields, targetFields },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('MappingOverview', () => {
  // Scenario: Mapping Overview empty without mappings
  it('shows an empty state when there are no active mappings', () => {
    const wrapper = mountOverview()
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="mapping-row"]')).toHaveLength(0)
  })

  // Scenario: Active mapping visible in Mapping Overview
  it('shows a row for each active mapping with field name and data type', async () => {
    const wrapper = mountOverview()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-2' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
    const row = wrapper.find('[data-testid="mapping-row"]')
    expect(row.text()).toContain('zaakId')
    expect(row.text()).toContain('str')
    expect(row.text()).toContain('startdatum')
    expect(row.text()).toContain('date')
  })

  // Scenario: Required field and maxLength visible in row
  it('shows a required marker when the target field is required', async () => {
    const wrapper = mountOverview()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="req-badge"]').exists()).toBe(true)
  })

  it('shows maxLength when defined on the target field', async () => {
    const wrapper = mountOverview()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('max 36')
  })

  // Scenario: Remove mapping via cross
  it('removes the mapping row when × is clicked', async () => {
    const wrapper = mountOverview()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-2' })
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="remove-mapping"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-testid="mapping-row"]')).toHaveLength(0)
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  it('emits FieldMappingRemoved when × is clicked', async () => {
    const wrapper = mountOverview()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-2' })
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="remove-mapping"]').trigger('click')

    expect(wrapper.emitted('FieldMappingRemoved')).toBeTruthy()
    expect(wrapper.emitted('FieldMappingRemoved')![0]![0]).toMatchObject({
      sourceFieldId: 'src-1',
      targetFieldId: 'tgt-2',
    })
  })

  it('removes the mapping from the store when × is clicked', async () => {
    const wrapper = mountOverview()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-2' })
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="remove-mapping"]').trigger('click')

    expect(store.mappings).toHaveLength(0)
  })
})
