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
      default: {
        13610321: {
          id: 'h1'
        },
        '106802e9': {
          id: 'a'
        },
        '1ced044d': {
          id: 'text'
        },
        '181103cb': {
          id: 'div'
        }
      },
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            id: {
              type: 'string'
            },
            attributes: {
              type: 'array',
              items: {
                array: 'array',
                items: {
                  type: 'string'
                }
              }
            }
          }
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

      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'h2',
      type: 'text',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'h5',
      type: 'text',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'h6',
      type: 'text',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'label',
      type: 'text',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'small',
      type: 'text',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'p',
      type: 'text',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'span',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'nav',
      type: 'text',
      set: {
        type: 'setter',
        value: [
          {
            name: 'textContent',
            key: 'value'
          }
        ]
      }
    },
    {
      name: 'ul'
    },
    {
      name: 'li'
    },
    {
      name: 'hr'
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
            key: 'value'
          }
        ]
      },
      set: {
        type: 'setter',
        value: [
          {
            name: 'value',
            key: 'value'
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
            key: 'value'
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
