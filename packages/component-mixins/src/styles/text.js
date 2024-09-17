import { createMixin } from '@dooksa/create-component'

/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} TextMixin
 * @property {BreakpointAlwaysXXL} [textAlignStart]
 * @property {BreakpointAlwaysXXL} [textAlignCenter]
 * @property {BreakpointAlwaysXXL} [textAlignEnd]
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
      textAlignStart: {
        name: 'className',
        /**
         * Text start
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'text-' + breakpoint + '-start'
          }

          return 'text-start'
        }
      },
      textAlignCenter: {
        name: 'className',
        /**
         * Text center
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'text-' + breakpoint + '-center'
          }

          return 'text-center'
        }
      },
      textAlignEnd: {
        name: 'className',
        /**
         * Text end
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'text-' + breakpoint + '-end'
          }

          return 'text-end'
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
