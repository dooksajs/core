import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputCheckboxMixin
 * @property {'true' | 'false'} [checked] - Input is required
 */

export default createMixin({
  metadata: {
    id: 'input-checkbox'
  },
  data: {
    options: {
      checked: {
        name: 'checked',
        values: {
          true: true,
          false: false
        }
      }
    }
  }
})
