import { createMixin } from '@dooksa/create-component'
import { breakpoints } from './utils.js'

/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ContainerBreakpoint
 * @property {BreakpointAlwaysXXL|'fluid'} breakpoint
 */

/**
 * @typedef {Object} ContainerMixin
 * @property {ContainerBreakpoint[]} [container]
 */

export default createMixin({
  metadata: {
    id: 'container'
  },
  data: {
    options: {
      container: {
        name: 'className',
        infixValues: {
          className: 'container',
          infixes: [{
            values: Object.assign({ fluid: 'fluid' }, breakpoints),
            name: 'breakpoint'
          }]
        }
      }
    }
  }
})
