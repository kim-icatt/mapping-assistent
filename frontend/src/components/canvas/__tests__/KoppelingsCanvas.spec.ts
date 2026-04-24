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

  // Scenario: Source field already mapped gives warning
  it('shows a warning when clicking a source field that is already mapped', async () => {
    const wrapper = mountCanvas()
    // Create an initial mapping via the store
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    await wrapper.find('[data-field-id="src-1"]').trigger('click')

    expect(wrapper.find('[data-testid="mapping-warning"]').exists()).toBe(true)
  })

  it('does not create a new mapping when source is already mapped', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    await wrapper.find('[data-field-id="src-1"]').trigger('click')
    await wrapper.find('[data-field-id="tgt-1"]').trigger('click')

    expect(store.mappings).toHaveLength(1)
    expect(wrapper.emitted('FieldMappingCreated')).toBeFalsy()
  })

  it('clicking target with no source selected does nothing', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()

    await wrapper.find('[data-field-id="tgt-1"]').trigger('click')

    expect(store.mappings).toHaveLength(0)
    expect(wrapper.emitted('FieldMappingCreated')).toBeFalsy()
  })

  it('resets the warning timer when already-mapped source is clicked again', async () => {
    const wrapper = mountCanvas()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    // click already-mapped source twice — exercises the clearTimeout(warningTimer) branch
    await wrapper.find('[data-field-id="src-1"]').trigger('click')
    await wrapper.find('[data-field-id="src-1"]').trigger('click')

    expect(wrapper.find('[data-testid="mapping-warning"]').exists()).toBe(true)
  })
})
