import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} PositionMixin
 * @property {'relative'|'static'|'absolute'|'sticky'|'fixed'} [position]
 */

export default createMixin({
  metadata: {
    id: 'position'
  },
  data: {
    options: {
      position: {
        name: 'className',
        values: {
          relative: 'position-relative',
          static: 'position-static',
          absolute: 'position-absolute',
          sticky: 'position-sticky',
          fixed: 'position-fixed'
        }
      }
    }
  }
})
