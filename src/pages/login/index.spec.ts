import { flushPromises, mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { describe, expect, it, vi } from 'vitest'
import LoginPage from './index.vue'

const handleSubmit = vi.fn()

vi.mock('./useLoginPage', () => ({
  useLoginPage: () => ({
    handleSubmit,
  }),
}))

describe('LoginPage', () => {
  it('renders the login form and forwards submit', async () => {
    const wrapper = mount(LoginPage, {
      global: {
        plugins: [Quasar],
      },
    })

    expect(wrapper.find('[data-testid="login-page"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="login-form"]').exists()).toBe(true)

    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue('admin')
    await inputs[1]?.setValue('admin123')
    await wrapper.get('[data-testid="login-form"]').trigger('submit.prevent')
    await flushPromises()

    expect(handleSubmit).toHaveBeenCalledWith({
      username: 'admin',
      password: 'admin123',
    })
  })
})
