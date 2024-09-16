import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputFileMixin
 * @property {string} [accept] - Input value
 * @property {'true'|'false'} [multiple] - Input is required
 * @property {'user'|'environment'} [capture] - Input is disabled
 */

export default createMixin({
  metadata: {
    id: 'input-file'
  },
  data: {
    options: {
      accept: {
        name: 'accept'
      },
      multiple: {
        name: 'value',
        values: {
          true: true,
          false: false
        }
      },
      capture: {
        name: 'capture',
        values: {
          user: 'user',
          environment: 'environment'
        }
      }
    }
  }
})

