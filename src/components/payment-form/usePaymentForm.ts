import { computed, reactive, ref } from 'vue'
import type { QForm } from 'quasar'
import type { PaymentFormPayload, PaymentFormValues, PaymentMethod } from '@/types/payment'
import type { PaymentFormEmits } from './types'

const emptyValues = (): PaymentFormValues => ({
  name: '',
  type: '',
  status: 'active',
  description: '',
})

export function usePaymentForm(emit: PaymentFormEmits) {
  const loading = ref(false)
  const formRef = ref<QForm | null>(null)
  const values = reactive<PaymentFormValues>(emptyValues())

  const isActive = computed({
    get: () => values.status === 'active',
    set: (value: boolean) => {
      values.status = value ? 'active' : 'inactive'
    },
  })

  const requiredRule = [(value: string) => !!value?.trim() || 'Campo requerido']

  const finishSubmit = (): void => {
    loading.value = false
  }

  const resetForm = (): void => {
    Object.assign(values, emptyValues())
    formRef.value?.resetValidation()
    finishSubmit()
  }

  const fill = (payment: PaymentMethod): void => {
    values.name = payment.name
    values.type = payment.type
    values.status = payment.status
    values.description = payment.description ?? ''
    formRef.value?.resetValidation()
    finishSubmit()
  }

  const toPayload = (): PaymentFormPayload => {
    const payload: PaymentFormPayload = {
      name: values.name.trim(),
      type: values.type as PaymentFormPayload['type'],
      status: values.status,
    }

    if (values.description.trim()) {
      payload.description = values.description.trim()
    }

    return payload
  }

  const onSubmit = async (): Promise<void> => {
    if (loading.value) return

    const isValid = await formRef.value?.validate()
    if (!isValid) return

    loading.value = true
    emit('submit', toPayload())
  }

  return {
    loading,
    formRef,
    values,
    isActive,
    requiredRule,
    resetForm,
    fill,
    finishSubmit,
    onSubmit,
  }
}
