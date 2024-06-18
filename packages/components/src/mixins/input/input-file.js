import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputFileMixin
 * @property {string} [value] - Input value
 * @property {'true'|'false'} [required] - Input is required
 * @property {'true'|'false'} [disabled] - Input is disabled
 * @property {'true'|'false'} [readonly] - Input is read only
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

