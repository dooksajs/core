import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin, displayMixin, flexMixin
} from '@dooksa/components/mixins'

export const modalFooter = createComponent({
  id: 'modal-footer',
  tag: 'div',
  properties: [
    {
      name: 'className',
      value: 'modal-footer'
    }
  ]

}, [backgroundMixin, displayMixin, flexMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {BackgroundMixin, DisplayMixin, FlexMixin} from '#mixins'
 */

/**
 * @typedef {Object} ExtendModalFooter
 * @property {BackgroundMixin | DisplayMixin | FlexMixin} [options]
 */

/**
 * @param {ComponentExtend & ExtendModalFooter} options -
 */
export const createModalFooter = function (options) {
  return extendComponent(modalFooter, options)
}
