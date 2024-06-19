import { createComponent, extendComponent } from '@dooksa/create-component'
import { cardImg } from './card-img.js'
import { cardBody } from './card-body.js'
import { flexMixin, shadowMixin, spacingMixin } from '../mixins/index.js'

const card = createComponent({
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
}, [shadowMixin, spacingMixin, flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/shadow.js').ShadowMixin} ShadowMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ComponentExtendCard
 * @property {ShadowMixin|SpacingMixin|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendCard} options
 */
function extendCard (options) {
  return extendComponent(card, options)
}

export {
  card,
  extendCard
}
