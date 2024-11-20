import { createMixin } from '@dooksa/create-component'

/**
 * @typedef {Object} InputAllMixin
 * @property {string} [name] - Name of the form control. Submitted with the form as part of a name/value pair
 * @property {string} [value] - The value of the control. When specified in the HTML, corresponds to the initial value
 * @property {string} [form] - Associates the control with a form element
 * @property {'true'|'false'} [disabled] - Whether the form control is disabled
 * @property {'true'|'false'} [required] - A value is required or must be checked for the form to be submittable
 */

export default createMixin({
  metadata: { id: 'input-all' },
  data: {
    options: {
      name: {
        name: 'name',
        replace: true
      },
      disabled: {
        name: 'disabled',
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
      },
      value: {
        name: 'value'
      },
      form: {
        name: 'form',
        replace: true
      }
    }
  }
})
