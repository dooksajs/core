import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TranslateMixin
 * @property {'yes'|'no'} [translate] - {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/translate}
 */

export default createMixin({
  metadata: {
    id: 'translate'
  },
  data: {
    options: {
      translate: {
        name: 'translate',
        values: {
          yes: 'yes',
          no: 'no'
        }
      }
    }
  }
})

