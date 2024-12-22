/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendListGroupOptions
 * @property {boolean} [flush]
 * @property {boolean} [numbered]
 * @property {BreakpointAlwaysXXL} [horizontal]
 */

export default {
  flush: {
    name: 'className',
    value: 'list-group-flush'
  },
  numbered: {
    name: 'className',
    value: 'list-group-numbered'
  },
  horizontal: {
    name: 'className',
    /**
       * @param {BreakpointAlwaysXXL} breakpoint
       */
    computedValue (breakpoint) {
      if (breakpoint === 'always') {
        return 'list-group-horizontal'
      }

      return 'list-group-horizontal-' + breakpoint
    }
  }
}





