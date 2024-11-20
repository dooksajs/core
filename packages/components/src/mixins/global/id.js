import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} IdMixin
 * @property {string} [id] - Element id
 */

export default createMixin({
  metadata: {
    id: 'id'
  },
  data: {
    options: {
      id: {
        name: 'id',
        replace: true
      }
    }
  }
})
