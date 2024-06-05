import { createComponent, extendComponent } from '@dooksa/create-component'
import spacing from '../mixins/spacing.js'

const icon = createComponent({
  id: 'icon',
  tag: 'iconify-icon',
  component: () => import('iconify-icon'),
  content: [
    {
      name: 'value',
      get: 'icon',
      set: 'icon'
    }
  ],
  properties: [
    {
      name: 'icon',
      value: 'mdi:settings'
    },
    {
      name: 'inline',
      value: 'inline'
    }
  ],
  options: {
    icon: {
      name: 'icon',
      replace: true
    },
    inline: {
      name: 'inline',
      values: {
        on: 'inline',
        off: ''
      }
    }
  },
  styles: [
    {
      name: 'font-size',
      type: 'unit'
    }
  ]
}, [spacing])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/spacing.js').SpacingMixin} SpacingMixin
 */

/**
 * @typedef {Object} ComponentExtendText
 * @property {string} [icon] - Icon value from iconify
 */

/**
 * @typedef {Object} MergeOptions
 * @property {SpacingMixin|ComponentExtendText} options
 */

/**
 * @param {ComponentExtend|MergeOptions} options
 */
function extendIcon (options) {
  extendComponent(icon, options)
}

export {
  icon,
  extendIcon
}

export default icon
