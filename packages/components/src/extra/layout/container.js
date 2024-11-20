import { createComponent, extendComponent } from '@dooksa/create-component'
import {
  backgroundMixin, spacingMixin, positionMixin
} from '@dooksa/components/mixins'

export const container = createComponent({
  id: 'container',
  tag: 'div',
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
export const createContainer = function (options) {
  extendComponent(container, options)
}
