import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TextOpacityMixin
 * @property {'75'|'50'|'25'} [textOpacity]
 */

export default createMixin({
  metadata: { id: 'text-opacity' },
  data: {
    options: {
      textOpacity: {
        name: 'className',
        values: {
          75: 'text-opacity-75',
          50: 'text-opacity-50',
          25: 'text-opacity-25'
        }
      }
    }
  }
})
