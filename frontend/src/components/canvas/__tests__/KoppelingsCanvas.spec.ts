import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KoppelingsCanvas from '../KoppelingsCanvas.vue'
import type { SchemaField } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'zaakId', path: 'zaakId', dataType: 'string', required: true },
  { id: 'src-2', name: 'omschrijving', path: 'omschrijving', dataType: 'string', required: false },
]

const targetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'uuid', path: 'uuid', dataType: 'string', required: true },
]

describe('KoppelingsCanvas', () => {
  // Scenario: Lege staat zonder geladen schema's
  it("toont een lege staat als er geen schema's zijn geladen", () => {
    const wrapper = mount(KoppelingsCanvas, {
      props: { sourceFields: [], targetFields: [] },
    })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  it("verbergt de lege staat als er schema-velden zijn", () => {
    const wrapper = mount(KoppelingsCanvas, {
      props: { sourceFields, targetFields },
    })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
  })

  // Scenario: Bronveldknooppunten zichtbaar na laden bronschema
  it('toont alle bronvelden in het bronpaneel', () => {
    const wrapper = mount(KoppelingsCanvas, {
      props: { sourceFields, targetFields: [] },
    })
    const sourceKolom = wrapper.find('[data-testid="source-kolom"]')
    expect(sourceKolom.text()).toContain('zaakId')
    expect(sourceKolom.text()).toContain('omschrijving')
  })

  // Scenario: Doelveldknooppunten zichtbaar na laden doelschema
  it('toont alle doelvelden in het doelpaneel', () => {
    const wrapper = mount(KoppelingsCanvas, {
      props: { sourceFields: [], targetFields },
    })
    const targetKolom = wrapper.find('[data-testid="target-kolom"]')
    expect(targetKolom.text()).toContain('uuid')
  })
})
