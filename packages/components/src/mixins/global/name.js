import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} NameMixin
 * @property {string} [name] - Element name
 */

export default createMixin({
  metadata: {
    id: 'name'
  },
  data: {
    options: {
      name: {
        name: 'name',
        replace: true
      }
    }
  }
})

