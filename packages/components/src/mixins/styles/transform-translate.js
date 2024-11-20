import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TransformTranslateMixin
 * @property {'middle'|'bottom'|'top'} [transformTranslate]
 */

export default createMixin({
  metadata: {
    id: 'transform-translate'
  },
  data: {
    options: {
      transformTranslate: {
        name: 'className',
        values: {
          middle: 'translate-middle',
          bottom: 'translate-middle-x',
          top: 'translate-middle-y'
        }
      }
    },
    styles: [
      {
        name: 'translate',
        type: 'units'
      }
    ]
  }
})
