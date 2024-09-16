import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputTextMixin
 * @property {number} [maxLength] - Maximum length (number of characters) of value
 * @property {number} [minLength] - Minimum length (number of characters) of value
 * @property {string} [pattern] - Pattern the value must match to be valid
 * @property {string} [placeholder] - Text that appears in the form control when it has no value set
 * @property {'true'|'false'} [readOnly] - The value is not editable
 * @property {'true'|'false'} [required] - A value is required or must be checked for the form to be submittable
 */

export default createMixin({
  metadata: {
    id: 'input-text'
  },
  data: {
    options: {
      maxLength: {
        name: 'maxlength'
      },
      minLength: {
        name: 'minlength'
      },
      pattern: {
        name: 'pattern'
      },
      placeholder: {
        name: 'placeholder'
      },
      readOnly: {
        name: 'readonly',
        values: {
          true: true,
          false: false
        }
      },
      required: {
        name: 'required',
        values: {
          true: true,
          false: false
        }
      }
    }
  }
})

