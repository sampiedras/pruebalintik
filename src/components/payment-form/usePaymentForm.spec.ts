import type { QForm } from 'quasar'
import { describe, expect, it, vi } from 'vitest'
import type { PaymentMethod } from '@/types/payment'
import { usePaymentForm } from './usePaymentForm'

const samplePayment: PaymentMethod = {
  id: 'pay-1',
  name: 'Visa Corporativa',
  type: 'credit_card',
  status: 'active',
  description: 'Principal',
  createdAt: '2024-01-12T15:30:00.000Z',
}

function setupPaymentForm() {
  const emit = vi.fn()
  const form = usePaymentForm(emit)

  return { emit, ...form }
}

describe('usePaymentForm', () => {
  it('fills the form from a payment', () => {
    const { values, fill } = setupPaymentForm()

    fill(samplePayment)

    expect(values).toEqual({
      name: 'Visa Corporativa',
      type: 'credit_card',
      status: 'active',
      description: 'Principal',
    })
  })

  it('maps the status toggle to active and inactive', () => {
    const { values, isActive } = setupPaymentForm()

    expect(isActive.value).toBe(true)

    isActive.value = false
    expect(values.status).toBe('inactive')

    isActive.value = true
    expect(values.status).toBe('active')
  })

  it('resets the form to empty values', () => {
    const resetValidation = vi.fn()
    const { values, formRef, fill, resetForm } = setupPaymentForm()
    formRef.value = { resetValidation } as unknown as QForm
    fill(samplePayment)

    resetForm()

    expect(values).toEqual({
      name: '',
      type: '',
      status: 'active',
      description: '',
    })
    expect(resetValidation).toHaveBeenCalled()
  })

  it('does not emit when the form is invalid', async () => {
    const { emit, formRef, onSubmit } = setupPaymentForm()
    formRef.value = { validate: async () => false } as QForm

    await onSubmit()

    expect(emit).not.toHaveBeenCalled()
  })

  it('emits payload without empty description and keeps loading until finish', async () => {
    const { emit, values, formRef, loading, onSubmit, finishSubmit } = setupPaymentForm()
    values.name = 'Nuevo'
    values.type = 'cash'
    values.description = ''
    formRef.value = { validate: async () => true } as QForm

    await onSubmit()

    expect(emit).toHaveBeenCalledWith('submit', {
      name: 'Nuevo',
      type: 'cash',
      status: 'active',
    })
    expect(loading.value).toBe(true)

    finishSubmit()

    expect(loading.value).toBe(false)
  })

  it('ignores a second submit while loading', async () => {
    const { emit, values, formRef, onSubmit } = setupPaymentForm()
    values.name = 'Nuevo'
    values.type = 'cash'
    formRef.value = { validate: async () => true } as QForm

    await onSubmit()
    await onSubmit()

    expect(emit).toHaveBeenCalledTimes(1)
  })
})
