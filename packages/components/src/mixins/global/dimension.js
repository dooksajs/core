import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} DimensionMixin
 * @property {string|number} [width] - The width of the element
 * @property {string|number} [height] - The height of the element
 */

export default createMixin({
  metadata: { id: 'dimension' },
  data: {
    options: {
      width: {
        name: 'width'
      },
      height: {
        name: 'height'
      }
    }
  }
})
