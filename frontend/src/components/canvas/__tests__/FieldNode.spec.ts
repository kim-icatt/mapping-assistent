import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FieldNode from '../FieldNode.vue'

const defaultProps = {
  data: { name: 'omschrijving', dataType: 'string', required: false },
  fieldId: 'src-1',
  side: 'source' as const,
  selected: false,
}

describe('FieldNode', () => {
  // Scenario: Field name and data type visible per node
  it('shows the field name', () => {
    const wrapper = mount(FieldNode, { props: defaultProps })
    expect(wrapper.text()).toContain('omschrijving')
  })

  it('shows the field data type', () => {
    const wrapper = mount(FieldNode, { props: defaultProps })
    // type badge shows abbreviated label (e.g. 'str' for 'string')
    expect(wrapper.text()).toContain('str')
  })

  // Scenario: Required field has marker
  it('shows no REQ marker when the field is not required', () => {
    const wrapper = mount(FieldNode, { props: defaultProps })
    expect(wrapper.find('[data-testid="req-badge"]').exists()).toBe(false)
  })

  it('shows a REQ marker when the field is required', () => {
    const wrapper = mount(FieldNode, {
      props: { ...defaultProps, data: { name: 'startDatum', dataType: 'date', required: true } },
    })
    expect(wrapper.find('[data-testid="req-badge"]').exists()).toBe(true)
  })

  // Scenario: Source field has selection state after click
  it('exposes data-field-id and data-field-side attributes', () => {
    const wrapper = mount(FieldNode, { props: defaultProps })
    expect(wrapper.attributes('data-field-id')).toBe('src-1')
    expect(wrapper.attributes('data-field-side')).toBe('source')
  })

  it('applies selected styling when selected is true', () => {
    const wrapper = mount(FieldNode, {
      props: { ...defaultProps, selected: true },
    })
    expect(wrapper.classes()).toContain('bg-blue-50')
    expect(wrapper.classes()).toContain('ring-1')
  })

  it('does not apply selected styling when selected is false', () => {
    const wrapper = mount(FieldNode, { props: defaultProps })
    expect(wrapper.classes()).not.toContain('bg-blue-50')
  })

  it('emits field-click with the fieldId when clicked', async () => {
    const wrapper = mount(FieldNode, { props: defaultProps })
    await wrapper.trigger('click')
    expect(wrapper.emitted('field-click')).toBeTruthy()
    expect(wrapper.emitted('field-click')![0]).toEqual(['src-1'])
  })
})
