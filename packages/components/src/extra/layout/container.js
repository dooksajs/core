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
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {BackgroundMixin, SpacingMixin, PositionMixin} from '@dooksa/components/mixins'
 */

/**
 * @typedef {Object} ComponentExtendContainer
 * @property {BackgroundMixin | SpacingMixin | PositionMixin} [options]
 */

/**
 * @param {ComponentExtend & ComponentExtendContainer} options -
 */
export const createContainer = function (options) {
  extendComponent(container, options)
}
