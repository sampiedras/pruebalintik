import type { SessionUser } from '@/types/auth'

export const AUTH_SESSION_KEY = 'recaudandoapp.session'

const isSessionUser = (value: unknown): value is SessionUser => {
  if (!value || typeof value !== 'object') return false

  const candidate = value as SessionUser
  return typeof candidate.id === 'string' && typeof candidate.username === 'string'
}

export const readSessionUser = (): SessionUser | null => {
  try {
    const raw = sessionStorage.getItem(AUTH_SESSION_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    return isSessionUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

export const writeSessionUser = (user: SessionUser): void => {
  sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user))
}

export const clearSessionUser = (): void => {
  sessionStorage.removeItem(AUTH_SESSION_KEY)
}
