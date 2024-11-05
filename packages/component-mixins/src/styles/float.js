import { createMixin } from '@dooksa/create-component'
import { breakpoints } from './utils.js'

/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} Float
 * @property {'start'|'end'|'none'} direction
 * @property {BreakpointAlwaysXXL} [breakpoint]
 */

/**
 * @typedef {Object} FloatMixin
 * @property {Float[]} [float]
 */

export default createMixin({
  metadata: {
    id: 'float'
  },
  data: {
    options: {
      float: {
        name: 'className',
        infixValues: {
          className: 'container',
          infixes: [
            {
              name: 'breakpoint',
              values: breakpoints
            },
            {
              name: 'direction',
              values: {
                start: 'start',
                end: 'end',
                none: 'none'
              }
            }
          ]
        }
      }
    }
  }
})
