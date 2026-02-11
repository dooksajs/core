import { createMixin } from '@dooksa/create-component'
import { breakpoints } from './utils.js'

/**
 * @import {BreakpointAlwaysXXL, BreakpointSmXXL} from '@dooksa/create-component'
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
 * @typedef {Object} AlignItemsMixin
 * @property {'start'|'end'|'center'|'baseline'|'stretch'} position
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} FlexSizeMixin
 * @property {'grow'|'shrink'} type
 * @property {'0'|'1'} size
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} FlexOrderMixin
 * @property {'0'|'1'|'2'|'3'|'4'|'5'|'first'|'last'} position
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} BreakpointMixin
 * @property {BreakpointSmXXL} [breakpoint]
 */

/**
 * @typedef {Object} FlexWrap
 * @property {BreakpointSmXXL} [breakpoint]
 * @property {'wrap'|'wrapReverse'|'noWrap'|'noWrapReverse'} type
 */

/**
 * @typedef {Object} FlexDirection
 * @property {'row'|'rowReverse'|'column'|'columnReverse'} direction
 * @property {BreakpointAlwaysXXL} [breakpoint]
 */

/**
 * @typedef {Object} FlexMixin
 * @property {JustifyContentMixin[]} [justifyContent]
 * @property {FlexDirection[]} [flexDirection]
 * @property {AlignContentMixin[]} [alignContent]
 * @property {AlignItemsMixin[]} [alignItems]
 * @property {AlignItemsMixin[]} [alignSelf]
 * @property {BreakpointMixin[]} [flexFill]
 * @property {FlexSizeMixin[]} [flexSize]
 * @property {FlexWrap[]} [flexWrap]
 * @property {FlexOrderMixin[]} [flexOrder]
 */

const alignValues = {
  start: 'start',
  end: 'end',
  center: 'center',
  baseline: 'baseline',
  stretch: 'stretch'
}

export default createMixin({
  metadata: {
    id: 'flex'
  },
  data: {
    options: {
      flexDirection: {
        name: 'className',
        infixValues: {
          className: 'flex',
          infixes: [
            {
              name: 'breakpoint',
              values: breakpoints
            },
            {
              name: 'direction',
              values: {
                row: 'row',
                rowReverse: 'row-reverse',
                column: 'column',
                columnReverse: 'column-reverse'
              }
            }
          ]
        }
      },
      justifyContent: {
        name: 'className',
        infixValues: {
          className: 'justify-content',
          infixes: [
            {
              name: 'position',
              values: {
                start: 'start',
                end: 'end',
                center: 'center',
                between: 'between',
                around: 'around',
                evenly: 'evenly'
              }
            },
            {
              name: 'breakpoint',
              values: breakpoints
            }
          ]
        }
      },
      alignContent: {
        name: 'className',
        infixValues: {
          className: 'align-content',
          infixes: [
            {
              name: 'position',
              values: {
                start: 'start',
                end: 'end',
                center: 'center',
                between: 'between',
                around: 'around',
                stretch: 'stretch'
              }
            },
            {
              name: 'breakpoint',
              values: breakpoints
            }
          ]
        }
      },
      alignItems: {
        name: 'className',
        infixValues: {
          className: 'align-items',
          infixes: [
            {
              name: 'position',
              values: alignValues
            },
            {
              name: 'breakpoint',
              values: breakpoints
            }
          ]
        }
      },
      alignSelf: {
        name: 'className',
        infixValues: {
          className: 'align-items',
          infixes: [
            {
              name: 'position',
              values: alignValues
            },
            {
              name: 'breakpoint',
              values: breakpoints
            }
          ]
        }
      },
      flexFill: {
        name: 'className',
        /**
         * Fill
         * @param {BreakpointMixin[]} options -          */
        infixValues: {
          className: 'flex',
          infixes: [
            {
              name: 'breakpoint',
              values: breakpoints
            }
          ],
          suffix: 'fill'
        }
      },
      flexSize: {
        name: 'className',
        infixValues: {
          className: 'flex',
          infixes: [
            {
              name: 'breakpoint',
              values: breakpoints
            },
            {
              name: 'type',
              values: {
                grow: 'grow',
                shrink: 'shrink'
              }
            },
            {
              name: 'size',
              values: {
                0: '0',
                1: '1'
              }
            }
          ]
        }
      },
      flexWrap: {
        name: 'className',
        infixValues: {
          className: 'flex',
          infixes: [
            {
              name: 'breakpoint',
              values: breakpoints
            },
            {
              name: 'type',
              values: {
                wrap: 'wrap',
                wrapReverse: 'wrap-reverse',
                noWrap: 'no-wrap',
                noWrapReverse: 'no-wrap-reverse'
              }
            }
          ]
        }
      },
      flexOrder: {
        name: 'className',
        infixValues: {
          className: 'order',
          infixes: [
            {
              name: 'breakpoint',
              values: breakpoints
            },
            {
              name: 'position',
              values: {
                0: '0',
                1: '1',
                2: '2',
                3: '3',
                4: '4',
                5: '5',
                first: 'first',
                last: 'last'
              }
            }
          ]
        }
      }
    }
  }
})
