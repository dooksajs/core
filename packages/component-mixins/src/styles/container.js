import { createMixin } from '@dooksa/create-component'

/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ContainerMixin
 * @property {BreakpointAlwaysXXL|'fluid'} [container]
 */

export default createMixin({
  metadata: {
    id: 'container'
  },
  data: {
    options: {
      container: {
        name: 'className',
        /**
         * @param {BreakpointAlwaysXXL|'fluid'} breakpoint
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'container-' + breakpoint
          }

          return 'container'
        }
      }
    }
  }
})
