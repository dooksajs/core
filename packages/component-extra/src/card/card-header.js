import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  colorMixin, displayMixin, flexMixin, positionMixin
} from '@dooksa/component-mixins'
import { extendText } from '@dooksa/component-base'

const cardHeaderText = extendText({
  options: {
    text: 'Header'
  }
})

export const cardHeader = createComponent({
  id: 'card-header',
  tag: 'div',
  children: [cardHeaderText],
  properties: [
    {
      name: 'className',
      value: 'card-header'
    }
  ]
}, [flexMixin, displayMixin, positionMixin, colorMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/styles/flex.js').FlexMixin} FlexMixin
 * @typedef {import('../../mixins/styles/display.js').DisplayMixin} DisplayMixin
 * @typedef {import('../../mixins/styles/position.js').PositionMixin} PositionMixin
 * @typedef {import('../../mixins/styles/color.js').ColorMixin} ColorMixin
 */

/**
 * @typedef {Object} ComponentExtendCardHeader
 * @property {FlexMixin|DisplayMixin|PositionMixin|ColorMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendCardHeader} options
 */
export const extendCardHeader = function (options) {
  return extendComponent(cardHeader, options)
}

