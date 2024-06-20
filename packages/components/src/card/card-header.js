import { createComponent, extendComponent } from '@dooksa/create-component'
import { displayMixin, flexMixin, positionMixin } from '../mixins/index.js'
import { extendText } from '../text/text.js'

const cardHeaderText = extendText({
  options: {
    text: 'Header'
  }
})

const cardHeader = createComponent({
  id: 'card-header',
  tag: 'div',
  children: [cardHeaderText],
  properties: [
    {
      name: 'className',
      value: 'card-header'
    }
  ]
}, [flexMixin, displayMixin, positionMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../mixins/styles/position.js').PositionMixin} PositionMixin
 */

/**
 * @typedef {Object} ComponentExtendCardHeader
 * @property {FlexMixin|DisplayMixin|PositionMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendCardHeader} options
 */
function extendCardHeader (options) {
  return extendComponent(cardHeader, options)
}

export {
  cardHeader,
  extendCardHeader
}
