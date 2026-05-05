import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import CouplingDetailPanel from '../CouplingDetailPanel.vue'
import { useMappings } from '@/composables/useMappings'
import type { SchemaField } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'naam', path: 'naam', dataType: 'string', required: false },
  { id: 'src-2', name: 'beschrijving', path: 'beschrijving', dataType: 'string', required: false, maxLength: 100 },
  { id: 'src-3', name: 'adres', path: 'adres', dataType: 'object', required: false },
]

const targetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'volledige_naam', path: 'volledige_naam', dataType: 'string', required: false },
  { id: 'tgt-2', name: 'omschrijving', path: 'omschrijving', dataType: 'string', required: false, maxLength: 50 },
  { id: 'tgt-3', name: 'adresString', path: 'adresString', dataType: 'string', required: false },
]

function mountPanel() {
  return mount(CouplingDetailPanel, {
    global: { plugins: [createPinia()] },
    props: { sourceFields, targetFields },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('CouplingDetailPanel', () => {
  // Scenario: Detail panel shows field info for a compatible coupling
  it('shows source and target field names and types for a compatible coupling', async () => {
    const wrapper = mountPanel()
    const store = useMappings()
    const mapping = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    store.selectMapping(mapping!.id)
    await wrapper.vm.$nextTick()

    const panel = wrapper.find('[data-testid="coupling-detail-panel"]')
    expect(panel.exists()).toBe(true)
    expect(wrapper.find('[data-testid="detail-source-field"]').text()).toContain('naam')
    expect(wrapper.find('[data-testid="detail-source-field"]').text()).toContain('str')
    expect(wrapper.find('[data-testid="detail-target-field"]').text()).toContain('volledige_naam')
    expect(wrapper.find('[data-testid="detail-target-field"]').text()).toContain('str')
  })

  it('shows compatible validation status and no transformation input for a compatible coupling', async () => {
    const wrapper = mountPanel()
    const store = useMappings()
    const mapping = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    store.selectMapping(mapping!.id)
    await wrapper.vm.$nextTick()

    const validationSection = wrapper.find('[data-testid="detail-validation-section"]')
    expect(validationSection.text()).toContain('compatibel')
    expect(wrapper.find('[data-testid="transformation-placeholder"]').exists()).toBe(false)
  })

  // Scenario: Detail panel shows constraint reason for a constrained coupling
  it('shows constraint reason and transformation placeholder for a constrained coupling', async () => {
    const wrapper = mountPanel()
    const store = useMappings()
    // src-2: string maxLength 100, tgt-2: string maxLength 50 → constrained
    const mapping = store.createMapping({ sourceFieldId: 'src-2', targetFieldId: 'tgt-2' })
    store.selectMapping(mapping!.id)
    await wrapper.vm.$nextTick()

    const validationSection = wrapper.find('[data-testid="detail-validation-section"]')
    expect(validationSection.text()).toMatch(/100|50|truncat/i)
    expect(wrapper.find('[data-testid="transformation-placeholder"]').exists()).toBe(true)
  })

  // Scenario: Detail panel shows incompatibility reason for an incompatible coupling
  it('shows incompatibility reason and remap note for an incompatible coupling', async () => {
    const wrapper = mountPanel()
    const store = useMappings()
    // src-3: object, tgt-3: string → incompatible
    const mapping = store.createMapping({ sourceFieldId: 'src-3', targetFieldId: 'tgt-3' })
    store.selectMapping(mapping!.id)
    await wrapper.vm.$nextTick()

    const validationSection = wrapper.find('[data-testid="detail-validation-section"]')
    expect(validationSection.text()).toMatch(/object|string|remap/i)
    expect(wrapper.find('[data-testid="transformation-placeholder"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="remap-note"]').exists()).toBe(true)
  })

  // Scenario: Closing the detail panel clears the selection
  it('clears the selected mapping when the close button is clicked', async () => {
    const wrapper = mountPanel()
    const store = useMappings()
    const mapping = store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    store.selectMapping(mapping!.id)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-testid="coupling-detail-panel"]').exists()).toBe(true)
    await wrapper.find('[data-testid="detail-close"]').trigger('click')
    await wrapper.vm.$nextTick()

    expect(store.selectedMappingId).toBeNull()
  })

  // Scenario: Detail panel is not shown when no coupling is selected
  it('does not render the panel when no coupling is selected', () => {
    const wrapper = mountPanel()
    // selectedMappingId is null by default
    expect(wrapper.find('[data-testid="coupling-detail-panel"]').exists()).toBe(false)
  })
})
