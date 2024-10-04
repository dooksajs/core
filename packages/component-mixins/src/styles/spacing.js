import { createMixin } from '@dooksa/create-component'

/**
 * @import {Spacer} from '@dooksa/create-component'
 * @typedef {'end'|'start'|'top'|'bottom'|'xAxis'|'yAxis'|'none'} SpacingDirection
 */

/**
 * @typedef {Object} SpacingMargin
 * @property {'n5'|'n4'|'n3'|'n2'|'n1'|'0'|'1'|'2'|'3'|'4'|'5'|'auto'} strength
 * @property {SpacingDirection} [direction]
 */

/**
 * @typedef {Object} SpacingPadding
 * @property {Spacer} strength
 * @property {SpacingDirection} [direction]
 */

/**
 * @typedef {Object} SpacingMixin
 * @property {SpacingMargin[]} [margin]
 * @property {SpacingPadding[]} [padding]
 */

const directions = {
  end: 'e',
  start: 's',
  top: 't',
  bottom: 'b',
  xAxis: 'x',
  yAxis: 'y',
  none: ''
}

export default createMixin({
  metadata: { id: 'spacing' },
  data: {
    options: {
      margin: {
        name: 'className',
        /**
         * Margin
         * @param {SpacingMargin[]} options
         * @returns {string}
         */
        computedValue (options) {
          let classNames = ''
          let firstChar = 'm'

          for (let i = 0; i < options.length; i++) {
            const {
              strength, direction = 'none'
            } = options[i]

            classNames += firstChar + directions[direction] + '-' + strength
            firstChar = ' m'
          }

          return classNames
        }
      },
      padding: {
        name: 'className',
        /**
         * Padding
         * @param {SpacingPadding[]} options
         * @returns {string}
         */
        computedValue (options) {
          let classNames = ''
          let firstChar = 'p'

          for (let i = 0; i < options.length; i++) {
            const {
              strength, direction = 'none'
            } = options[i]

            classNames += firstChar + directions[direction] + '-' + strength
            firstChar = ' p'
          }

          return classNames
        }
      }
    },
    styles: [
      {
        name: 'margin',
        type: 'units'
      },
      {
        name: 'padding',
        type: 'units'
      }
    ]
  }
})
