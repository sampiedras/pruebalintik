import { mount } from '@vue/test-utils'
import { Dialog } from 'quasar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import type { PaymentMethod } from '@/types/payment'
import { usePaymentsPage } from './usePaymentsPage'

const fetchPayments = vi.fn()
const toggleStatus = vi.fn()
const createPayment = vi.fn()
const updatePayment = vi.fn()
const removePayment = vi.fn()
let confirmCallback: (() => void) | null = null

vi.mock('@/stores/payment', () => ({
  usePaymentStore: () => ({
    items: ref([]),
    loading: ref(false),
    fetchPayments,
    toggleStatus,
    createPayment,
    updatePayment,
    removePayment,
  }),
}))

vi.mock('pinia', async () => {
  const originalPinia = await vi.importActual<typeof import('pinia')>('pinia')
  return {
    ...originalPinia,
    storeToRefs: (store: { items: unknown; loading: unknown }) => ({
      items: store.items,
      loading: store.loading,
    }),
  }
})

vi.mock('quasar', async () => {
  const originalQuasar = await vi.importActual<typeof import('quasar')>('quasar')
  return {
    ...originalQuasar,
    Dialog: {
      create: vi.fn(() => ({
        onOk: (callback: () => void) => {
          confirmCallback = callback
          return { onCancel: vi.fn() }
        },
      })),
    },
  }
})

const samplePayment: PaymentMethod = {
  id: 'pay-1',
  name: 'Visa Corporativa',
  type: 'credit_card',
  status: 'active',
  createdAt: '2024-01-12T15:30:00.000Z',
}

function setupPaymentsPage() {
  let api!: ReturnType<typeof usePaymentsPage>

  mount(
    defineComponent({
      setup() {
        api = usePaymentsPage()
        return () => null
      },
    }),
  )

  return api
}

describe('usePaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    confirmCallback = null
    fetchPayments.mockResolvedValue(undefined)
    toggleStatus.mockResolvedValue(undefined)
    createPayment.mockResolvedValue(undefined)
    updatePayment.mockResolvedValue(undefined)
    removePayment.mockResolvedValue(undefined)
  })

  it('loads payments on mount', () => {
    setupPaymentsPage()

    expect(fetchPayments).toHaveBeenCalledWith({})
  })

  it('exposes pagination with 15 rows per page', () => {
    const { pagination } = setupPaymentsPage()

    expect(pagination.value).toEqual({
      page: 1,
      rowsPerPage: 15,
    })
  })

  it('maps search payload into payment filters', async () => {
    const { handleSearch } = setupPaymentsPage()

    await handleSearch({
      name: 'visa',
      type: 'credit_card',
      status: 'active',
    })

    expect(fetchPayments).toHaveBeenLastCalledWith({
      name: 'visa',
      type: 'credit_card',
      status: 'active',
    })
  })

  it('reloads the full list on clear', async () => {
    const { handleClear } = setupPaymentsPage()

    await handleClear()

    expect(fetchPayments).toHaveBeenLastCalledWith({})
  })

  it('delegates status toggle to the store', async () => {
    const { handleToggleStatus } = setupPaymentsPage()

    await handleToggleStatus('pay-1')

    expect(toggleStatus).toHaveBeenCalledWith('pay-1')
  })

  it('creates a payment and closes the dialog', async () => {
    const page = setupPaymentsPage()
    page.dialogOpen.value = true

    await page.handleFormSubmit({ name: 'Nuevo', type: 'cash', status: 'active' })

    expect(createPayment).toHaveBeenCalledWith({
      name: 'Nuevo',
      type: 'cash',
      status: 'active',
    })
    expect(page.dialogOpen.value).toBe(false)
  })

  it('updates a payment when editing', async () => {
    const page = setupPaymentsPage()
    const fill = vi.fn()
    page.paymentFormRef.value = { resetForm: vi.fn(), fill, finishSubmit: vi.fn() }

    await page.openEditDialog(samplePayment)
    await page.handleFormSubmit({
      name: 'Editado',
      type: 'transfer',
      status: 'inactive',
    })

    expect(fill).toHaveBeenCalledWith(samplePayment)
    expect(updatePayment).toHaveBeenCalledWith('pay-1', {
      name: 'Editado',
      type: 'transfer',
      status: 'inactive',
    })
  })

  it('does not remove until the dialog is confirmed', () => {
    const { handleRemove } = setupPaymentsPage()

    handleRemove(samplePayment)

    expect(Dialog.create).toHaveBeenCalled()
    expect(removePayment).not.toHaveBeenCalled()

    confirmCallback?.()

    expect(removePayment).toHaveBeenCalledWith('pay-1')
  })
})
