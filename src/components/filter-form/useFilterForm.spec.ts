import type { QForm } from 'quasar'
import { describe, expect, it, vi } from 'vitest'
import { useFilterForm } from './useFilterForm'

function setupFilterForm() {
  const emit = vi.fn()
  const form = useFilterForm(emit)

  return { emit, ...form }
}

describe('useFilterForm', () => {
  it('does not emit search when the form is invalid', async () => {
    const { emit, formRef, onSearch } = setupFilterForm()
    formRef.value = { validate: async () => false } as QForm

    await onSearch()

    expect(emit).not.toHaveBeenCalled()
  })

  it('emits a clean search payload when the form is valid', async () => {
    const { emit, values, formRef, onSearch } = setupFilterForm()
    values.name = 'visa'
    values.type = ''
    formRef.value = { validate: async () => true } as QForm

    await onSearch()

    expect(emit).toHaveBeenCalledWith('search', {
      name: 'visa',
    })
  })

  it('resets values and emits clear', () => {
    const resetValidation = vi.fn()
    const { emit, values, formRef, onClear } = setupFilterForm()
    values.name = 'visa'
    values.type = 'cash'
    formRef.value = { resetValidation } as unknown as QForm

    onClear()

    expect(values).toEqual({ name: '', type: '' })
    expect(resetValidation).toHaveBeenCalled()
    expect(emit).toHaveBeenCalledWith('clear')
  })
})
