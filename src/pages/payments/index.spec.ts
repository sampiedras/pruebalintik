import { flushPromises, mount } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import type { PaymentMethod } from '@/types/payment'
import PaymentsPage from './index.vue'

const handleSearch = vi.fn()
const handleClear = vi.fn()
const handleToggleStatus = vi.fn()
const openCreateDialog = vi.fn()
const openEditDialog = vi.fn()
const handleRemove = vi.fn()
const handleFormSubmit = vi.fn()
const closeDialog = vi.fn()

const items = ref<PaymentMethod[]>([
  {
    id: 'pay-1',
    name: 'Visa Corporativa',
    type: 'credit_card',
    status: 'active',
    createdAt: '2024-01-12T15:30:00.000Z',
  },
])

vi.mock('./usePaymentsPage', () => ({
  usePaymentsPage: () => ({
    items,
    loading: ref(false),
    pagination: ref({ page: 1, rowsPerPage: 15 }),
    dialogOpen: ref(false),
    dialogTitle: 'Nuevo método de pago',
    paymentFormRef: ref(null),
    handleSearch,
    handleClear,
    handleToggleStatus,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormSubmit,
    handleRemove,
  }),
}))

describe('PaymentsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the table with required columns and rows', () => {
    const wrapper = mount(PaymentsPage, {
      global: {
        plugins: [Quasar],
      },
    })

    expect(wrapper.find('[data-testid="payments-page"]').exists()).toBe(true)
    expect(wrapper.get('[data-testid="payments-table"]').text()).toContain('Nombre')
    expect(wrapper.get('[data-testid="payments-table"]').text()).toContain('Tipo')
    expect(wrapper.get('[data-testid="payments-table"]').text()).toContain('Estado')
    expect(wrapper.get('[data-testid="payments-table"]').text()).toContain(
      'Fecha de creación',
    )
    expect(wrapper.text()).toContain('Visa Corporativa')
    expect(wrapper.text()).toContain('Tarjeta de crédito')
  })

  it('forwards filter search and clear to the page composable', async () => {
    const wrapper = mount(PaymentsPage, {
      global: {
        plugins: [Quasar],
      },
    })

    const inputs = wrapper.findAll('input')
    await inputs[0]?.setValue('visa')
    await wrapper.get('[data-testid="filter-form"]').trigger('submit.prevent')
    await flushPromises()

    expect(handleSearch).toHaveBeenCalledWith({ name: 'visa' })

    await wrapper.get('[data-testid="filter-clear"]').trigger('click')
    await flushPromises()

    expect(handleClear).toHaveBeenCalled()
  })

  it('forwards create, edit, delete and toggle actions', async () => {
    const wrapper = mount(PaymentsPage, {
      global: {
        plugins: [Quasar],
      },
    })

    await wrapper.get('[data-testid="payment-create"]').trigger('click')
    expect(openCreateDialog).toHaveBeenCalled()

    await wrapper.get('[data-testid="payment-edit-pay-1"]').trigger('click')
    expect(openEditDialog).toHaveBeenCalled()

    await wrapper.get('[data-testid="payment-delete-pay-1"]').trigger('click')
    expect(handleRemove).toHaveBeenCalled()

    await wrapper.get('[data-testid="payment-toggle-pay-1"]').trigger('click')
    await flushPromises()
    expect(handleToggleStatus).toHaveBeenCalledWith('pay-1')
  })
})
