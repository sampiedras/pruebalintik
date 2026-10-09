import { reactive, ref } from 'vue'
import type { QForm } from 'quasar'
import type { Credentials } from '@/types/auth'
import type { LoginFormEmits } from './types'

export function useLoginForm(emit: LoginFormEmits) {
  const loading = ref(false)
  const formRef = ref<QForm | null>(null)
  const credentials = reactive<Credentials>({
    username: '',
    password: '',
  })

  const requiredRule = [(value: string) => !!value?.trim() || 'Campo requerido']

  const toCredentials = (): Credentials => ({
    username: credentials.username.trim(),
    password: credentials.password,
  })

  const reset = (): void => {
    credentials.username = ''
    credentials.password = ''
  }

  const onSubmit = async (): Promise<void> => {
    const isValid = await formRef.value?.validate()
    if (!isValid) return

    loading.value = true
    try {
      emit('submit', toCredentials())
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    formRef,
    credentials,
    requiredRule,
    toCredentials,
    reset,
    onSubmit,
  }
}
