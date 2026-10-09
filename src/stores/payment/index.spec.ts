import { createPinia, setActivePinia } from 'pinia'
import { Notify } from 'quasar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createPaymentMock,
  deletePaymentMock,
  listPaymentsMock,
  updatePaymentMock,
  updatePaymentStatusMock,
} from '@/mocks/services'
import type { PaymentMethod } from '@/types/payment'
import { usePaymentStore } from './index'

vi.mock('@/mocks/services', () => ({
  listPaymentsMock: vi.fn(),
  updatePaymentStatusMock: vi.fn(),
  createPaymentMock: vi.fn(),
  updatePaymentMock: vi.fn(),
  deletePaymentMock: vi.fn(),
}))

vi.mock('quasar', async () => {
  const originalQuasar = await vi.importActual<typeof import('quasar')>('quasar')
  return {
    ...originalQuasar,
    Notify: {
      create: vi.fn(),
    },
  }
})

const samplePayments: PaymentMethod[] = [
  {
    id: 'pay-1',
    name: 'Visa Corporativa',
    type: 'credit_card',
    status: 'active',
    createdAt: '2024-01-12T15:30:00.000Z',
  },
  {
    id: 'pay-2',
    name: 'Efectivo caja',
    type: 'cash',
    status: 'inactive',
    createdAt: '2024-02-20T18:45:00.000Z',
  },
]

describe('usePaymentStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loads payments and stores the applied filters', async () => {
    vi.mocked(listPaymentsMock).mockResolvedValue(samplePayments)
    const store = usePaymentStore()

    await store.fetchPayments({ name: 'visa' })

    expect(listPaymentsMock).toHaveBeenCalledWith({ name: 'visa' })
    expect(store.items).toEqual(samplePayments)
    expect(store.filters).toEqual({ name: 'visa' })
    expect(store.loading).toBe(false)
  })

  it('notifies and rethrows when listing fails', async () => {
    vi.mocked(listPaymentsMock).mockRejectedValue(new Error('Error de conexión'))
    const store = usePaymentStore()

    await expect(store.fetchPayments()).rejects.toThrow('Error de conexión')

    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'negative',
        message: 'Error de conexión',
      }),
    )
  })

  it('toggles status on the item and syncs the mock', async () => {
    vi.mocked(listPaymentsMock).mockResolvedValue(structuredClone(samplePayments))
    vi.mocked(updatePaymentStatusMock).mockResolvedValue({
      ...samplePayments[0]!,
      status: 'inactive',
    })
    const store = usePaymentStore()
    await store.fetchPayments()

    await store.toggleStatus('pay-1')

    expect(store.items[0]?.status).toBe('inactive')
    expect(updatePaymentStatusMock).toHaveBeenCalledWith('pay-1', 'inactive')
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'positive',
        message: 'Estado cambiado a Inactivo',
      }),
    )
  })

  it('creates a payment and prepends it to items', async () => {
    const created: PaymentMethod = {
      id: 'pay-new',
      name: 'Nuevo',
      type: 'cash',
      status: 'active',
      createdAt: '2024-06-01T00:00:00.000Z',
    }
    vi.mocked(listPaymentsMock).mockResolvedValue(structuredClone(samplePayments))
    vi.mocked(createPaymentMock).mockResolvedValue(created)
    const store = usePaymentStore()
    await store.fetchPayments()

    await store.createPayment({ name: 'Nuevo', type: 'cash', status: 'active' })

    expect(createPaymentMock).toHaveBeenCalledWith({
      name: 'Nuevo',
      type: 'cash',
      status: 'active',
    })
    expect(store.items[0]).toEqual(created)
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'positive',
        message: 'Método de pago creado',
      }),
    )
  })

  it('updates a payment in items', async () => {
    const updated: PaymentMethod = {
      ...samplePayments[0]!,
      name: 'Visa Actualizada',
    }
    vi.mocked(listPaymentsMock).mockResolvedValue(structuredClone(samplePayments))
    vi.mocked(updatePaymentMock).mockResolvedValue(updated)
    const store = usePaymentStore()
    await store.fetchPayments()

    await store.updatePayment('pay-1', {
      name: 'Visa Actualizada',
      type: 'credit_card',
      status: 'active',
    })

    expect(store.items[0]?.name).toBe('Visa Actualizada')
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'positive',
        message: 'Método de pago actualizado',
      }),
    )
  })

  it('removes a payment from items', async () => {
    vi.mocked(listPaymentsMock).mockResolvedValue(structuredClone(samplePayments))
    vi.mocked(deletePaymentMock).mockResolvedValue(undefined)
    const store = usePaymentStore()
    await store.fetchPayments()

    await store.removePayment('pay-1')

    expect(deletePaymentMock).toHaveBeenCalledWith('pay-1')
    expect(store.items).toHaveLength(1)
    expect(store.items[0]?.id).toBe('pay-2')
    expect(Notify.create).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'positive',
        message: 'Método de pago eliminado',
      }),
    )
  })
})
