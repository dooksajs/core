import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin } from '@dooksa/components/mixins'

export const code = createComponent({
  id: 'code',
  tag: 'code'
}, [spacingMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {SpacingMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendCodeOptionMixin
 * @property {SpacingMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendCodeOptionMixin} ExtendCode
 */

/**
 * @param {ExtendCode} options
 */
export const createCode = function (options) {
  return extendComponent(code, options)
}
