import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'0'|'50'|'100'} InsetValue
 */

/**
 * @typedef {Object} InsetMixin
 * @property {InsetValue} [top]
 * @property {InsetValue} [bottom]
 * @property {InsetValue} [start]
 * @property {InsetValue} [end]
 */

/**
 * @TODO Need to expose these values
 */
const positionValues = {
  0: true,
  50: true,
  100: true
}

export default createMixin({
  metadata: {
    id: 'inset'
  },
  data: {
    options: {
      top: {
        name: 'className',
        /**
         * Top
         * @param {InsetValue} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (!positionValues[strength]) {
            throw Error('Top position value out of range:' + strength)
          }

          return 'top-' + strength
        }
      },
      bottom: {
        name: 'className',
        /**
         * Bottom
         * @param {InsetValue} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (!positionValues[strength]) {
            throw Error('Top position value out of range:' + strength)
          }

          return 'bottom-' + strength
        }
      },
      end: {
        name: 'className',
        /**
         * End
         * @param {InsetValue} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (!positionValues[strength]) {
            throw Error('Top position value out of range:' + strength)
          }

          return 'end-' + strength
        }
      },
      start: {
        name: 'className',
        /**
         * Start
         * @param {InsetValue} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (!positionValues[strength]) {
            throw Error('Top position value out of range:' + strength)
          }

          return 'start-' + strength
        }
      }
    },
    styles: [
      {
        name: 'top',
        type: 'units'
      },
      {
        name: 'bottom',
        type: 'units'
      },
      {
        name: 'left',
        type: 'units'
      },
      {
        name: 'right',
        type: 'units'
      }
    ]
  }
})
