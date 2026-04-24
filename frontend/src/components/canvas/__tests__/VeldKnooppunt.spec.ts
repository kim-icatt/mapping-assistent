import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VeldKnooppunt from '../VeldKnooppunt.vue'

const defaultProps = {
  data: { name: 'omschrijving', dataType: 'string', required: false },
  fieldId: 'src-1',
  side: 'source' as const,
  selected: false,
}

describe('VeldKnooppunt', () => {
  // Scenario: Veldnaam en datatype zichtbaar per knooppunt
  it('toont de veldnaam', () => {
    const wrapper = mount(VeldKnooppunt, { props: defaultProps })
    expect(wrapper.text()).toContain('omschrijving')
  })

  it('toont het datatype van het veld', () => {
    const wrapper = mount(VeldKnooppunt, { props: defaultProps })
    // type badge shows abbreviated label (e.g. 'str' for 'string')
    expect(wrapper.text()).toContain('str')
  })

  // Scenario: Verplicht veld heeft markering
  it('toont geen REQ-markering als het veld niet verplicht is', () => {
    const wrapper = mount(VeldKnooppunt, { props: defaultProps })
    expect(wrapper.find('[data-testid="req-badge"]').exists()).toBe(false)
  })

  it('toont een REQ-markering als het veld verplicht is', () => {
    const wrapper = mount(VeldKnooppunt, {
      props: { ...defaultProps, data: { name: 'startDatum', dataType: 'date', required: true } },
    })
    expect(wrapper.find('[data-testid="req-badge"]').exists()).toBe(true)
  })

  // Scenario: Source field has selection state after click
  it('exposes data-field-id and data-field-side attributes', () => {
    const wrapper = mount(VeldKnooppunt, { props: defaultProps })
    expect(wrapper.attributes('data-field-id')).toBe('src-1')
    expect(wrapper.attributes('data-field-side')).toBe('source')
  })

  it('applies selected styling when selected is true', () => {
    const wrapper = mount(VeldKnooppunt, {
      props: { ...defaultProps, selected: true },
    })
    expect(wrapper.classes()).toContain('bg-blue-50')
    expect(wrapper.classes()).toContain('ring-1')
  })

  it('does not apply selected styling when selected is false', () => {
    const wrapper = mount(VeldKnooppunt, { props: defaultProps })
    expect(wrapper.classes()).not.toContain('bg-blue-50')
  })

  it('emits field-click with the fieldId when clicked', async () => {
    const wrapper = mount(VeldKnooppunt, { props: defaultProps })
    await wrapper.trigger('click')
    expect(wrapper.emitted('field-click')).toBeTruthy()
    expect(wrapper.emitted('field-click')![0]).toEqual(['src-1'])
  })
})
