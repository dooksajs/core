import { createMixin } from '@dooksa/create-component'
import { breakpoints } from './utils.js'

/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} TextAlign
 * @property {BreakpointAlwaysXXL} [breakpoint]
 * @property {'start'|'center'|'end'} align
 */

/**
 * @typedef {Object} TextMixin
 * @property {TextAlign[]} [textAlign]
 * @property {'wrap'|'nowrap'|'break'} [textWrap]
 * @property {'lowercase'|'uppercase'|'capitalize'} [textTransform]
 * @property {'underline'|'lineThrough'|'none'} [textDecoration]
 */

export default createMixin({
  metadata: {
    id: 'text'
  },
  data: {
    options: {
      textAlign: {
        name: 'className',
        infixValues: {
          className: 'text',
          infixes: [
            {
              name: 'breakpoint',
              values: breakpoints
            },
            {
              name: 'align',
              values: {
                start: 'start',
                center: 'center',
                end: 'end'
              }
            }
          ]
        }
      },
      textWrap: {
        name: 'className',
        values: {
          wrap: 'text-wrap',
          nowrap: 'text-nowrap',
          break: 'text-break'
        }
      },
      textTransform: {
        name: 'className',
        values: {
          lowercase: 'text-lowercase',
          uppercase: 'text-lowercase',
          capitalize: 'text-capitalize'
        }
      },
      textDecoration: {
        name: 'className',
        values: {
          underline: 'text-decoration-underline',
          lineThrough: 'text-decoration-line-through',
          none: 'text-decoration-none'
        }
      }
    }
  }
})
