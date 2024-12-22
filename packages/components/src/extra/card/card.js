import { createComponent, extendComponent } from '@dooksa/create-component'
import { cardImg } from './card-img.js'
import { cardBody } from './card-body.js'
import {
  colorMixin, displayMixin, flexMixin, overflowMixin, positionMixin, shadowMixin, spacingMixin
} from '@dooksa/components/mixins'

export const card = createComponent({
  id: 'card',
  tag: 'div',
  children: [cardImg, cardBody],
  allowedChildren: [cardBody, cardImg],
  properties: [
    {
      name: 'className',
      value: 'card'
    }
  ]
}, [shadowMixin, spacingMixin, flexMixin, displayMixin, positionMixin, overflowMixin, colorMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {ShadowMixin, SpacingMixin, FlexMixin, DisplayMixin, PositionMixin, OverflowMixin, ColorMixin} from '#mixins'
 */

/**
 * @typedef {Object} ComponentExtendCard
 * @property {ShadowMixin
 *   | SpacingMixin
 *   | DisplayMixin
 *   | PositionMixin
 *   | FlexMixin
 *   | ColorMixin
 *   | OverflowMixin
 * } [options]
 */

/**
 * @param {ComponentExtend & ComponentExtendCard} options
 */
export const createCard = function (options) {
  return extendComponent(card, options)
}
