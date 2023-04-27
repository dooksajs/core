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
    items: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    }
  },
  components: [
    {
      name: 'button',
      type: 'button',
      events: ['click', 'hover']
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
      name: 'h1',
      type: 'text',
      get: {
        type: 'getter',
        value: [
          {
            name: 'textContent',
            key: 'text'
          }
        ]
      },
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'text'
          }
        ]
      }
    },
    {
      name: 'input',
      type: 'text',
      events: ['input'],
      get: {
        type: 'getter',
        value: [
          {
            name: 'value',
            key: 'text'
          }
        ]
      },
      set: {
        type: 'setter',
        value: [
          {
            name: 'value',
            key: 'text'
          }
        ]
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
      type: 'icon',
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
  methods: {
    fetch (id) {
      const component = this.$getDataValue({
        name: 'dsComponent/items',
        id
      })

      if (component.id === 'text') {
        return {
          textNode: true
        }
      }

      // The component is lazy loaded
      const webComponent = this.$component(component.id)

      if (webComponent.isLazy || document.createElement(component.id).constructor.name !== 'HTMLUnknownElement') {
        return {
          tag: component.id,
          attributes: component.attributes
        }
      }
    }
  }
}
