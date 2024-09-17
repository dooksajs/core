import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  eventTypeElementCancelMixin,
  eventTypeElementChangeMixin,
  formControlMixin, inputAllMixin, inputFileMixin
} from '@dooksa/component-mixins'

export const inputFile = createComponent({
  id: 'input-file',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'file'
    },
    {
      name: 'className',
      value: 'form-control'
    }
  ],
  options: {
    id: {
      name: 'id'
    }
  }
}, [formControlMixin, inputAllMixin, inputFileMixin, eventTypeElementChangeMixin, eventTypeElementCancelMixin])

/**
 * @import {InputAllMixin, FormControlMixin, InputFileMixin, EventTypeElementChangeMixin, EventTypeElementCancelMixin } from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ComponentExtendInputFileOptions
 * @property {string} [id]
 */

/**
 * @typedef {Object} ComponentExtendInputFile
 * @property {ComponentExtendInputFileOptions|FormControlMixin|InputAllMixin|InputFileMixin} options
 */

/**
 * @typedef {Object} ComponentExtendEventInputFile
 * @property {EventTypeElementChangeMixin|EventTypeElementCancelMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventInputFile[]} events
 */

/**
 * @param {ComponentExtend|ComponentExtendInputFile|ComponentExtendEvent} options
 */
export const extendInputFile = function (options) {
  return extendComponent(inputFile, options)
}
