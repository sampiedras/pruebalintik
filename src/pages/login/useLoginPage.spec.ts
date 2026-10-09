import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLoginPage } from './useLoginPage'

const push = vi.fn()
const login = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push,
  }),
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    login,
  }),
}))

describe('useLoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs in and navigates to the home route', async () => {
    login.mockResolvedValue(undefined)
    const { handleSubmit } = useLoginPage()

    await handleSubmit({ username: 'admin', password: 'admin123' })

    expect(login).toHaveBeenCalledWith({ username: 'admin', password: 'admin123' })
    expect(push).toHaveBeenCalledWith({ name: 'home' })
  })

  it('does not navigate when login fails', async () => {
    login.mockRejectedValue(new Error('Credenciales inválidas'))
    const { handleSubmit } = useLoginPage()

    await expect(
      handleSubmit({ username: 'admin', password: 'wrong' }),
    ).rejects.toThrow('Credenciales inválidas')

    expect(push).not.toHaveBeenCalled()
  })
})
