import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputDirMixin
 * @property {string} [dirname] - Input value
 */

export default createMixin({
  metadata: {
    id: 'input-dir'
  },
  data: {
    options: {
      dirname: {
        name: 'dirname'
      }
    }
  }
})

