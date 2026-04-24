import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConnectionLines from '../ConnectionLines.vue'
import { useMappings } from '@/composables/useMappings'

function mountWithContainers() {
  const pinia = createPinia()
  setActivePinia(pinia)

  // Add scroll containers so attachScrollListeners has elements to bind
  const source = document.createElement('div')
  source.setAttribute('data-scroll-container', '')
  document.body.appendChild(source)

  const target = document.createElement('div')
  target.setAttribute('data-scroll-container', '')
  document.body.appendChild(target)

  const wrapper = mount(ConnectionLines, {
    global: { plugins: [pinia] },
    attachTo: document.body,
  })

  return { wrapper, source, target }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
  document.querySelectorAll('[data-scroll-container]').forEach((el) => el.remove())
  document.querySelectorAll('[data-field-id]').forEach((el) => el.remove())
})

describe('ConnectionLines', () => {
  it('renders the SVG element', () => {
    const { wrapper } = mountWithContainers()
    expect(wrapper.find('[data-testid="connection-lines-svg"]').exists()).toBe(true)
  })

  it('renders no paths when there are no mappings', () => {
    const { wrapper } = mountWithContainers()
    expect(wrapper.findAll('[data-testid="connection-path"]')).toHaveLength(0)
  })

  it('renders one path per mapping after mappings are added', async () => {
    // Attach field elements with matching data attributes so getBoundingClientRect is called
    const srcEl = document.createElement('div')
    srcEl.setAttribute('data-field-id', 'src-1')
    srcEl.setAttribute('data-field-side', 'source')
    document.body.appendChild(srcEl)

    const tgtEl = document.createElement('div')
    tgtEl.setAttribute('data-field-id', 'tgt-1')
    tgtEl.setAttribute('data-field-side', 'target')
    document.body.appendChild(tgtEl)

    const { wrapper } = mountWithContainers()
    const store = useMappings()
    store.createMapping({ sourceFieldId: 'src-1', targetFieldId: 'tgt-1' })

    await flushPromises()
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('[data-testid="connection-path"]')).toHaveLength(1)
  })

  it('attaches scroll listeners and cleans up on unmount', () => {
    const addSpy = vi.spyOn(EventTarget.prototype, 'addEventListener')
    const removeSpy = vi.spyOn(EventTarget.prototype, 'removeEventListener')

    const { wrapper } = mountWithContainers()

    // scroll containers should have scroll listeners attached
    const scrollBindings = addSpy.mock.calls.filter(([ev]) => ev === 'scroll')
    expect(scrollBindings.length).toBeGreaterThan(0)

    wrapper.unmount()

    const scrollRemovals = removeSpy.mock.calls.filter(([ev]) => ev === 'scroll')
    expect(scrollRemovals.length).toBeGreaterThan(0)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
