import { spacingMixin } from '#mixins'
import { createComponent, extendComponent } from '@dooksa/create-component'

export const formCheck = createComponent({
  id: 'form-check',
  tag: 'div',
  children: [],
  properties: [
    {
      name: 'className',
      value: 'form-check'
    }
  ],
  options: {
    switch: {
      name: 'className',
      value: 'form-switch'
    },
    inline: {
      name: 'className',
      value: 'form-check-inline'
    },
    reverse: {
      name: 'className',
      value: 'form-check-reverse'
    }
  }
}, [spacingMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {SpacingMixin} from '#mixins'
 */

/**
 * @typedef {Object} ExtendFormCheckOption
 * @property {boolean} [switch]
 * @property {boolean} [inline]
 * @property {boolean} [reverse]
 */

/**
 * @typedef {Object} ExtendFormCheckOptionMixin
 * @property {ExtendFormCheckOption | SpacingMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendFormCheckOptionMixin} ExtendFormCheck
 */

/**
 * @param {ExtendFormCheck} options
 */
export const createFormCheck = function (options) {
  return extendComponent(formCheck, options)
}
