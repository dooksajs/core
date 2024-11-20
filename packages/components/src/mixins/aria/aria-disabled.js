import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} AriaDisabledMixin
 * @property {'true'|'false'} [ariaDisabled] - The aria-disabled state indicates that the element is perceivable but disabled, so it is not editable or otherwise operable. {@link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled}
 */

export default createMixin({
  metadata: {
    id: 'aria-disabled'
  },
  data: {
    options: {
      ariaDisabled: {
        name: 'aria-disabled',
        values: {
          true: 'true',
          false: 'false'
        }
      }
    }
  }
})

