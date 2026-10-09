import type { NavigationGuardReturn, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
): NavigationGuardReturn {
  const authStore = useAuthStore()
  const requiresAuth = Boolean(to.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && authStore.isAuthenticated) {
    return { name: 'home' }
  }

  return true
}
