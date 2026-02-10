import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TableHeaderMixin
 * @property {'col'|'colgroup'|'row'|'rowgroup'} [scope] - Defines the cells that the header (defined in the th) relates to
 * @property {string} [abbr] - Alternative label to use for the header cell when referencing the cell in other contexts
 */

export default createMixin({
  metadata: {
    id: 'table-header'
  },
  data: {
    options: {
      scope: {
        name: 'scope',
        values: {
          col: 'col',
          colgroup: 'colgroup',
          row: 'row',
          rowgroup: 'rowgroup'
        }
      },
      abbr: {
        name: 'abbr'
      }
    }
  }
})
