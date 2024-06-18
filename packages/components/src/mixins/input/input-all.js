import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputAllMixin
 * @property {string} [name] - Input name
 * @property {'true'|'false'} [disabled] - Input is disabled
 */

export default createMixin({
  metadata: {
    id: 'input-all'
  },
  data: {
    options: {
      name: {
        name: 'name'
      },
      disabled: {
        name: 'disabled',
        values: {
          true: true,
          false: false
        }
      }
    }
  }
})

