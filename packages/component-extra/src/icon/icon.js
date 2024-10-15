import {
  createComponent, extendComponent
} from '@dooksa/create-component'
import { spacingMixin } from '@dooksa/component-mixins'

export const icon = createComponent({
  id: 'icon',
  tag: 'span',
  content: [
    {
      name: 'value',
      nodePropertyName: 'data-icon'
    }
  ],
  properties: [
    {
      name: 'className',
      value: 'icon'
    }
  ],
  options: {
    icon: {
      name: 'data-icon',
      replace: true
    }
  },
  eventTypes: { 'observeAttribute/data-icon': true },
  events: [
    {
      on: 'component/created',
      actionId: 'icon-render'
    },
    {
      on: 'observeAttribute/data-icon',
      actionId: 'icon-render'
    }
  ]
}, [spacingMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {SpacingMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendIconOption
 * @property {string} [icon] - Icon value from iconify
 * @property {boolean} [inline] - Add vertical-align to icon
 */

/**
 * @typedef {Object} ExtendIconOptionMixin
 * @property {SpacingMixin|ExtendIconOption} options
 */

/**
 * @typedef {ComponentExtend|ExtendIconOptionMixin} ExtendIcon
 */

/**
 * @param {ExtendIcon} options
 */
export const createIcon = function (options) {
  return extendComponent(icon, options)
}
