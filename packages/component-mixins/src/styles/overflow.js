import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {'auto'|'hidden'|'visible'|'scroll'} OverFlow
 */

/**
 * @typedef {Object} OverflowMixin
 * @property {OverFlow} [overflow]
 * @property {OverFlow} [overflowHorizontal]
 * @property {OverFlow} [overflowVertical]
 */

export default createMixin({
  metadata: {
    id: 'overflow'
  },
  data: {
    options: {
      overflow: {
        name: 'className',
        values: {
          auto: 'overflow-auto',
          hidden: 'overflow-hidden',
          visible: 'overflow-visible',
          scroll: 'overflow-scroll'
        }
      },
      overflowHorizontal: {
        name: 'className',
        values: {
          auto: 'overflow-x-auto',
          hidden: 'overflow-x-hidden',
          visible: 'overflow-x-visible',
          scroll: 'overflow-x-scroll'
        }
      },
      overflowVertical: {
        name: 'className',
        values: {
          auto: 'overflow-y-auto',
          hidden: 'overflow-y-hidden',
          visible: 'overflow-y-visible',
          scroll: 'overflow-y-scroll'
        }
      }
    }
  }
})
