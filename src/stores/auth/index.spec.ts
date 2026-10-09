import { createPinia, setActivePinia } from 'pinia'
import { Notify } from 'quasar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loginMock } from '@/mocks/services'
import { AUTH_SESSION_KEY } from '@/utils/auth-session'
import { useAuthStore } from './index'

vi.mock('@/mocks/services', () => ({
  loginMock: vi.fn(),
}))

vi.mock('quasar', async () => {
  const actual = await vi.importActual<typeof import('quasar')>('quasar')
  return {
    ...actual,
    Notify: {
      create: vi.fn(),
    },
  }
})

describe('useAuthStore', () => {
  beforeEach(() => {
    sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('restores the session from cache on init', () => {
    sessionStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({ id: 'user-1', username: 'admin' }),
    )
    setActivePinia(createPinia())

    const store = useAuthStore()

    expect(store.user).toEqual({ id: 'user-1', username: 'admin' })
    expect(store.isAuthenticated).toBe(true)
  })

  it('stores the session user after a successful login', async () => {
    vi.mocked(loginMock).mockResolvedValue({ id: 'user-1', username: 'admin' })
    const store = useAuthStore()

    await store.login({ username: 'admin', password: 'admin123' })

    expect(store.user).toEqual({ id: 'user-1', username: 'admin' })
    expect(store.isAuthenticated).toBe(true)
    expect(store.loading).toBe(false)
    expect(JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY) ?? 'null')).toEqual({
      id: 'user-1',
      username: 'admin',
    })
  })

  it('clears the session and notifies on login failure', async () => {
    vi.mocked(loginMock).mockRejectedValue(new Error('Credenciales inválidas'))
    const store = useAuthStore()
    store.user = { id: 'tmp', username: 'tmp' }
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(store.user))

    await expect(
      store.login({ username: 'admin', password: 'wrong' }),
    ).rejects.toThrow('Credenciales inválidas')

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull()
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'negative',
        message: 'Credenciales inválidas',
      }),
    )
  })

  it('clears the session on logout', () => {
    const store = useAuthStore()
    store.user = { id: 'user-1', username: 'admin' }
    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(store.user))

    store.logout()

    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull()
  })
})
