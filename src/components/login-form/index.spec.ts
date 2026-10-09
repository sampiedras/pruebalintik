import { flushPromises, mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { describe, expect, it } from 'vitest'
import LoginForm from './index.vue'

function mountLoginForm() {
  return mount(LoginForm, {
    global: {
      plugins: [Quasar],
    },
  })
}

async function fillLoginForm(
  wrapper: ReturnType<typeof mountLoginForm>,
  username: string,
  password: string,
): Promise<void> {
  const inputs = wrapper.findAll('input')
  await inputs[0]?.setValue(username)
  await inputs[1]?.setValue(password)
  await flushPromises()
}

describe('LoginForm', () => {
  it('does not emit submit when required fields are empty', async () => {
    const wrapper = mountLoginForm()

    await wrapper.get('[data-testid="login-form"]').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits credentials when the form is valid', async () => {
    const wrapper = mountLoginForm()

    await fillLoginForm(wrapper, 'admin', 'admin123')
    await wrapper.get('[data-testid="login-form"]').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { username: 'admin', password: 'admin123' },
    ])
  })
})
