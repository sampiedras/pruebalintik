import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import {
  createPaymentMock,
  deletePaymentMock,
  listPaymentsMock,
  updatePaymentMock,
  updatePaymentStatusMock,
} from '@/mocks/services'
import type {
  PaymentFormPayload,
  PaymentListFilters,
  PaymentMethod,
} from '@/types/payment'

export const usePaymentStore = defineStore('payment', () => {
  const items = ref<PaymentMethod[]>([])
  const loading = ref(false)
  const filters = ref<PaymentListFilters>({})

  const fetchPayments = async (nextFilters: PaymentListFilters = {}): Promise<void> => {
    loading.value = true
    filters.value = nextFilters

    try {
      items.value = await listPaymentsMock(nextFilters)
    } catch (error) {
      Notify.create({
        type: 'negative',
        message:
          error instanceof Error
            ? error.message
            : 'No se pudieron cargar los métodos de pago',
        position: 'top',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  const notifySuccess = (message: string): void => {
    Notify.create({
      type: 'positive',
      message,
      position: 'top',
    })
  }

  const toggleStatus = async (id: string): Promise<void> => {
    const current = items.value.find((item) => item.id === id)
    if (!current) return

    current.status = current.status === 'active' ? 'inactive' : 'active'
    await updatePaymentStatusMock(id, current.status)
    notifySuccess(
      current.status === 'active' ? 'Estado cambiado a Activo' : 'Estado cambiado a Inactivo',
    )
  }

  const createPayment = async (input: PaymentFormPayload): Promise<void> => {
    const created = await createPaymentMock(input)
    items.value = [created, ...items.value]
    notifySuccess('Método de pago creado')
  }

  const updatePayment = async (id: string, input: PaymentFormPayload): Promise<void> => {
    const updated = await updatePaymentMock(id, input)
    items.value = items.value.map((item) => (item.id === id ? updated : item))
    notifySuccess('Método de pago actualizado')
  }

  const removePayment = async (id: string): Promise<void> => {
    await deletePaymentMock(id)
    items.value = items.value.filter((item) => item.id !== id)
    notifySuccess('Método de pago eliminado')
  }

  return {
    items,
    loading,
    filters,
    fetchPayments,
    toggleStatus,
    createPayment,
    updatePayment,
    removePayment,
  }
})
