import { createMixin } from '@dooksa/create-component'

/**
 * @import {BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} DisplayMixin
 * @property {BreakpointAlwaysXXL} [displayBlock]
 * @property {BreakpointAlwaysXXL} [displayFlex]
 * @property {BreakpointAlwaysXXL} [displayGrid]
 * @property {BreakpointAlwaysXXL} [displayInline]
 * @property {BreakpointAlwaysXXL} [displayInlineBlock]
 * @property {BreakpointAlwaysXXL} [displayInlineFlex]
 * @property {BreakpointAlwaysXXL} [displayInlineGrid]
 * @property {BreakpointAlwaysXXL} [displayNone]
 * @property {BreakpointAlwaysXXL} [displayTable]
 * @property {BreakpointAlwaysXXL} [displayTableCell]
 * @property {BreakpointAlwaysXXL} [displayTableRow]
 */

export default createMixin({
  metadata: {
    id: 'display'
  },
  data: {
    options: {
      displayNone: {
        name: 'className',
        /**
         * Flex
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-none'
          }

          return 'd-none'
        }
      },
      displayFlex: {
        name: 'className',
        /**
         * Flex
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-flex'
          }

          return 'd-flex'
        }
      },
      displayInlineFlex: {
        name: 'className',
        /**
         * Inline flex
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-inline-flex'
          }

          return 'd-inline-flex'
        }
      },
      displayBlock: {
        name: 'className',
        /**
         * Block
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-block'
          }

          return 'd-block'
        }
      },
      displayInline: {
        name: 'className',
        /**
         * Inline
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-inline'
          }

          return 'd-inline'
        }
      },
      displayInlineBlock: {
        name: 'className',
        /**
         * Inline block
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-inline-block'
          }

          return 'd-inline-block'
        }
      },
      displayGrid: {
        name: 'className',
        /**
         * Grid
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-grid'
          }

          return 'd-grid'
        }
      },
      displayInlineGrid: {
        name: 'className',
        /**
         * Inline grid
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-inline-grid'
          }

          return 'd-inline-grid'
        }
      },
      displayTable: {
        name: 'className',
        /**
         * Table
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-table'
          }

          return 'd-table'
        }
      },
      displayTableCell: {
        name: 'className',
        /**
         * Table cell
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-table-cell'
          }

          return 'd-table-cell'
        }
      },
      displayTableRow: {
        name: 'className',
        /**
         * Table row
         * @param {BreakpointAlwaysXXL} [breakpoint]
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'd-' + breakpoint + '-table-row'
          }

          return 'd-table-row'
        }
      }
    }
  }
})
