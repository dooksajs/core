import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaControlsMixin, ariaExpandedMixin, eventTypeElementChangeMixin, eventTypeMouseMixin, inputAllMixin, inputCheckboxMixin
} from '@dooksa/component-mixins'

export const inputCheckbox = createComponent({
  id: 'input-checkbox',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'checkbox'
    },
    {
      name: 'className',
      value: 'form-check-input'
    }
  ],
  content: [
    {
      name: 'checked',
      nodePropertyName: 'checked'
    }
  ],
  options: {
    id: {
      name: 'id'
    }
  },
  events: [
    {
      on: 'component/mount',
      actionId: 'label-id'
    }
  ],
  eventTypes: {
    'observeProperty/checked': true
  }
}, [inputAllMixin, inputCheckboxMixin, ariaExpandedMixin, ariaControlsMixin, eventTypeMouseMixin, eventTypeElementChangeMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/input/input-all.js').InputAllMixin} InputAllMixin
 * @typedef {import('../mixins/input/input-checkbox.js').InputCheckboxMixin} InputCheckboxMixin
 * @typedef {import('../mixins/aria/aria-controls.js').AriaControlsMixin} AriaControlsMixin
 * @typedef {import('../mixins/aria/aria-expanded.js').AriaExpandedMixin} AriaExpandedMixin
 */

/**
 * @typedef {Object} ComponentExtendInputTextOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputCheckbox
 * @property {ComponentExtendInputTextOptions|InputCheckboxMixin|InputAllMixin|AriaExpandedMixin|AriaControlsMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendInputCheckbox} options
 */
export const extendInputCheckbox = function (options) {
  return extendComponent(inputCheckbox, options)
}
