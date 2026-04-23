import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import KoppelingsCanvas from '../KoppelingsCanvas.vue'
import type { SchemaField } from '@/types'

const mountOptions = {
  global: { stubs: { VueFlow: true, VeldKnooppunt: true } },
}

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
      ...mountOptions,
    })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
  })

  it('verbergt de lege staat als er schema-velden zijn', () => {
    const wrapper = mount(KoppelingsCanvas, {
      props: { sourceFields, targetFields },
      ...mountOptions,
    })
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(false)
  })

  // Scenario: Bronveldknooppunten zichtbaar na laden bronschema
  it('genereert een node per bronveld met positie links', () => {
    const wrapper = mount(KoppelingsCanvas, {
      props: { sourceFields, targetFields: [] },
      ...mountOptions,
    })
    const nodes = wrapper.vm.nodes
    const sourceNodes = nodes.filter((n: { id: string }) => n.id.startsWith('src-'))
    expect(sourceNodes).toHaveLength(sourceFields.length)
    sourceNodes.forEach((n: { position: { x: number } }) => expect(n.position.x).toBe(0))
  })

  // Scenario: Doelveldknooppunten zichtbaar na laden doelschema
  it('genereert een node per doelveld met positie rechts', () => {
    const wrapper = mount(KoppelingsCanvas, {
      props: { sourceFields: [], targetFields },
      ...mountOptions,
    })
    const nodes = wrapper.vm.nodes
    const targetNodes = nodes.filter((n: { id: string }) => n.id.startsWith('tgt-'))
    expect(targetNodes).toHaveLength(targetFields.length)
    targetNodes.forEach((n: { position: { x: number } }) => expect(n.position.x).toBeGreaterThan(0))
  })
})
