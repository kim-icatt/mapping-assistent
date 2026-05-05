import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import AISuggestionPanel from '../AISuggestionPanel.vue'
import { useAISuggestions } from '@/composables/useAISuggestions'
import { useMappings } from '@/composables/useMappings'
import type { SchemaField, AiSuggestion } from '@/types'

const sourceFields: SchemaField[] = [
  { id: 'src-1', name: 'identificatie', path: 'Zaak.identificatie', dataType: 'string', required: true },
]
const targetFields: SchemaField[] = [
  { id: 'tgt-1', name: 'uuid', path: 'Zaak.uuid', dataType: 'string', required: true },
  { id: 'tgt-2', name: 'omschrijving', path: 'Zaak.omschrijving', dataType: 'string', required: true },
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
    expect(wrapper.text()).toContain('identificatie')
    expect(wrapper.text()).toContain('uuid')
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

  // Scenario: Accepted suggestion appears on the canvas (mapping store updated)
  it('creates a field mapping when Accepteer is clicked on a suggestion card', async () => {
    const wrapper = mountPanel()
    const aiStore = useAISuggestions()
    const mappingsStore = useMappings()
    aiStore.suggestions = [
      { id: 'sug-1', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.97, status: 'pending' },
    ] as AiSuggestion[]
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="accept-button"]').trigger('click')

    expect(mappingsStore.mappings).toHaveLength(1)
    expect(mappingsStore.mappings[0]).toMatchObject({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })
    expect(aiStore.suggestions).toHaveLength(0)
  })

  // Scenario: Rejected suggestion disappears
  it('removes the suggestion when Afwijzen is clicked', async () => {
    const wrapper = mountPanel()
    const aiStore = useAISuggestions()
    const mappingsStore = useMappings()
    aiStore.suggestions = [
      { id: 'sug-1', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.97, status: 'pending' },
    ] as AiSuggestion[]
    await wrapper.vm.$nextTick()

    await wrapper.find('[data-testid="reject-button"]').trigger('click')

    expect(aiStore.suggestions).toHaveLength(0)
    expect(mappingsStore.mappings).toHaveLength(0)
  })

  // Scenario: Rate is updated after acceptance
  describe('acceptance rate display', () => {
    it('shows acceptance rate bar when totalGenerated > 0', async () => {
      const wrapper = mountPanel()
      const aiStore = useAISuggestions()
      aiStore.suggestions = [
        { id: 'sug-1', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.97, status: 'pending' },
      ] as AiSuggestion[]
      aiStore.totalGenerated = 1
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="acceptance-rate"]').exists()).toBe(true)
    })

    it('shows "0 geaccepteerd" and "0 afgewezen" initially', async () => {
      const wrapper = mountPanel()
      const aiStore = useAISuggestions()
      aiStore.suggestions = [
        { id: 'sug-1', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.97, status: 'pending' },
      ] as AiSuggestion[]
      aiStore.totalGenerated = 1
      await wrapper.vm.$nextTick()

      const bar = wrapper.find('[data-testid="acceptance-rate"]')
      expect(bar.text()).toContain('0 geaccepteerd')
      expect(bar.text()).toContain('0 afgewezen')
    })

    it('updates rate display after accepting a suggestion', async () => {
      const wrapper = mountPanel()
      const aiStore = useAISuggestions()
      aiStore.suggestions = [
        { id: 'sug-1', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.97, status: 'pending' },
      ] as AiSuggestion[]
      aiStore.totalGenerated = 1
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="accept-button"]').trigger('click')
      await wrapper.vm.$nextTick()

      const bar = wrapper.find('[data-testid="acceptance-rate"]')
      expect(bar.text()).toContain('1 geaccepteerd')
      expect(bar.text()).toContain('0 afgewezen')
    })

    // Scenario: Rate is updated after rejection
    it('updates rate display after rejecting a suggestion', async () => {
      const wrapper = mountPanel()
      const aiStore = useAISuggestions()
      aiStore.suggestions = [
        { id: 'sug-1', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.97, status: 'pending' },
        { id: 'sug-2', sourceFieldId: 'src-1', targetFieldId: 'tgt-2', confidenceScore: 0.80, status: 'pending' },
      ] as AiSuggestion[]
      aiStore.totalGenerated = 2
      aiStore.accepted = 1
      await wrapper.vm.$nextTick()

      await wrapper.find('[data-testid="reject-button"]').trigger('click')
      await wrapper.vm.$nextTick()

      const bar = wrapper.find('[data-testid="acceptance-rate"]')
      expect(bar.text()).toContain('1 geaccepteerd')
      expect(bar.text()).toContain('1 afgewezen')
    })

    it('does not show acceptance rate bar before any suggestions are generated', async () => {
      const wrapper = mountPanel()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('[data-testid="acceptance-rate"]').exists()).toBe(false)
    })
  })

  // Confidence threshold filtering
  describe('confidence threshold', () => {
    it('does not render suggestions with confidenceScore below 0.70', async () => {
      const wrapper = mountPanel()
      const aiStore = useAISuggestions()
      aiStore.suggestions = [
        { id: 'low', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.65, status: 'pending' },
      ] as AiSuggestion[]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[data-testid="suggestion-card"]')).toHaveLength(0)
    })

    it('renders suggestions with confidenceScore of exactly 0.70', async () => {
      const wrapper = mountPanel()
      const aiStore = useAISuggestions()
      aiStore.suggestions = [
        { id: 'threshold', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.70, status: 'pending' },
      ] as AiSuggestion[]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[data-testid="suggestion-card"]')).toHaveLength(1)
    })

    it('only renders suggestions at or above the 0.70 threshold', async () => {
      const wrapper = mountPanel()
      const aiStore = useAISuggestions()
      aiStore.suggestions = [
        { id: 'high', sourceFieldId: 'src-1', targetFieldId: 'tgt-1', confidenceScore: 0.90, status: 'pending' },
        { id: 'low', sourceFieldId: 'src-1', targetFieldId: 'tgt-2', confidenceScore: 0.50, status: 'pending' },
      ] as AiSuggestion[]
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[data-testid="suggestion-card"]')).toHaveLength(1)
    })
  })
})
