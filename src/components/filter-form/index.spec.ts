import { flushPromises, mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { describe, expect, it } from 'vitest'
import FilterForm from './index.vue'
import type { FilterField } from './types'

const fields: FilterField[] = [
  { name: 'name', label: 'Nombre', type: 'text' },
  {
    name: 'type',
    label: 'Tipo',
    type: 'select',
    options: [
      { label: 'Efectivo', value: 'cash' },
      { label: 'Transferencia', value: 'transfer' },
    ],
    required: true,
  },
]

function mountFilterForm(propsFields = fields) {
  return mount(FilterForm, {
    props: { fields: propsFields },
    global: {
      plugins: [Quasar],
    },
  })
}

describe('FilterForm', () => {
  it('renders fields from props', () => {
    const wrapper = mountFilterForm()

    expect(wrapper.find('[data-testid="filter-name"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="filter-type"]').exists()).toBe(true)
  })

  it('does not emit search when a required field is empty', async () => {
    const wrapper = mountFilterForm()

    await wrapper.get('[data-testid="filter-form"]').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('search')).toBeUndefined()
  })

  it('emits search without empty fields', async () => {
    const wrapper = mountFilterForm([
      { name: 'name', label: 'Nombre', type: 'text' },
    ])

    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue('visa')
    await wrapper.get('[data-testid="filter-form"]').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('search')?.[0]).toEqual([{ name: 'visa' }])
  })

  it('resets fields and emits clear', async () => {
    const wrapper = mountFilterForm([
      { name: 'name', label: 'Nombre', type: 'text' },
    ])

    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue('visa')
    await wrapper.get('[data-testid="filter-clear"]').trigger('click')
    await flushPromises()

    expect((inputs[0]?.element as HTMLInputElement).value).toBe('')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })
})
