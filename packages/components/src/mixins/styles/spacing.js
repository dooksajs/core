import { createMixin } from '@dooksa/create-component'
import { directions } from './utils.js'

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


export default createMixin({
  metadata: { id: 'spacing' },
  data: {
    options: {
      margin: {
        name: 'className',
        infixValues: {
          className: 'm',
          infixes: [
            {
              values: directions,
              name: 'direction',
              separator: ''
            },
            {
              values: {
                n5: 'n5',
                n4: 'n4',
                n3: 'n3',
                n2: 'n2',
                n1: 'n1',
                0: '0',
                1: '1',
                2: '2',
                3: '3',
                4: '4',
                5: '5',
                auto: 'auto'
              },
              name: 'strength'
            }
          ]
        }
      },
      padding: {
        name: 'className',
        infixValues: {
          className: 'p',
          infixes: [
            {
              values: directions,
              name: 'direction',
              separator: ''
            },
            {
              values: {
                0: '0',
                1: '1',
                2: '2',
                3: '3',
                4: '4',
                5: '5'
              },
              name: 'strength'
            }
          ]
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
