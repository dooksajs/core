import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'all'|'top'|'bottom'|'end'|'stop'} BorderDirection
 * @typedef {'1'|'2'|'3'|'4'|'5'} BorderWidth
 * @typedef {import('@dooksa/create-component').Opacity} Opacity
 * @typedef {import('@dooksa/create-component').ColorExtra} ColorExtra
 */

/**
 * @typedef {Object} BorderMixin
 * @property {BorderDirection} [border]
 * @property {BorderWidth} [borderWidth]
 * @property {BorderDirection} [borderRemove]
 * @property {Opacity} [borderOpacity]
 * @property {ColorExtra} [borderColor]
 */

export default createMixin({
  metadata: {
    id: 'border'
  },
  data: {
    options: {
      border: {
        name: 'className',
        /**
         * @param {BorderDirection} direction
         */
        computedValue (direction) {
          if (direction !== 'all') {
            return 'border-' + direction
          }

          return 'border'
        }
      },
      borderRemove: {
        name: 'className',
        /**
         * @param {BorderDirection} direction
         */
        computedValue (direction) {
          if (direction !== 'all') {
            return 'border-' + direction + '-0'
          }

          return 'border-0'
        }
      },
      borderWidth: {
        name: 'className',
        /**
         * @param {BorderWidth} strength
         */
        computedValue (strength) {
          return 'border-' + strength
        }
      },
      borderOpacity: {
        name: 'className',
        /**
         * @param {Opacity} strength
         */
        computedValue (strength) {
          return 'border-opacity' + strength
        }
      },
      borderColor: {
        name: 'className',
        /**
         * @param {ColorExtra} color
         */
        computedValue (color) {
          return 'border-' + color
        }
      }
    }
  }
})
