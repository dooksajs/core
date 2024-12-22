import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  displayMixin, flexMixin, gapMixin, spacingMixin
} from '@dooksa/components/mixins'

export const modalBody = createComponent({
  id: 'modal-body',
  tag: 'div',
  allowedChildren: [],
  properties: [
    {
      name: 'className',
      value: 'modal-body'
    }
  ]
}, [displayMixin, flexMixin, spacingMixin, gapMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {DisplayMixin, SpacingMixin, GapMixin, FlexMixin} from '#mixins'
 */

/**
 * @typedef {Object} ExtendModalBody
 * @property {DisplayMixin | SpacingMixin | GapMixin | FlexMixin} [options]
 */

/**
 * @param {ComponentExtend & ExtendModalBody} options
 */
export const createModalBody = function (options) {
  return extendComponent(modalBody, options)
}
