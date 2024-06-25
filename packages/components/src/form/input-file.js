import { createComponent, extendComponent } from '@dooksa/create-component'
import { formControlMixin, inputAllMixin, inputFileMixin } from '../mixins/index.js'

const inputFile = createComponent({
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
 * @typedef {import('../mixins/styles/form-control.js').FormControlMixin} FormControlMixin
 * @typedef {import('../mixins/input/input-all.js').InputAllMixin} InputAllMixin
 * @typedef {import('../mixins/input/input-file.js').InputFileMixin} InputFileMixin
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
function extendInputFile (options) {
  return extendComponent(inputFile, options)
}

export {
  inputFile,
  extendInputFile
}
