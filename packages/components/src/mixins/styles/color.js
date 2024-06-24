import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} ColorMixin
 * @property {import('@dooksa/create-component').Color} [color]
 */

export default createMixin({
  metadata: {
    id: 'color'
  },
  data: {
    options: {
      color: {
        name: 'className',
        values: {
          primary: 'text-bg-primary',
          secondary: 'text-bg-secondary',
          success: 'text-bg-success',
          danger: 'text-bg-danger',
          warning: 'text-bg-warning',
          info: 'text-bg-info',
          light: 'text-bg-light',
          dark: 'text-bg-dark'
        }
      }
    }
  }
})

