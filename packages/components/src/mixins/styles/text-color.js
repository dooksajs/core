import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TextColorMixin
 * @property {'primary'|
 * 'primaryEmphasis'|
 * 'secondary'|
 * 'secondaryEmphasis'|
 * 'success'|
 * 'successEmphasis'|
 * 'danger'|
 * 'dangerEmphasis'|
 * 'warning'|
 * 'warningEmphasis'|
 * 'info'|
 * 'infoEmphasis'|
 * 'light'|
 * 'lightEmphasis'|
 * 'dark'|
 * 'darkEmphasis'|
 * 'body'|
 * 'bodyEmphasis'|
 * 'bodySecondary'|
 * 'bodyTertiary'|
 * 'black'|
 * 'white'} [textColor]
 */

export default createMixin({
  metadata: { id: 'text-color' },
  data: {
    options: {
      textColor: {
        name: 'className',
        values: {
          primary: 'text-primary',
          primaryEmphasis: 'text-primary-emphasis',
          secondary: 'text-secondary',
          secondaryEmphasis: 'text-secondary-emphasis',
          success: 'text-success',
          successEmphasis: 'text-success-emphasis',
          danger: 'text-danger',
          dangerEmphasis: 'text-danger-emphasis',
          warning: 'text-warning',
          warningEmphasis: 'text-warning-emphasis',
          info: 'text-info',
          infoEmphasis: 'text-info-emphasis',
          light: 'text-light',
          lightEmphasis: 'text-light-emphasis',
          dark: 'text-dark',
          darkEmphasis: 'text-dark-emphasis',
          body: 'text-body',
          bodyEmphasis: 'text-body-emphasis',
          bodySecondary: 'text-body-secondary',
          bodyTertiary: 'text-body-tertiary',
          black: 'text-black',
          white: 'text-white'
        }
      }
    }
  }
})
