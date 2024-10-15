import { displayMixin, gapMixin } from '@dooksa/component-mixins'
import { createComponent, extendComponent } from '@dooksa/create-component'

export const cardBody = createComponent({
  id: 'card-body',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'card-body'
    }
  ]
}, [displayMixin, gapMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {DisplayMixin, GapMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendCardBodyOptionMixin
 * @property {DisplayMixin|GapMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendCardBodyOptionMixin} ExtendCarBody
 */

/**
 * @param {ExtendCarBody} options
 */
export const createCardBody = function (options) {
  return extendComponent(cardBody, options)
}
