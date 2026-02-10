import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TableColMixin
 * @property {string|number} [span] - Number of columns that the col spans
 */

export default createMixin({
  metadata: {
    id: 'table-col'
  },
  data: {
    options: {
      span: {
        name: 'span'
      }
    }
  }
})
