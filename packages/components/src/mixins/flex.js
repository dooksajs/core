import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {import('@dooksa/create-component').BreakpointAlwaysXXL} BreakpointAlwaysXXL
 * @typedef {import('@dooksa/create-component').BreakpointSmXXL} BreakpointSmXXL
 */

/**
 * @typedef {Object} JustifyContentMixin
 * @property {'start'|'end'|'center'|'between'|'around'|'evenly'} position
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} AlignContentMixin
 * @property {'start'|'end'|'center'|'between'|'around'|'stretch'} position
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} AlignItemsSelfMixin
 * @property {'start'|'end'|'center'|'baseline'|'stretch'} position
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} FlexSizeMixin
 * @property {'0'|'1'} size
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} FlexOrderMixin
 * @property {'0'|'1'|'2'|'3'|'4'|'5'|'first'|'last'} position
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} FlexMixin
 * @property {JustifyContentMixin} [justifyContent]
 * @property {BreakpointAlwaysXXL} [flexDirectionRow]
 * @property {BreakpointAlwaysXXL} [flexDirectionRowReverse]
 * @property {BreakpointAlwaysXXL} [flexDirectionColumn]
 * @property {BreakpointAlwaysXXL} [flexDirectionColumnReverse]
 * @property {AlignContentMixin} [alignContent]
 * @property {AlignItemsSelfMixin} [alignItems]
 * @property {AlignItemsSelfMixin} [alignSelf]
 * @property {BreakpointAlwaysXXL} [flexFill]
 * @property {FlexSizeMixin} [flexGrow]
 * @property {FlexSizeMixin} [flexShrink]
 * @property {BreakpointAlwaysXXL} [flexWrap]
 * @property {BreakpointAlwaysXXL} [flexWrapReverse]
 * @property {BreakpointAlwaysXXL} [flexNoWrap]
 * @property {BreakpointAlwaysXXL} [flexNoWrapReverse]
 * @property {FlexOrderMixin} [flexOrder]
 */


export default createMixin({
  metadata: {
    id: 'flex'
  },
  data: {
    options: {
      flexDirectionRow: {
        name: 'className',
        /**
         * Flex direction row
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-row'
          }

          return 'flex-row'
        }
      },
      flexDirectionRowReverse: {
        name: 'className',
        /**
         * Flex direction row reverse
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-row-reverse'
          }

          return 'flex-row-reverse'
        }
      },
      flexDirectionColumn: {
        name: 'className',
        /**
         * Flex direction column
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-column'
          }

          return 'flex-column'
        }
      },
      flexDirectionColumnReverse: {
        name: 'className',
        /**
         * Flex direction column reverse
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-column-reverse'
          }

          return 'flex-column-reverse'
        }
      },
      justifyContent: {
        name: 'className',
        /**
         * Justify content
         * @param {JustifyContentMixin} param
         * @returns {string}
         */
        computedValue ({ position, breakpoint }) {
          if (breakpoint) {
            return 'justify-content-' + breakpoint + '-' + position
          }

          return 'justify-content-' + position
        }
      },
      alignContent: {
        name: 'className',
        /**
         * Align items
         * @param {AlignContentMixin} param
         * @returns {string}
         */
        computedValue ({ position, breakpoint }) {
          if (breakpoint) {
            return 'align-content-' + breakpoint + '-' + position
          }

          return 'align-content-' + position
        }
      },
      alignItems: {
        name: 'className',
        /**
         * Align items
         * @param {AlignItemsSelfMixin} param
         * @returns {string}
         */
        computedValue ({ position, breakpoint }) {
          if (breakpoint) {
            return 'align-content-' + breakpoint + '-' + position
          }

          return 'align-content-' + position
        }
      },
      alignSelf: {
        name: 'className',
        /**
         * Align self
         * @param {AlignItemsSelfMixin} param
         * @returns {string}
         */
        computedValue ({ position, breakpoint }) {
          if (breakpoint) {
            return 'align-self-' + breakpoint + '-' + position
          }

          return 'align-self-' + position
        }
      },
      flexFill: {
        name: 'className',
        /**
         * Fill
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-fill'
          }

          return 'flex-fill'
        }
      },
      flexGrow: {
        name: 'className',
        /**
         * Flex grow
         * @param {FlexSizeMixin} param
         * @returns {string}
         */
        computedValue ({ size, breakpoint }) {
          if (breakpoint) {
            return 'flex-' + breakpoint + '-grow-' + size
          }

          return 'flex-grow-' + size
        }
      },
      flexShrink: {
        name: 'className',
        /**
         * Flex shrink
         * @param {FlexSizeMixin} param
         * @returns {string}
         */
        computedValue ({ size, breakpoint }) {
          if (breakpoint) {
            return 'flex-' + breakpoint + '-shrink-' + size
          }

          return 'flex-shrink-' + size
        }
      },
      flexWrap: {
        name: 'className',
        /**
         * Wrap
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-wrap'
          }

          return 'flex-warp'
        }
      },
      flexWrapReverse: {
        name: 'className',
        /**
         * Wrap reverse
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-wrap-reverse'
          }

          return 'flex-wrap-reverse'
        }
      },
      flexNoWrap: {
        name: 'className',
        /**
         * No wrap
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-nowrap'
          }

          return 'flex-nowrap'
        }
      },
      flexNoWrapReverse: {
        name: 'className',
        /**
         * No wrap reverse
         * @param {BreakpointAlwaysXXL} breakpoint
         * @returns {string}
         */
        computedValue (breakpoint) {
          if (breakpoint !== 'always') {
            return 'flex-' + breakpoint + '-nowrap-reverse'
          }

          return 'flex-nowrap-reverse'
        }
      },
      flexOrder: {
        name: 'className',
        /**
         * Order
         * @param {FlexOrderMixin} param
         * @returns {string}
         */
        computedValue ({ position, breakpoint }) {
          if (breakpoint) {
            return 'order-' + breakpoint + '-' + position
          }

          return 'order-' + position
        }
      }
    }
  }
})
