import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { delay, randomLatency } from './delay'

describe('delay', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves after the given milliseconds', async () => {
    const pending = delay(300)
    let settled = false
    void pending.then(() => {
      settled = true
    })

    await vi.advanceTimersByTimeAsync(299)
    expect(settled).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await pending
    expect(settled).toBe(true)
  })
})

describe('randomLatency', () => {
  it('returns a value inside the requested range', () => {
    for (let i = 0; i < 20; i += 1) {
      const value = randomLatency(500, 1000)
      expect(value).toBeGreaterThanOrEqual(500)
      expect(value).toBeLessThanOrEqual(1000)
    }
  })
})
