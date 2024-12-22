import {
  createComponent, extendComponent
} from '@dooksa/create-component'
import { gapMixin, spacingMixin } from '@dooksa/components/mixins'

/**
 * @typedef {Object} RowColumn
 * @property {'always'|'auto'|'1'|'2'|'3'|'4'|'5'|'6'} column
 * @property {BreakpointAlwaysXXL} [breakpoint]
 * @typedef {Object} RowGap
 * @property {'horizontal'|'vertical'|'all'} direction
 * @property {'1'|'2'|'3'|'4'|'5'} strength
 * @property {BreakpointAlwaysXXL} [breakpoint]
 */

const columns = {
  always: '',
  auto: 'auto',
  1: '1',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6'
}

const breakpoints = {
  sm: '-sm',
  md: '-md',
  lg: '-lg',
  xl: '-xl',
  xxl: '-xxl',
  always: ''
}

const directions = {
  horizontal: 'x',
  vertical: 'y',
  all: ''
}

export const row = createComponent({
  id: 'row',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'row'
    }
  ],
  options: {
    column: {
      name: 'className',
      /**
       * Row columns
       * @param {RowColumn[]} options
       * @returns {string}
       */
      computedValue (options) {
        let classNames = ''
        let firstChar = 'row-cols'

        for (let i = 0; i < options.length; i++) {
          const { column, breakpoint = 'always' } = options[i]

          classNames += firstChar + breakpoints[breakpoint] + '-' + columns[column]
          firstChar = ' row-cols'
        }

        return classNames
      }
    },
    gutter: {
      name: 'className',
      /**
       * Row gap
       * @param {RowGap[]} options
       * @returns {string}
       */
      computedValue (options) {
        let classNames = ''
        let firstChar = 'g'

        for (let i = 0; i < options.length; i++) {
          const { strength, direction = 'all', breakpoint = 'always' } = options[i]

          classNames += firstChar + directions[direction] + breakpoints[breakpoint] + '-' + strength
          firstChar = ' g'
        }

        return classNames
      }
    }
  }
})

/**
 * @import {ComponentExtend, BreakpointAlwaysXXL} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendRowOption
 * @property {RowColumn[]} [column] - Number of columns in the row
 * @property {RowGap[]} [gutter] - Gutters are the padding between your columns
 */

/**
 * @typedef {Object} ExtendRowOptionMixin
 * @property {ExtendRowOption} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendRowOptionMixin} ExtendRow
 */

/**
 * @param {ExtendRow} options
 */
export const createRow = function (options) {
  return extendComponent(row, options)
}
