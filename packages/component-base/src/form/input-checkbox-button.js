import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  ariaControlsMixin, ariaExpandedMixin, eventTypeElementChangeMixin, inputAllMixin, inputCheckboxMixin
} from '@dooksa/component-mixins'

export const inputCheckboxButton = createComponent({
  id: 'input-checkbox-button',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'checkbox'
    },
    {
      name: 'className',
      value: 'btn-check'
    },
    {
      name: 'autocomplete',
      value: 'off'
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
    'observeProperty/checked': true,
    'node/checked': true
  }
}, [inputAllMixin, inputCheckboxMixin, ariaExpandedMixin, ariaControlsMixin, eventTypeElementChangeMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/input/input-all.js').InputAllMixin} InputAllMixin
 * @typedef {import('../mixins/input/input-checkbox.js').InputCheckboxMixin} InputCheckboxMixin
 * @typedef {import('../mixins/aria/aria-controls.js').AriaControlsMixin} AriaControlsMixin
 * @typedef {import('../mixins/aria/aria-expanded.js').AriaExpandedMixin} AriaExpandedMixin
 */

/**
 * @typedef {Object} ComponentExtendInputCheckboxButtonOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputCheckboxButton
 * @property {ComponentExtendInputCheckboxButtonOptions|InputCheckboxMixin|InputAllMixin|AriaExpandedMixin|AriaControlsMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendInputCheckboxButton} options
 */
export const extendInputCheckboxButton = function (options) {
  return extendComponent(inputCheckboxButton, options)
}
