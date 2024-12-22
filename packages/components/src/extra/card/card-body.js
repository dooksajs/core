import { displayMixin, gapMixin, spacingMixin } from '@dooksa/components/mixins'
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
}, [displayMixin, gapMixin, spacingMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {DisplayMixin, GapMixin, SpacingMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ExtendCardBodyOptionMixin
 * @property {DisplayMixin | GapMixin | SpacingMixin} [options]
 */

/**
 * @typedef {ComponentExtend & ExtendCardBodyOptionMixin} ExtendCarBody
 */

/**
 * @param {ExtendCarBody} options
 */
export const createCardBody = function (options) {
  return extendComponent(cardBody, options)
}
