import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'100'|'75'|'50'|'25'|'auto'} Sizing
 */

/**
 * @typedef {Object} SizingMixin
 * @property {Sizing} [height]
 * @property {'100'} [heightViewport]
 * @property {'100'} [minHeightViewport]
 * @property {Sizing} [width]
 * @property {'100'} [widthViewport]
 * @property {'100'} [minWidthViewport]
 */

export default createMixin({
  metadata: { id: 'sizing' },
  data: {
    options: {
      height: {
        name: 'className',
        values: {
          100: 'h-100',
          75: 'h-75',
          50: 'h-50',
          25: 'h-25',
          auto: 'h-auto'
        }
      },
      heightViewport: {
        name: 'className',
        values: {
          100: 'vh-100'
        }
      },
      minHeightViewport: {
        name: 'className',
        values: {
          100: 'min-vh-100'
        }
      },
      width: {
        name: 'className',
        values: {
          100: 'w-100',
          75: 'w-75',
          50: 'w-50',
          25: 'w-25',
          auto: 'w-auto'
        }
      },
      widthViewport: {
        name: 'className',
        values: {
          100: 'vw-100'
        }
      },
      minWidthViewport: {
        name: 'className',
        values: {
          100: 'min-vw-100'
        }
      }
    }
  }
})
