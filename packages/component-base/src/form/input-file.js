import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  eventTypeElementCancelMixin,
  eventTypeElementChangeMixin,
  formControlMixin, idMixin, inputAllMixin, inputFileMixin
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
}, [idMixin ,formControlMixin, inputAllMixin, inputFileMixin, eventTypeElementChangeMixin, eventTypeElementCancelMixin])

/**
 * @import {IdMixin, InputAllMixin, FormControlMixin, InputFileMixin, EventTypeElementChangeMixin, EventTypeElementCancelMixin } from '@dooksa/component-mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputFileOption
 * @property {string} [id]
 */

/**
 * @typedef {Object} ExtendInputFileOptionMixin
 * @property {ExtendInputFileOption|FormControlMixin|InputAllMixin|InputFileMixin|IdMixin} options
 */

/**
 * @typedef {Object} ExtendInputFileEvent
 * @property {EventTypeElementChangeMixin|EventTypeElementCancelMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendInputFileEventMixin
 * @property {ExtendInputFileEvent[]} events
 */

/**
 * @typedef {ComponentExtend|ExtendInputFileEventMixin|ExtendInputFileOptionMixin} ExtendInputFile
 */

/**
 * @param {ExtendInputFile} options
 */
export const extendInputFile = function (options) {
  return extendComponent(inputFile, options)
}
