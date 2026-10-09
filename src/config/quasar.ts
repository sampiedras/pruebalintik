import type { QuasarPluginOptions } from 'quasar'
import { Dialog, Notify } from 'quasar'
import iconSet from 'quasar/icon-set/material-icons'
import langEs from 'quasar/lang/es'

/**
 * Quasar app configuration.
 * UI components (QTable, QForm, QInput, QSelect, QToggle, QBtn, …)
 * are auto-imported by `@quasar/vite-plugin` when used in templates.
 * Plugins that are not components must be registered here.
 */
export const quasarOptions: Partial<QuasarPluginOptions> = {
  plugins: {
    Dialog,
    Notify,
  },
  iconSet,
  lang: langEs,
  config: {
    brand: {
      primary: '#0F766E',
      secondary: '#0EA5A4',
      accent: '#F59E0B',
      dark: '#12231F',
      positive: '#15803D',
      negative: '#B42318',
      info: '#0E7490',
      warning: '#D97706',
    },

    notify: {
      position: 'top',
      timeout: 2500,
    },
  },
}

/** Components required by the technical test (resolved via vite-plugin auto-import). */
export const QUASAR_UI_COMPONENTS = [
  'QForm',
  'QInput',
  'QSelect',
  'QTable',
  'QToggle',
  'QBtn',
  'QDialog',
  'QCard',
  'QCardSection',
  'QLayout',
  'QHeader',
  'QToolbar',
  'QToolbarTitle',
  'QPage',
  'QPageContainer',
] as const
