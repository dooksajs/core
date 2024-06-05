import { createMixin } from '@dooksa/create-component'

export default createMixin({
  metadata: {
    id: 'display'
  },
  data: {
    options: {
      display: {
        name: 'className',
        computedValues: {
          /**
           * Flex
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          flex (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-flex'
            }

            return 'd-flex'
          },
          /**
           * Inline flex
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          inlineFlex (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-inline-flex'
            }

            return 'd-inline-flex'
          },
          /**
           * Block
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          block (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-block'
            }

            return 'd-block'
          },
          /**
           * Inline block
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          inlineBlock (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-inline'
            }

            return 'd-inline'
          },
          /**
           * Grid
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          grid (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-grid'
            }

            return 'd-grid'
          },
          /**
           * Inline grid
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          inlineGrid (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-inline-grid'
            }

            return 'd-inline-grid'
          },
          /**
           * Table
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          table (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-table'
            }

            return 'd-table'
          },
          /**
           * Table cell
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          tableCell (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-table-cell'
            }

            return 'd-table-cell'
          },
          /**
           * Table row
           * @param {'sm'|'md'|'lg'|'xl'|'xxl'} [breakpoint]
           * @returns {string}
           */
          tableRow (breakpoint) {
            if (breakpoint) {
              return 'd-' + breakpoint + '-table-row'
            }

            return 'd-table-row'
          }
        }
      }
    }
  }
})
