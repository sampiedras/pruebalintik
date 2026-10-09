import { reactive, ref } from 'vue'
import type { QForm } from 'quasar'
import { cleanPayload } from '@/utils/clean-payload'
import type { FilterField, FilterFormEmits, FilterSearchPayload } from './types'

export function useFilterForm(emit: FilterFormEmits) {
  const loading = ref(false)
  const formRef = ref<QForm | null>(null)
  const values = reactive<Record<string, string | null>>({})

  const requiredRule = [(value: string) => !!value?.trim() || 'Campo requerido']

  const rulesFor = (field: FilterField) => (field.required ? requiredRule : [])

  const onSearch = async (): Promise<void> => {
    const isValid = await formRef.value?.validate()
    if (!isValid) return

    loading.value = true
    try {
      emit('search', cleanPayload({ ...values }) as FilterSearchPayload)
    } finally {
      loading.value = false
    }
  }

  const onClear = (): void => {
    for (const key of Object.keys(values)) {
      values[key] = ''
    }

    formRef.value?.resetValidation()
    emit('clear')
  }

  return {
    loading,
    formRef,
    values,
    rulesFor,
    onSearch,
    onClear,
  }
}
