import { definePlugin } from '@dooksa/ds-app'

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
export default definePlugin({
  name: 'dsComponent',
  version: 1,
  data: {
    items: {
      default: () => ({
        '0f64a9b82c6f98f7': {
          _item: { id: 'text' }
        },
        '43f4f4c34d66e648': {
          _item: { id: 'div' }
        }
      }),
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
                type: 'array',
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
          name: 'href'
        }],
        get: [{
          type: 'attribute',
          name: 'href'
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
          name: 'src',
          contentProperty: 'src'
        },
        {
          type: 'attribute',
          name: 'alt',
          contentProperty: 'alt'
        }],
        get: [{
          type: 'attribute',
          name: 'src',
          contentProperty: 'src'
        },
        {
          type: 'attribute',
          name: 'alt',
          contentProperty: 'alt'
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
          name: 'innerHTML'
        }]
      }
    },
    {
      name: 'h1',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'h2',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'h3',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'h4',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'h5',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'h6',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'label',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'small',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'p',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'span',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'nav',
      type: 'text',
      content: {
        set: [{
          type: 'setter',
          name: 'textContent'
        }]
      }
    },
    {
      name: 'ul'
    },
    {
      name: 'ol'
    },
    {
      name: 'section'
    },
    {
      name: 'footer'
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
      name: 'form',
      events: [{
        name: 'submit'
      }]
    },
    {
      name: 'input',
      type: 'text',
      events: [{
        name: 'input',
        updateContent: true
      }],
      content: {
        get: [{
          type: 'getter',
          name: 'value'
        }],
        set: [{
          type: 'setter',
          name: 'value'
        }]
      },
      props: {
        get: [{
          type: 'attribute',
          name: 'placeholder',
          property: 'placeholder'
        }],
        set: [{
          type: 'attribute',
          name: 'placeholder',
          property: 'placeholder'
        }]
      }
    },
    {
      name: 'select',
      type: 'select',
      content: {
        get: [{
          type: 'getter',
          name: 'value'
        }]
      }
    },
    {
      name: 'option',
      type: 'option',
      content: {
        get: [{
          type: 'getter',
          name: 'value'
        }],
        set: [{
          type: 'setter',
          name: 'value'
        }]
      }
    },
    {
      name: '#text',
      type: 'text',
      content: {
        get: [{
          type: 'getter',
          name: 'textContent'
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
          name: 'icon'
        }],
        get: [{
          type: 'attribute',
          name: 'icon'
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
})
