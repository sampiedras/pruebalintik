import { beforeEach, describe, expect, it } from 'vitest'
import {
  AUTH_SESSION_KEY,
  clearSessionUser,
  readSessionUser,
  writeSessionUser,
} from './auth-session'

describe('auth-session', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('reads a valid stored user', () => {
    writeSessionUser({ id: 'user-1', username: 'admin' })

    expect(readSessionUser()).toEqual({ id: 'user-1', username: 'admin' })
  })

  it('returns null for invalid or missing data', () => {
    expect(readSessionUser()).toBeNull()

    sessionStorage.setItem(AUTH_SESSION_KEY, '{bad')
    expect(readSessionUser()).toBeNull()

    sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ id: 1 }))
    expect(readSessionUser()).toBeNull()
  })

  it('clears the stored session', () => {
    writeSessionUser({ id: 'user-1', username: 'admin' })

    clearSessionUser()

    expect(sessionStorage.getItem(AUTH_SESSION_KEY)).toBeNull()
  })
})
