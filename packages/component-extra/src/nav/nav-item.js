import { createComponent, extendComponent } from '@dooksa/create-component'
import { flexMixin } from '@dooksa/component-mixins'

export const navItem = createComponent({
  id: 'nav-item',
  tag: 'li',
  properties: [
    {
      name: 'className',
      value: 'nav-item'
    }
  ],
  options: {
    rolePresentation: {
      name: 'role',
      value: 'presentation'
    }
  }
}, [flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('@dooksa/component-mixins/src/styles/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ComponentExtendNavItem
 * @property {boolean} [rolePresentation] - Indicates if component is expanded
 */

/**
 * @typedef {Object} ComponentExtendNavItemOption
 * @property {ComponentExtendNavItem|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendNavItemOption} options
 */
export const extendNavItem = function (options) {
  return extendComponent(navItem, options)
}
