import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authGuard } from './guards'

function createRoute(name: string, requiresAuth = false): RouteLocationNormalized {
  return {
    name,
    meta: { requiresAuth },
  } as RouteLocationNormalized
}

describe('authGuard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('redirects unauthenticated users away from protected routes', () => {
    const store = useAuthStore()
    store.user = null

    expect(authGuard(createRoute('payments', true), createRoute('login'))).toEqual({
      name: 'login',
    })
  })

  it('allows authenticated users into protected routes', () => {
    const store = useAuthStore()
    store.user = { id: 'user-1', username: 'admin' }

    expect(authGuard(createRoute('payments', true), createRoute('login'))).toBe(true)
  })

  it('redirects authenticated users away from login', () => {
    const store = useAuthStore()
    store.user = { id: 'user-1', username: 'admin' }

    expect(authGuard(createRoute('login', false), createRoute('payments', true))).toEqual({
      name: 'payments',
    })
  })
})
