import { createComponent, extendComponent } from '@dooksa/create-component'
import { spacingMixin } from '@dooksa/component-mixins'

export const icon = createComponent({
  id: 'icon',
  tag: 'iconify-icon',
  component: () => import('iconify-icon'),
  content: [
    {
      name: 'value',
      nodePropertyName: 'icon'
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
}, [spacingMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../../mixins/styles/spacing.js').SpacingMixin} SpacingMixin
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
export const extendIcon = function (options) {
  return extendComponent(icon, options)
}
