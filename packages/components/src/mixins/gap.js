import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {import('@dooksa/create-component').Spacer} Spacer
 */

/**
 * @typedef {Object} GapMixin
 * @property {Spacer} [gap]
 * @property {Spacer} [gapRow]
 * @property {Spacer} [gapColumn]
 */


export default createMixin({
  metadata: {
    id: 'gap'
  },
  data: {
    options: {
      gap: {
        name: 'className',
        /**
         * Gap
         * @param {Spacer} strength
         * @returns {string}
         */
        computedValue (strength) {
          return 'gap-' + strength
        }
      },
      gapRow: {
        name: 'className',
        /**
         * Gap
         * @param {Spacer} strength
         * @returns {string}
         */
        computedValue (strength) {
          return 'row-gap-' + strength
        }
      },
      gapColumn: {
        name: 'className',
        /**
         * Gap
         * @param {Spacer} strength
         * @returns {string}
         */
        computedValue (strength) {
          return 'column-gap-' + strength
        }
      }
    }
  }
})
