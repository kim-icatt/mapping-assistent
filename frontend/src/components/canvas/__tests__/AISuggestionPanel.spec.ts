import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AISuggestionPanel from '../AISuggestionPanel.vue'
import { useAISuggestions } from '@/composables/useAISuggestions'
import { useMappings } from '@/composables/useMappings'
import type { SchemaField, AiSuggestion } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'customerId', path: 'customerId', dataType: 'string', required: true },
]
const targetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'client_id', path: 'client_id', dataType: 'string', required: true },
  { id: 'tgt-2', name: 'uuid', path: 'uuid', dataType: 'string', required: true },
]

function mountPanel(props = { sourceFields, targetFields }) {
  return mount(AISuggestionPanel, {
    global: { plugins: [createPinia()] },
    props,
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('AISuggestionPanel', () => {
  // Scenario: Panel shows generate button when no suggestions and unmapped fields exist
  it('shows the generate button when there are unmapped target fields and no suggestions', () => {
    const wrapper = mountPanel()
    expect(wrapper.find('[data-testid="generate-button"]').exists()).toBe(true)
  })

  // Scenario: Loading state appears while fetching
  it('shows a loading state while fetching', async () => {
    const wrapper = mountPanel()
    const aiStore = useAISuggestions()
    aiStore.isLoading = true
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="loading-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="generate-button"]').exists()).toBe(false)
  })

  // Scenario: Suggestion list shown after generation
  it('shows suggestion cards after suggestions are returned', async () => {
    const wrapper = mountPanel()
    const aiStore = useAISuggestions()
    aiStore.suggestions = [
      { id: '1', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.97, status: 'pending' },
    ] as AiSuggestion[]
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="suggestion-card"]')).toHaveLength(1)
    expect(wrapper.text()).toContain('customerId')
    expect(wrapper.text()).toContain('client_id')
  })

  // Scenario: Empty state when no unmapped target fields
  it('shows empty state when all target fields are already mapped', async () => {
    const wrapper = mountPanel()
    const mappingsStore = useMappings()
    mappingsStore.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    // Simulate tgt-2 also mapped
    mappingsStore.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-2' })
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="generate-button"]').exists()).toBe(false)
  })

  it('calls generateSuggestions when generate button is clicked', async () => {
    const wrapper = mountPanel()
    const aiStore = useAISuggestions()
    const spy = vi.spyOn(aiStore, 'generateSuggestions').mockResolvedValue([])
    await wrapper.find('[data-testid="generate-button"]').trigger('click')
    expect(spy).toHaveBeenCalledOnce()
  })
})
