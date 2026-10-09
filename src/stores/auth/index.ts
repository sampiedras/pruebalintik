import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import { loginMock } from '@/mocks/services'
import type { Credentials, SessionUser } from '@/types/auth'
import {
  clearSessionUser,
  readSessionUser,
  writeSessionUser,
} from '@/utils/auth-session'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<SessionUser | null>(readSessionUser())
  const loading = ref(false)

  const isAuthenticated = computed(() => user.value !== null)

  const login = async (credentials: Credentials): Promise<void> => {
    loading.value = true

    try {
      const sessionUser = await loginMock(credentials)
      user.value = sessionUser
      writeSessionUser(sessionUser)
    } catch (error) {
      user.value = null
      clearSessionUser()
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

  const logout = (): void => {
    user.value = null
    clearSessionUser()
  }

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
  }
})
