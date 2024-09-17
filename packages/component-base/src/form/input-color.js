import { createComponent, extendComponent } from '@dooksa/create-component'
import { eventTypeElementChangeMixin, formControlMixin, inputAllMixin } from '@dooksa/component-mixins'

export const inputColor = createComponent({
  id: 'input-color',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'color'
    },
    {
      name: 'title',
      value: 'Choose a color'
    },
    {
      name: 'value',
      value: '#563d7c'
    },
    {
      name: 'className',
      value: 'form-control form-control-color'
    }
  ],
  content: [
    {
      name: 'value',
      nodePropertyName: 'value'
    },
    {
      name: 'title',
      nodePropertyName: 'value'
    }
  ],
  options: {
    title: {
      name: 'title'
    },
    id: {
      name: 'id'
    }
  }
}, [formControlMixin, inputAllMixin, eventTypeElementChangeMixin])

/**
 * @import {InputAllMixin, FormControlMixin, EventTypeElementChangeMixin } from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ComponentExtendInputTextColorOptions
 * @property {string} [title]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputTextColor
 * @property {ComponentExtendInputTextColorOptions|FormControlMixin|InputAllMixin} options
 */

/**
 * @typedef {Object} ComponentExtendEventInputColor
 * @property {EventTypeElementChangeMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventInputColor[]} events
 */

/**
 * @param {ComponentExtend|ComponentExtendInputTextColor|ComponentExtendEvent} options
 */
export const extendInputColor = function (options) {
  return extendComponent(inputColor, options)
}
