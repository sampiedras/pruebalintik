import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import type { Credentials } from '@/types/auth'

export function useLoginPage() {
  const router = useRouter()
  const authStore = useAuthStore()

  const handleSubmit = async (credentials: Credentials): Promise<void> => {
    await authStore.login(credentials)
    await router.push('/')
  }

  return {
    handleSubmit,
  }
}
