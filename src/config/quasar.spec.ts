import { describe, expect, it } from 'vitest'
import { QUASAR_UI_COMPONENTS, quasarOptions } from './quasar'

describe('quasarOptions', () => {
  it('registers Dialog and Notify plugins required by the technical test', () => {
    expect(quasarOptions.plugins).toEqual(
      expect.objectContaining({
        Dialog: expect.anything(),
        Notify: expect.anything(),
      }),
    )
  })

  it('uses the Material icon set', () => {
    expect(quasarOptions.iconSet?.name).toBe('material-icons')
  })

  it('lists the Quasar UI components expected by the overview', () => {
    expect(QUASAR_UI_COMPONENTS).toEqual(
      expect.arrayContaining([
        'QForm',
        'QInput',
        'QSelect',
        'QTable',
        'QToggle',
        'QBtn',
        'QDialog',
      ]),
    )
  })
})
