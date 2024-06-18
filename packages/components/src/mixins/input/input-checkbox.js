import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputCheckboxMixin
 * @property {'true'|'false'} [checked] - Input is required
 */

export default createMixin({
  metadata: {
    id: 'input-checkbox'
  },
  data: {
    content: [
      {
        name: 'checked',
        propertyName: 'checked'
      }
    ],
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
