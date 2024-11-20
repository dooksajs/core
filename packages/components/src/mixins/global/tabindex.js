import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} TabIndexMixin
 * @property {'on'|'off'|'2'|'3'|'4'|'5'} [tabIndex] - Tabindex allows developers to make HTML elements focusable {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex}
 */

export default createMixin({
  metadata: {
    id: 'tabIndex'
  },
  data: {
    options: {
      tabIndex: {
        name: 'tabindex',
        values: {
          on: '1',
          off: '-1',
          2: '2',
          3: '3',
          4: '4',
          5: '5'
        }
      }
    }
  }
})

