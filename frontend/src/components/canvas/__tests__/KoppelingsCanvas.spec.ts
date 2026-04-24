import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import KoppelingsCanvas from '../KoppelingsCanvas.vue'
import { useMappings } from '@/composables/useMappings'
import type { SchemaField } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'zaakId', path: 'zaakId', dataType: 'string', required: true },
  { id: 'src-2', name: 'omschrijving', path: 'omschrijving', dataType: 'string', required: false },
]

const targetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'uuid', path: 'uuid', dataType: 'string', required: true },
  { id: 'tgt-2', name: 'titel', path: 'titel', dataType: 'string', required: false },
]

function mountCanvas() {
  return mount(KoppelingsCanvas, {
    global: { plugins: [createPinia()] },
    props: { sourceFields, targetFields },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('KoppelingsCanvas', () => {
  // Scenario: Lege staat zonder geladen schema's
  it("toont een lege staat als er geen schema's zijn geladen", () => {
    const wrapper = mount(KoppelingsCanvas, {
      global: { plugins: [createPinia()] },
      props: { sourceFields: [], targetFields: [] },
    })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  it("verbergt de lege staat als er schema-velden zijn", () => {
    const wrapper = mountCanvas()
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
  })

  // Scenario: Bronveldknooppunten zichtbaar na laden bronschema
  it('toont alle bronvelden in het bronpaneel', () => {
    const wrapper = mountCanvas()
    const sourceKolom = wrapper.find('[data-testid="source-kolom"]')
    expect(sourceKolom.text()).toContain('zaakId')
    expect(sourceKolom.text()).toContain('omschrijving')
  })

  // Scenario: Doelveldknooppunten zichtbaar na laden doelschema
  it('toont alle doelvelden in het doelpaneel', () => {
    const wrapper = mountCanvas()
    const targetKolom = wrapper.find('[data-testid="target-kolom"]')
    expect(targetKolom.text()).toContain('uuid')
  })

  // Scenario: Select source field and map to target field
  it('emits FieldMappingCreated after source then target field are clicked', async () => {
    const wrapper = mountCanvas()
    await wrapper.find('[data-field-id="src-1"]').trigger('click')
    await wrapper.find('[data-field-id="tgt-1"]').trigger('click')

    expect(wrapper.emitted('FieldMappingCreated')).toBeTruthy()
    expect(wrapper.emitted('FieldMappingCreated')![0]![0]).toMatchObject({
      sourceFieldId: 'src-1',
      targetFieldId: 'tgt-1',
    })
  })

  it('clicking only a source field does not emit FieldMappingCreated', async () => {
    const wrapper = mountCanvas()
    await wrapper.find('[data-field-id="src-1"]').trigger('click')

    expect(wrapper.emitted('FieldMappingCreated')).toBeFalsy()
  })

  it('clicking target with no source selected does nothing', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()

    await wrapper.find('[data-field-id="tgt-1"]').trigger('click')

    expect(store.mappings).toHaveLength(0)
    expect(wrapper.emitted('FieldMappingCreated')).toBeFalsy()
  })

  // Many-to-many: same source to multiple targets
  it('allows the same source field to be mapped to multiple target fields', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()

    await wrapper.find('[data-field-id="src-1"]').trigger('click')
    await wrapper.find('[data-field-id="tgt-1"]').trigger('click')

    await wrapper.find('[data-field-id="src-1"]').trigger('click')
    await wrapper.find('[data-field-id="tgt-2"]').trigger('click')

    expect(store.mappings).toHaveLength(2)
    expect(wrapper.emitted('FieldMappingCreated')).toHaveLength(2)
  })

  // Exact duplicate pair is silently ignored
  it('does not create a duplicate mapping for the same source-target pair', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()

    await wrapper.find('[data-field-id="src-1"]').trigger('click')
    await wrapper.find('[data-field-id="tgt-1"]').trigger('click')

    await wrapper.find('[data-field-id="src-1"]').trigger('click')
    await wrapper.find('[data-field-id="tgt-1"]').trigger('click')

    expect(store.mappings).toHaveLength(1)
  })

  // Delete confirmation flow
  it('shows confirmation dialog when delete-requested is received from ConnectionLines', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()
    const mapping = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })!

    // Emit delete-requested from ConnectionLines child
    wrapper.findComponent({ name: 'ConnectionLines' }).vm.$emit('delete-requested', mapping.id)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="delete-confirmation"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('zaakId')
    expect(wrapper.text()).toContain('uuid')
  })

  it('removes the mapping and emits FieldMappingRemoved on confirm delete', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()
    const mapping = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })!

    wrapper.findComponent({ name: 'ConnectionLines' }).vm.$emit('delete-requested', mapping.id)
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="confirm-delete"]').trigger('click')

    expect(store.mappings).toHaveLength(0)
    expect(wrapper.emitted('FieldMappingRemoved')).toBeTruthy()
    expect(wrapper.find('[data-testid="delete-confirmation"]').exists()).toBe(false)
  })

  it('cancels delete and keeps the mapping when Annuleren is clicked', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()
    const mapping = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })!

    wrapper.findComponent({ name: 'ConnectionLines' }).vm.$emit('delete-requested', mapping.id)
    await wrapper.vm.$nextTick()

    const confirmationEl = wrapper.find('[data-testid="delete-confirmation"]')
    await confirmationEl.find('button').trigger('click')

    expect(store.mappings).toHaveLength(1)
    expect(wrapper.find('[data-testid="delete-confirmation"]').exists()).toBe(false)
  })
})
