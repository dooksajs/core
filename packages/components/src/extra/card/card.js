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
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/styles/shadow.js').ShadowMixin} ShadowMixin
 * @typedef {import('../../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../../mixins/styles/position.js').PositionMixin} PositionMixin
 * @typedef {import('../../mixins/styles/overflow.js').OverflowMixin} OverflowMixin
 * @typedef {import('../../mixins/styles/color.js').ColorMixin} ColorMixin
 */

/**
 * @typedef {Object} ComponentExtendCard
 * @property {ShadowMixin|SpacingMixin|DisplayMixin|PositionMixin|FlexMixin|ColorMixin|OverflowMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendCard} options
 */
export const createCard = function (options) {
  return extendComponent(card, options)
}
