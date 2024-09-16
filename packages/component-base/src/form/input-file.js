import { createComponent, extendComponent } from '@dooksa/create-component'
import {
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
}, [formControlMixin, inputAllMixin, inputFileMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/styles/form-control.js').FormControlMixin} FormControlMixin
 * @typedef {import('@dooksa/component-mixins/src/input/input-all.js').InputAllMixin} InputAllMixin
 * @typedef {import('@dooksa/component-mixins/src/input/input-file.js').InputFileMixin} InputFileMixin
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
 * @param {ComponentExtend|ComponentExtendInputFile} options
 */
export const extendInputFile = function (options) {
  return extendComponent(inputFile, options)
}
