import { describe, expect, it } from 'vitest'
import { cleanPayload } from './clean-payload'

describe('cleanPayload', () => {
  it('keeps only keys with a value', () => {
    expect(
      cleanPayload({
        name: 'visa',
        type: '',
        status: null,
        extra: undefined,
      }),
    ).toEqual({
      name: 'visa',
    })
  })
})
