import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import VeldKnooppunt from '../VeldKnooppunt.vue'

const defaultProps = {
  data: { name: 'omschrijving', dataType: 'string', required: false },
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
      props: { data: { name: 'startDatum', dataType: 'date', required: true } },
    })
    expect(wrapper.find('[data-testid="req-badge"]').exists()).toBe(true)
  })
})
