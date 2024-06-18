import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} AriaCurrentMixin
 * @property {'page'|'step'|'location'|'date'|'time'|'true'|'false'} [ariaCurrent] - A non-null aria-current state on an element indicates that this element represents the current item within a container or set of related elements. {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current}
 */

export default createMixin({
  metadata: {
    id: 'aria-current'
  },
  data: {
    options: {
      ariaCurrent: {
        name: 'aria-current',
        values: {
          page: 'page',
          step: 'step',
          location: 'location',
          date: 'date',
          time: 'time',
          true: 'true',
          false: 'false'
        }
      }
    }
  }
})

