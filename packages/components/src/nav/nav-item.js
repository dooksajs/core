import { createComponent, extendComponent } from '@dooksa/create-component'
import { flexMixin } from '../mixins/index.js'

const navItem = createComponent({
  id: 'nav-item',
  tag: 'li',
  properties: [
    {
      name: 'className',
      value: 'nav-item'
    }
  ],
  options: {
    presentation: {
      name: 'role',
      value: 'presentation'
    }
  }
}, [flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ComponentExtendNavItem
 * @property {Object} options
 * @property {boolean} [options.presentation] - Indicates if component is expanded
 */

/**
 * @typedef {Object} ComponentExtendNavItemOption
 * @property {ComponentExtendNavItem|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendNavItemOption} options
 */
function extendNavItem (options) {
  return extendComponent(navItem, options)
}

export {
  extendNavItem,
  navItem
}

export default navItem
