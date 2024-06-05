import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'end'|'start'|'top'|'bottom'|'xAxis'|'yAxis'|'none'} SpacingDirection
 */

/**
 * @typedef {Object} MarginMixin
 * @property {'0'|'1'|'2'|'3'|'4'|'5'|'auto'} strength
 * @property {SpacingDirection} [direction]
 */

/**
 * @typedef {Object} PaddingMixin
 * @property {'0'|'1'|'2'|'3'|'4'|'5'} strength
 * @property {SpacingDirection} [direction]
 */

/**
 * @typedef {Object} SpacingMixin
 * @property {MarginMixin} [margin]
 * @property {PaddingMixin} [padding]
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
  metadata: {
    id: 'spacing'
  },
  data: {
    options: {
      margin: {
        name: 'className',
        /**
         * Margin
         * @param {MarginMixin} param
         * @returns {string}
         */
        computedValue ({ strength, direction = 'none' }) {
          return 'm' + directions[direction] + '-' + strength
        }
      },
      padding: {
        name: 'className',
        /**
         * Padding
         * @param {PaddingMixin} param
         * @returns {string}
         */
        computedValue ({ strength, direction = 'none' }) {
          return 'p' + directions[direction] + '-' + strength
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
