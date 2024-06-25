import { createComponent, extendComponent } from '@dooksa/create-component'
import { flexMixin } from '../mixins/index.js'

const tabPane = createComponent({
  id: 'div',
  properties: [
    {
      name: 'className',
      value: 'tab-pane'
    },
    {
      name: 'tabindex',
      value: '0'
    },
    {
      name: 'role',
      value: 'tabpanel'
    }
  ],
  options: {
    id: {
      name: 'id'
    },
    tabIndex: {
      name: 'tabindex',
      values: {
        on: '0',
        off: '-1'
      }
    },
    active: {
      name: 'className',
      value: 'active',
      toggle: true
    }
  }
}, [flexMixin])

/**
 * @typedef {import('@dooksa/create-component').ComponentExtend} ComponentExtend
 * @typedef {import('../mixins/styles/flex.js').FlexMixin} FlexMixin
 */

/**
 * @typedef {Object} ComponentExtendTabPane
 * @property {string} [id]
 * @property {boolean} [active]
 * @property {'on'|'off'} [tabIndex]
 */

/**
 * @typedef {Object} ComponentExtendTabPaneOption
 * @property {ComponentExtendTabPane|FlexMixin} options
 */

/**
 * @param {ComponentExtend|ComponentExtendTabPaneOption} options
 */
function extendTabPane (options) {
  return extendComponent(tabPane, options)
}

export {
  extendTabPane,
  tabPane
}
