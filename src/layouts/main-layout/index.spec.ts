import { mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import MainLayout from './index.vue'

const push = vi.fn()
const logout = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    logout,
    user: { value: { id: 'user-1', username: 'admin' } },
  }),
}))

vi.mock('pinia', async () => {
  const actual = await vi.importActual<typeof import('pinia')>('pinia')
  return {
    ...actual,
    storeToRefs: (store: { user: unknown }) => ({
      user: store.user,
    }),
  }
})

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs out and redirects to login', async () => {
    const wrapper = mount(MainLayout, {
      global: {
        plugins: [Quasar],
        stubs: {
          'router-view': true,
        },
      },
    })

    await wrapper.get('[data-testid="logout-button"]').trigger('click')

    expect(logout).toHaveBeenCalledTimes(1)
    expect(push).toHaveBeenCalledWith('/login')
  })
})
