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
        '0f64a9b82c6f98f7': {
          id: 'text'
        },
        '43f4f4c34d66e648': {
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
      name: 'text',
      type: 'text'
    },
    {
      name: 'button',
      type: 'button',
      events: ['click', 'hover']
    },
    {
      name: 'a',
      type: 'link',
      content: {
        set: [{
          type: 'attribute',
          value: 'href'
        }],
        get: [{
          type: 'attribute',
          value: 'href'
        }]
      },
      events: ['click', 'hover']
    },
    {
      name: 'img',
      type: 'image',
      content: {
        set: [{
          type: 'attribute',
          value: {
            name: 'src',
            key: 'src'
          }
        },
        {
          type: 'attribute',
          value: {
            name: 'alt',
            key: 'alt'
          }
        }],
        get: [{
          type: 'attribute',
          value: {
            name: 'src',
            key: 'src'
          }
        },
        {
          type: 'attribute',
          value: {
            name: 'alt',
            key: 'alt'
          }
        }]
      },
      events: ['click']
    },
    {
      name: 'div',
      type: 'html',
      content: {
        set: [{
          type: 'setter',
          value: 'innerHTML'
        }]
      },
      events: ['click']
    },
    {
      name: 'h1',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'h2',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'h3',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'h4',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'h5',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'h6',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'label',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'small',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'p',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'span',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'nav',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'ul'
    },
    {
      name: 'section'
    },
    {
      name: 'li'
    },
    {
      name: 'hr'
    },
    {
      name: 'i'
    },
    {
      name: 'input',
      type: 'text',
      events: ['input'],
      content: {
        get: [{
          type: 'getter',
          value: 'value'
        }],
        set: [{
          type: 'setter',
          value: 'value'
        }]
      }
    },
    {
      name: 'select',
      type: 'select',
      content: {
        get: [{
          type: 'getter',
          value: 'value'
        }]
      }
    },
    {
      name: 'option',
      type: 'option',
      content: {
        get: [{
          type: 'getter',
          value: 'value'
        }],
        set: [{
          type: 'setter',
          value: 'value'
        }]
      }
    },
    {
      name: '#text',
      type: 'text',
      content: {
        get: [{
          type: 'getter',
          value: 'textContent'
        }]
      }
    },
    {
      name: 'iconify-icon',
      type: 'icon',
      lazy: () => import('iconify-icon'),
      content: {
        set: [{
          type: 'attribute',
          value: 'icon'
        }],
        get: [{
          type: 'attribute',
          value: 'icon'
        }]
      }
    }
  ],
  methods: {
    fetch (id) {
      const component = this.$getDataValue('dsComponent/items', { id })

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
