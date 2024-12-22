import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  idMixin,
  inputAllMixin
} from '@dooksa/components/mixins'

export const inputHidden = createComponent({
  id: 'input-hidden',
  tag: 'input',
  properties: [
    {
      name: 'type',
      value: 'hidden'
    }
  ]
}, [idMixin, inputAllMixin])

/**
 * @import {IdMixin, InputAllMixin } from '@dooksa/components/mixins'
 * @import {ComponentExtend} from '@dooksa/create-component'
 */

/**
 * @typedef {Object} ExtendInputHiddenOptionMixin
 * @property {IdMixin | InputAllMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendInputHiddenOptionMixin} ExtendInputHidden
 */

/**
 * @param {ExtendInputHidden} options
 */
export const createInputHidden = function (options) {
  return extendComponent(inputHidden, options)
}
