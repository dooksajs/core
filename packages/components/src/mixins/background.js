import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} BackgroundMixin
 * @property {import('@dooksa/create-component').Color|'transparent'} [backgroundColor]
 * @property {boolean} [backgroundGradient]
 * @property {import('@dooksa/create-component').Opacity} [backgroundOpacity]
 */

export default createMixin({
  metadata: {
    id: 'background'
  },
  data: {
    options: {
      backgroundColor: {
        name: 'className',
        values: {
          primary: 'bg-primary',
          primarySubtle: 'bg-primary-subtle',
          secondary: 'bg-secondary',
          secondarySubtle: 'bg-secondary-subtle',
          success: 'bg-success',
          successSubtle: 'bg-success-subtle',
          danger: 'bg-danger',
          dangerSubtle: 'bg-danger-subtle',
          warning: 'bg-warning',
          warningSubtle: 'bg-warning-subtle',
          info: 'bg-info',
          infoSubtle: 'bg-info-subtle',
          light: 'bg-light',
          lightSubtle: 'bg-light-subtle',
          dark: 'bg-dark',
          darkSubtle: 'bg-dark-subtle',
          bodySecondary: 'bg-body-secondary',
          bodyTertiary: 'bg-body-tertiary',
          body: 'bg-body',
          black: 'bg-black',
          white: 'bg-white',
          transparent: 'bg-transparent'
        }
      },
      backgroundGradient: {
        name: 'className',
        value: 'bg-gradient'
      },
      backgroundOpacity: {
        name: 'className',
        values: {
          '10': 'bg-opacity-10',
          '25': 'bg-opacity-25',
          '50': 'bg-opacity-50',
          '75': 'bg-opacity-75'
        }
      }
    }
  }
})

