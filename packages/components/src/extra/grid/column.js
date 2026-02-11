import {
  createComponent, extendComponent
} from '@dooksa/create-component'
import { gapMixin, spacingMixin } from '@dooksa/components/mixins'

/**
 * @typedef {Object} Column
 * @property {'always'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'10'|'11'|'12'} column
 * @property {BreakpointAlwaysXXL} [breakpoint]
 */

const columns = {
  always: '',
  1: '-1',
  2: '-2',
  3: '-3',
  4: '-4',
  5: '-5',
  6: '-6',
  7: '-7',
  8: '-8',
  9: '-9',
  10: '-10',
  11: '-11',
  12: '-12'
}

const breakpoints = {
  sm: '-sm',
  md: '-md',
  lg: '-lg',
  xl: '-xl',
  xxl: '-xxl',
  always: ''
}

export const column = createComponent({
  id: 'column',
  tag: 'div',
  options: {
    column: {
      name: 'className',
      /**
       * Columns
       * @param {Column[]} options -
       * @returns {string}
       */
      computedValue (options) {
        let classNames = ''
        let firstChar = 'col'

        for (let i = 0; i < options.length; i++) {
          const { column = 'always', breakpoint = 'always' } = options[i]

          classNames += firstChar + breakpoints[breakpoint] + columns[column]
          firstChar = ' col'
        }

        return classNames
      }
    }
  }
}, [gapMixin, spacingMixin])

/**
 * @import {ComponentExtend, BreakpointAlwaysXXL} from '@dooksa/create-component'
 * @import {SpacingMixin, GapMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendColumnOption
 * @property {Column[]} [column] - Number of columns
 */

/**
 * @typedef {Object} ExtendColumnOptionMixin
 * @property {ExtendColumnOption | SpacingMixin | GapMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendColumnOptionMixin} ExtendColumn
 */

/**
 * @param {ExtendColumn} options -
 */
export const createColumn = function (options) {
  return extendComponent(column, options)
}
