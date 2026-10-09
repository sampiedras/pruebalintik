import type { QForm } from 'quasar'
import { describe, expect, it, vi } from 'vitest'
import { useLoginForm } from './useLoginForm'

function setupLoginForm() {
  const emit = vi.fn()
  const form = useLoginForm(emit)

  return { emit, ...form }
}

describe('useLoginForm', () => {
  it('builds trimmed credentials', () => {
    const { credentials, toCredentials } = setupLoginForm()
    credentials.username = '  admin  '
    credentials.password = 'admin123'

    expect(toCredentials()).toEqual({
      username: 'admin',
      password: 'admin123',
    })
  })

  it('resets credentials to empty values', () => {
    const { credentials, reset } = setupLoginForm()
    credentials.username = 'admin'
    credentials.password = 'admin123'

    reset()

    expect(credentials).toEqual({
      username: '',
      password: '',
    })
  })

  it('does not emit when the form is invalid', async () => {
    const { emit, formRef, onSubmit, loading } = setupLoginForm()
    formRef.value = { validate: async () => false } as QForm

    await onSubmit()

    expect(emit).not.toHaveBeenCalled()
    expect(loading.value).toBe(false)
  })

  it('emits trimmed credentials when the form is valid', async () => {
    const { emit, credentials, formRef, onSubmit, loading } = setupLoginForm()
    credentials.username = '  admin  '
    credentials.password = 'admin123'
    formRef.value = { validate: async () => true } as QForm

    await onSubmit()

    expect(emit).toHaveBeenCalledWith('submit', {
      username: 'admin',
      password: 'admin123',
    })
    expect(loading.value).toBe(false)
  })

  it('sets loading while submit is in progress', async () => {
    const { emit, formRef, onSubmit, loading } = setupLoginForm()
    formRef.value = { validate: async () => true } as QForm

    emit.mockImplementation(() => {
      expect(loading.value).toBe(true)
    })

    await onSubmit()

    expect(loading.value).toBe(false)
  })
})
