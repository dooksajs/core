import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} OverflowMixin
 * @property {'auto'|'hidden'|'visible'|'scroll'} [overflow]
 * @property {'auto'|'hidden'|'visible'|'scroll'} [overflowHorizontal]
 * @property {'auto'|'hidden'|'visible'|'scroll'} [overflowVertical]
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
