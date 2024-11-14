import { createComponent, extendComponent } from '@dooksa/create-component'
import { createText } from '../content/text.js'
import { buttonMixin, eventTypeMouseMixin, positionMixin } from '@dooksa/component-mixins'

const anchorText = createText({
  options: {
    value: 'Link text...'
  }
})

export const anchor = createComponent({
  id: 'anchor',
  tag: 'a',
  children: [anchorText],
  properties: [
    {
      name: 'href',
      value: ''
    }
  ],
  options: {
    href: {
      name: 'href'
    }
  }
}, [buttonMixin, positionMixin, eventTypeMouseMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {ButtonMixin, PositionMixin, EventTypeMouseMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ExtendAnchorOptionMixin
 * @property {ButtonMixin|PositionMixin} options
 */

/**
 * @typedef {Object} ExtendAnchorEvent
 * @property {EventTypeMouseMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ExtendEventMixin
 * @property {ExtendAnchorEvent[]} events
 */

/**
 * @typedef {ComponentExtend|ExtendAnchorOptionMixin|ExtendEventMixin} ExtendAnchor
 */

/**
 * @param {ExtendAnchor} options
 */
export const createAnchor = function (options) {
  return extendComponent(anchor, options)
}
