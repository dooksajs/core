import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'0'|'1'|'2'|'3'|'n1'} ZIndex
 */

/**
 * @typedef {Object} ZIndexMixin
 * @property {ZIndex} [zIndex]
 */

export default createMixin({
  metadata: {
    id: 'zIndex'
  },
  data: {
    options: {
      zIndex: {
        name: 'className',
        /**
         * Z-index
         * @param {ZIndex} strength
         * @returns {string}
         */
        computedValue (strength) {
          return 'z-' + strength
        }
      }
    },
    styles: [
      {
        name: 'z-index',
        type: 'number'
      }
    ]
  }
})
