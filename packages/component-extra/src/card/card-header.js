import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  colorMixin, displayMixin, flexMixin, positionMixin
} from '@dooksa/component-mixins'
import { createText } from '@dooksa/component-base'

const cardHeaderText = createText({
  options: {
    value: 'Header'
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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {DisplayMixin, FlexMixin, PositionMixin, ColorMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendCardHeaderOptionMixin
 * @property {DisplayMixin|FlexMixin|PositionMixin|ColorMixin} options
 */

/**
 * @typedef {ComponentExtend|ExtendCardHeaderOptionMixin} ExtendCardHeader
 */

/**
 * @param {ExtendCardHeader} options
 */
export const createCardHeader = function (options) {
  return extendComponent(cardHeader, options)
}

