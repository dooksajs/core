import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TableCellMixin
 * @property {string|number} [colSpan] - Number of columns that the cell spans
 * @property {string|number} [rowSpan] - Number of rows that the cell spans
 * @property {string} [headers] - IDs of the headers associated with the cell
 */

export default createMixin({
  metadata: {
    id: 'table-cell'
  },
  data: {
    options: {
      colSpan: {
        name: 'colspan'
      },
      rowSpan: {
        name: 'rowspan'
      },
      headers: {
        name: 'headers'
      }
    }
  }
})
