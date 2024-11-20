import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  eventTypeElementChangeMixin,
  formControlMixin,
  idMixin,
  inputAllMixin
} from '@dooksa/components/mixins'

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
    title: { name: 'title' }
  }
}, [idMixin, formControlMixin, inputAllMixin, eventTypeElementChangeMixin])

/**
 * @import {IdMixin, InputAllMixin, FormControlMixin, EventTypeElementChangeMixin } from '@dooksa/components/mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputColorOption
 * @property {string} [title]
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputColorOptionMixin
 * @property {ExtendInputColorOption|IdMixin|FormControlMixin|InputAllMixin} options
 */

/**
 * @typedef {Object} ExtendInputColorEvent
 * @property {EventTypeElementChangeMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputColorEventMixin
 * @property {ExtendInputColorEvent[]} events
 */

/**
 * @typedef {ComponentExtend|ExtendInputColorEventMixin|ExtendInputColorOptionMixin} ExtendInputColor
 */

/**
 * @param {ExtendInputColor} options
 */
export const createInputColor = function (options) {
  return extendComponent(inputColor, options)
}
