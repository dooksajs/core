import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {import('@dooksa/create-component').Spacer} Spacer
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
 * @property {SpacingMargin} [margin]
 * @property {SpacingPadding} [padding]
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
         * @param {SpacingMargin} param
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
         * @param {SpacingPadding} param
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
