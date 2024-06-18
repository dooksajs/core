import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} AriaSelectedMixin
 * @property {'page'|'step'|'location'|'date'|'time'|'true'|'false'} [ariaSelected] - The aria-selected attribute indicates the current "selected" state of various widgets. {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected}
 */

export default createMixin({
  metadata: {
    id: 'aria-selected'
  },
  data: {
    options: {
      ariaCurrent: {
        name: 'aria-selected',
        values: {
          true: 'true',
          false: 'false'
        }
      }
    }
  }
})

