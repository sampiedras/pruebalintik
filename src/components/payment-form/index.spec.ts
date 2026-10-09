import { flushPromises, mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { describe, expect, it } from 'vitest'
import PaymentForm from './index.vue'

function mountPaymentForm() {
  return mount(PaymentForm, {
    global: {
      plugins: [Quasar],
    },
  })
}

describe('PaymentForm', () => {
  it('does not emit submit when required fields are empty', async () => {
    const wrapper = mountPaymentForm()

    await wrapper.get('[data-testid="payment-form"]').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('renders a status toggle instead of a select', () => {
    const wrapper = mountPaymentForm()

    expect(wrapper.find('[data-testid="payment-status"]').exists()).toBe(true)
    expect(wrapper.find('select').exists()).toBe(false)
  })

  it('exposes fill, resetForm and finishSubmit', () => {
    const wrapper = mountPaymentForm()

    expect(typeof wrapper.vm.fill).toBe('function')
    expect(typeof wrapper.vm.resetForm).toBe('function')
    expect(typeof wrapper.vm.finishSubmit).toBe('function')
  })
})
