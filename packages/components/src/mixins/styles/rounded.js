import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'0'|'1'|'2'|'3'|'4'|'5'|'circle'|'pill'|'regular'} Rounded
 */

/**
 * @typedef {Object} RoundedMixin
 * @property {Rounded} [rounded]
 * @property {Rounded} [roundedTop]
 * @property {Rounded} [roundedBottom]
 * @property {Rounded} [roundedEnd]
 * @property {Rounded} [roundedStart]
 */

export default createMixin({
  metadata: {
    id: 'rounded'
  },
  data: {
    options: {
      rounded: {
        name: 'className',
        /**
         * Rounded
         * @param {Rounded} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (strength !== 'regular') {
            return 'rounded-' + strength
          }

          return 'rounded'
        }
      },
      roundedTop: {
        name: 'className',
        /**
         * Rounded top
         * @param {Rounded} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (strength !== 'regular') {
            return 'rounded-top' + strength
          }

          return 'rounded-top'
        }
      },
      roundedEnd: {
        name: 'className',
        /**
         * Rounded end
         * @param {Rounded} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (strength !== 'regular') {
            return 'rounded-end' + strength
          }

          return 'rounded-end'
        }
      },
      roundedBottom: {
        name: 'className',
        /**
         * Rounded bottom
         * @param {Rounded} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (strength !== 'regular') {
            return 'rounded-bottom' + strength
          }

          return 'rounded-bottom'
        }
      },
      roundedStart: {
        name: 'className',
        /**
         * Rounded start
         * @param {Rounded} strength
         * @returns {string}
         */
        computedValue (strength) {
          if (strength !== 'regular') {
            return 'rounded-start' + strength
          }

          return 'rounded-start'
        }
      }
    }
  }
})
