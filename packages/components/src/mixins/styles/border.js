import { createMixin } from '@dooksa/create-component'

/**
 * @import {Opacity, ColorExtra} from '@dooksa/create-component'
 */

/**
 * @typedef {'all'|'top'|'bottom'|'end'|'stop'} BorderDirection
 * @typedef {'1'|'2'|'3'|'4'|'5'} BorderWidth
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
        values: {
          all: 'border',
          top: 'border-top',
          end: 'border-end',
          bottom: 'border-bottom',
          start: 'border-start'
        }
      },
      borderRemove: {
        name: 'className',
        /**
         * @param {BorderDirection[]} direction
         */
        values: {
          all: 'border-0',
          top: 'border-top-0',
          end: 'border-end-0',
          bottom: 'border-bottom-0',
          start: 'border-start-0'
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
          return 'border-opacity-' + strength
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
