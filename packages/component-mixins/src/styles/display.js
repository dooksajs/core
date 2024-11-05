import { createMixin } from '@dooksa/create-component'
import { breakpoints } from './utils.js'

/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} DisplayProperty
 * @property {BreakpointAlwaysXXL} [breakpoint]
 * @property {'block'|
 * 'flex'|
 * 'grid'|
 * 'inline'|
 * 'inlineBlock'|
 * 'inlineFlex'|
 * 'inlineGrid'|
 * 'none'|
 * 'table'|
 * 'tableCell'|
 * 'tableRow'} type
 */

/**
 * @typedef {Object} DisplayMixin
 * @property {DisplayProperty[]} [display]
 */

export default createMixin({
  metadata: {
    id: 'display'
  },
  data: {
    options: {
      display: {
        name: 'className',
        infixValues: {
          className: 'd',
          infixes: [
            {
              values: breakpoints,
              name: 'breakpoint'
            },
            {
              values: {
                block: 'block',
                flex: 'flex',
                grid: 'grid',
                inline: 'inline',
                inlineBlock: 'inline-block',
                inlineFlex: 'inline-flex',
                inlineGrid: 'inline-grid',
                none: 'none',
                table: 'table',
                tableCell: 'table-cell',
                tableRow: 'table-row'
              },
              name: 'type'
            }
          ]
        }
      }
    }
  }
})
