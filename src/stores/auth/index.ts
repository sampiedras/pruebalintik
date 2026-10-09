import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { loginMock } from '@/mocks/services'
import type { Credentials, SessionUser } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  async function login(credentials: Credentials): Promise<void> {
    loading.value = true

    try {
      user.value = await loginMock(credentials)
    } catch (error) {
      user.value = null
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión'
      Notify.create({
        type: 'negative',
        message,
        position: 'top',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    user.value = null
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  }
})
