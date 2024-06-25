import { createComponent, extendComponent } from '@dooksa/create-component'
import { card } from '../card/card.js'
import { backgroundMixin, spacingMixin, positionMixin } from '../mixins/index.js'
import { text } from '../text/text.js'
import { button } from '../button/button.js'

const container = createComponent({
  id: 'container',
  tag: 'div',
  allowedChildren: [card, text, button],
  properties: [
    {
      name: 'className',
      value: 'container'
    }
  ]
}, [backgroundMixin, spacingMixin, positionMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/background.js').BackgroundMixin} BackgroundMixin
 * @typedef {import('../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
 * @typedef {import('../mixins/styles/position.js').PositionMixin} PositionMixin
 */

/**
 * @typedef {Object} ComponentExtendContainer
 * @property {BackgroundMixin|SpacingMixin|PositionMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendContainer} options
 */
function extendContainerComponent (options) {
  extendComponent(text, options)
}

export {
  container,
  extendContainerComponent
}
