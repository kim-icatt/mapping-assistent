import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AISuggestionCard from '../AISuggestionCard.vue'

function mountCard(props: { sourceName: string; targetName: string; confidenceScore: number }) {
  return mount(AISuggestionCard, { props })
}

describe('AISuggestionCard', () => {
  it('displays source and target field names', () => {
    const wrapper = mountCard({ sourceName: 'customerId', targetName: 'client_id', confidenceScore: 0.97 })
    expect(wrapper.text()).toContain('customerId')
    expect(wrapper.text()).toContain('client_id')
  })

  it('shows Hoog badge for score ≥ 0.8', () => {
    const wrapper = mountCard({ sourceName: 'a', targetName: 'b', confidenceScore: 0.97 })
    const badge = wrapper.find('[data-testid="confidence-badge"]')
    expect(badge.text()).toContain('Hoog')
    expect(badge.text()).toContain('97%')
    expect(badge.classes().join(' ')).toMatch(/green/)
  })

  it('shows Middel badge for score 0.5–0.79', () => {
    const wrapper = mountCard({ sourceName: 'a', targetName: 'b', confidenceScore: 0.72 })
    const badge = wrapper.find('[data-testid="confidence-badge"]')
    expect(badge.text()).toContain('Middel')
    expect(badge.text()).toContain('72%')
    expect(badge.classes().join(' ')).toMatch(/amber/)
  })

  it('shows Laag badge for score < 0.5', () => {
    const wrapper = mountCard({ sourceName: 'a', targetName: 'b', confidenceScore: 0.3 })
    const badge = wrapper.find('[data-testid="confidence-badge"]')
    expect(badge.text()).toContain('Laag')
    expect(badge.text()).toContain('30%')
    expect(badge.classes().join(' ')).toMatch(/red/)
  })
})
