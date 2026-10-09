import { computed, nextTick, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Dialog } from 'quasar'
import type { FilterSearchPayload } from '@/components/filter-form/types'
import { usePaymentStore } from '@/stores/payment'
import type {
  PaymentFormPayload,
  PaymentListFilters,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
} from '@/types/payment'
import { PAYMENTS_ROWS_PER_PAGE } from './constants'

interface PaymentFormExpose {
  resetForm: () => void
  fill: (payment: PaymentMethod) => void
  finishSubmit: () => void
}

export function usePaymentsPage() {
  const paymentStore = usePaymentStore()
  const { items, loading } = storeToRefs(paymentStore)

  const pagination = ref({
    page: 1,
    rowsPerPage: PAYMENTS_ROWS_PER_PAGE,
  })
  const dialogOpen = ref(false)
  const editingId = ref<string | null>(null)
  const paymentFormRef = ref<PaymentFormExpose | null>(null)

  const dialogTitle = computed(() =>
    editingId.value ? 'Editar método de pago' : 'Nuevo método de pago',
  )

  const toPaymentFilters = (payload: FilterSearchPayload): PaymentListFilters => {
    const filters: PaymentListFilters = {}

    if (payload.name) filters.name = payload.name
    if (payload.type) filters.type = payload.type as PaymentType
    if (payload.status) filters.status = payload.status as PaymentStatus

    return filters
  }

  const loadPayments = async (filters: PaymentListFilters = {}): Promise<void> => {
    await paymentStore.fetchPayments(filters)
  }

  const handleSearch = async (payload: FilterSearchPayload): Promise<void> => {
    pagination.value.page = 1
    await loadPayments(toPaymentFilters(payload))
  }

  const handleClear = async (): Promise<void> => {
    pagination.value.page = 1
    await loadPayments()
  }

  const handleToggleStatus = async (id: string): Promise<void> => {
    await paymentStore.toggleStatus(id)
  }

  const closeDialog = (): void => {
    dialogOpen.value = false
    editingId.value = null
  }

  const openCreateDialog = async (): Promise<void> => {
    editingId.value = null
    dialogOpen.value = true
    await nextTick()
    paymentFormRef.value?.resetForm()
  }

  const openEditDialog = async (payment: PaymentMethod): Promise<void> => {
    editingId.value = payment.id
    dialogOpen.value = true
    await nextTick()
    paymentFormRef.value?.fill(payment)
  }

  const handleFormSubmit = async (payload: PaymentFormPayload): Promise<void> => {
    try {
      if (editingId.value) {
        await paymentStore.updatePayment(editingId.value, payload)
      } else {
        await paymentStore.createPayment(payload)
      }

      closeDialog()
    } finally {
      paymentFormRef.value?.finishSubmit()
    }
  }

  const handleRemove = (payment: PaymentMethod): void => {
    Dialog.create({
      title: 'Eliminar método de pago',
      message: `¿Seguro que deseas eliminar "${payment.name}"?`,
      cancel: { flat: true, label: 'Cancelar', color: 'primary' },
      ok: { unelevated: true, label: 'Eliminar', color: 'negative' },
      persistent: true,
    }).onOk(() => {
      void paymentStore.removePayment(payment.id)
    })
  }

  onMounted(() => {
    void loadPayments()
  })

  return {
    items,
    loading,
    pagination,
    dialogOpen,
    dialogTitle,
    paymentFormRef,
    handleSearch,
    handleClear,
    handleToggleStatus,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    handleFormSubmit,
    handleRemove,
  }
}
