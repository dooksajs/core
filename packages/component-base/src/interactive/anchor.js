import { createComponent, extendComponent } from '@dooksa/create-component'
import { extendText } from '../content/text.js'
import { buttonMixin, eventTypeMouseMixin, positionMixin } from '@dooksa/component-mixins'

const anchorText = extendText({
  options: {
    text: 'Link text...'
  }
})

const anchor = createComponent({
  id: 'anchor',
  tag: 'a',
  children: [anchorText],
  properties: [
    {
      name: 'href',
      value: ''
    }
  ],
  content: [
    {
      name: 'href',
      nodePropertyName: 'href'
    }
  ]
}, [buttonMixin, positionMixin, eventTypeMouseMixin])

/**
 * @import {ComponentExtend} from '@dooksa/create-component'
 * @import {ButtonMixin, PositionMixin, EventTypeMouseMixin} from '@dooksa/component-mixins'
 */

/**
 * @typedef {Object} ComponentExtendAnchor
 * @property {ButtonMixin|PositionMixin} options
 */

/**
 * @typedef {Object} ComponentExtendEventAnchor
 * @property {EventTypeMouseMixin} on
 * @property {string} actionId
 */

/**
 * @typedef {Object} ComponentExtendEvent
 * @property {ComponentExtendEventAnchor[]} events
 */

/**
 * @param {ComponentExtend|ComponentExtendAnchor|ComponentExtendEvent} options
 */
function extendAnchor (options) {
  return extendComponent(anchor, options)
}

export {
  anchor,
  extendAnchor
}
