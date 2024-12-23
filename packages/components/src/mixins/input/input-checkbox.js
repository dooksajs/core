import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputCheckboxMixin
 * @property {boolean} [checked] - Input is checked
 */

/**
 * @typedef {'observeProperty/checked'} InputCheckboxEventTypesMixin
 */

export default createMixin({
  metadata: {
    id: 'input-checkbox'
  },
  data: {
    options: {
      checked: {
        name: 'checked'
      }
    },
    eventTypes: {
      'observeProperty/checked': true
    }
  }
})
