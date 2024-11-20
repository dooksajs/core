import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputNumberMixin
 * @property {number} [max] - Maximum value
 * @property {number} [min] - Minimum value
 * @property {number} [step] - Incremental values that are valid
 */

export default createMixin({
  metadata: {
    id: 'input-number'
  },
  data: {
    options: {
      max: {
        name: 'max'
      },
      minLength: {
        name: 'minlength'
      },
      step: {
        name: 'step'
      },
      placeholder: {
        name: 'placeholder'
      }
    }
  }
})

