import { createMixin } from '@dooksa/create-component'

/**
 * @import {Color} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} FocusRingMixin
 * @property {boolean} [focusRing]
 * @property {Color} [focusRingColor]
 */

export default createMixin({
  metadata: { id: 'focus-ring' },
  data: {
    options: {
      focusRing: {
        name: 'className',
        value: 'focus-ring'
      },
      focusRingColor: {
        name: 'className',
        values: {
          primary: 'focus-primary',
          secondary: 'focus-secondary',
          success: 'focus-success',
          danger: 'focus-danger',
          warning: 'focus-warning',
          info: 'focus-info',
          light: 'focus-light',
          dark: 'focus-dark'
        }
      }
    }
  }
})
