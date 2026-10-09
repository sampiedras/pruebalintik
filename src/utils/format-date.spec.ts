import { describe, expect, it } from 'vitest'
import { formatDate } from './format-date'

describe('formatDate', () => {
  it('formats a valid ISO date for es-CO', () => {
    expect(formatDate('2024-03-15T10:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/)
  })

  it('returns the original value when the date is invalid', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})
