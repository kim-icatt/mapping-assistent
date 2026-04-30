import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import ConnectionLines from '../ConnectionLines.vue'
import { useMappings } from '@/composables/useMappings'

function mountWithContainers() {
  const pinia = createPinia()
  setActivePinia(pinia)

  const wrapper = mount(ConnectionLines, {
    global: { plugins: [pinia] },
    attachTo: document.body,
  })

  return { wrapper }
}

beforeEach(() => {
  setActivePinia(createPinia())
})

afterEach(() => {
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

  it('attaches a capture scroll listener on the parent and removes it on unmount', () => {
    const addSpy = vi.spyOn(EventTarget.prototype, 'addEventListener')
    const removeSpy = vi.spyOn(EventTarget.prototype, 'removeEventListener')

    const { wrapper } = mountWithContainers()

    const scrollAdded = addSpy.mock.calls.filter(([ev, , opts]) => ev === 'scroll' && (opts as AddEventListenerOptions)?.capture)
    expect(scrollAdded.length).toBeGreaterThan(0)

    wrapper.unmount()

    const scrollRemoved = removeSpy.mock.calls.filter(([ev, , opts]) => ev === 'scroll' && (opts as EventListenerOptions)?.capture)
    expect(scrollRemoved.length).toBeGreaterThan(0)

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
