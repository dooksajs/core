/**
 * @typedef {Object} dsComponent - Component schema used to construct an Text node or Element
 * @property {boolean} Component.textNode - Declares if component is a textNode or not
 * @property {string} Component.tag - Tag name used to create the node [(tagName)]{@link https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName}
 * @property {Object.<string, string>} Component.attributes - Element attributes
 */

/**
 * Dooksa components
 * @namespace dsComponent
 */
export default {
  name: 'dsComponent',
  version: 1,
  data: {
    items: {}
  },
  components: [
    {
      name: 'button',
      type: 'button',
      events: ['click']
    },
    {
      name: 'a',
      type: 'link',
      set: {
        type: 'attribute',
        value: 'href'
      },
      get: {
        type: 'attribute',
        value: 'href'
      },
      events: ['click', 'hover']
    },
    {
      name: 'img',
      type: 'image',
      set: {
        type: 'attribute',
        value: [
          {
            name: 'src',
            key: 'src'
          },
          {
            name: 'alt',
            key: 'alt'
          }
        ]
      },
      get: {
        type: 'attribute',
        value: [
          {
            name: 'src',
            key: 'src'
          },
          {
            name: 'alt',
            key: 'alt'
          }
        ]
      },
      events: ['click']
    },
    {
      name: 'div',
      type: 'html',
      set: {
        type: 'setter',
        value: 'innerHTML'
      },
      events: ['click']
    },
    {
      name: 'input',
      type: 'text',
      events: ['input'],
      get: {
        type: 'getter',
        value: 'value'
      },
      set: {
        type: 'setter',
        value: 'value'
      }
    },
    {
      name: '#text',
      type: 'text',
      get: {
        type: 'getter',
        value: [
          {
            name: 'textContent',
            key: 'text'
          }
        ]
      }
    },
    {
      name: 'iconify-icon',
      lazy: () => import('iconify-icon'),
      set: [{
        type: 'attribute',
        value: 'icon'
      }],
      get: [{
        type: 'attribute',
        value: 'icon'
      }]
    }
  ],
  /** @lends dsComponent */
  methods: {
    /**
     * Get the component tag needed to create an element
     * @param {Object} param
     * @param {String} param.dsComponentId - The id of the component
     * @param {String} param.dsComponentModifierId - This might be redundant due to modified components being precompiled
     * @returns {dsComponent}
     */
    get ({ dsComponentId, dsComponentModifierId }) {
      const component = this.items[dsComponentId]

      if (component.id === 'text') {
        return {
          textNode: true
        }
      }

      // The component is lazy loaded
      const webComponent = this.$component(component.id)

      if (document.createElement(component.id).constructor.name !== 'HTMLUnknownElement' || webComponent.isLazy) {
        return {
          tag: component.id,
          attributes: component.attributes
        }
      }
    },
    /**
     * Add component
     * @param {Object} item
     * @param {string} item.id - Node name used to create the node [(nodeName)]{@link https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeName}
     * @param {Object.<string, string>} - Element attributes
     */
    set (dsComponent) {
      this.items = { ...this.items, ...dsComponent }
    }
  }
}
