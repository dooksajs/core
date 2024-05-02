import { createPlugin } from '@dooksa/create-plugin'

export default createPlugin('component', ({ defineData, defineActions, defineComponents }, { $getDataValue, $component }) => {
  defineData({
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
  })

  defineComponents([
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
      events: ['click', 'hover'],
      content: {
        set: [{
          type: 'attribute',
          name: 'href',
          property: 'value'
        }],
        get: [{
          type: 'attribute',
          name: 'href',
          property: 'value'
        }]
      }
    },
    {
      name: 'img',
      type: 'image',
      content: {
        set: [{
          type: 'attribute',
          name: 'src',
          property: 'value'
        },
        {
          type: 'attribute',
          name: 'alt',
          property: 'alt'
        }],
        get: [{
          type: 'attribute',
          name: 'src',
          property: 'value'
        },
        {
          type: 'attribute',
          name: 'alt',
          property: 'alt'
        }]
      }
    },
    {
      name: 'div'
    },
    {
      name: 'h1'
    },
    {
      name: 'h2'
    },
    {
      name: 'h3'
    },
    {
      name: 'h4'
    },
    {
      name: 'h5'
    },
    {
      name: 'h6'
    },
    {
      name: 'label'
    },
    {
      name: 'small'
    },
    {
      name: 'p'
    },
    {
      name: 'span'
    },
    {
      name: 'nav'
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
      name: 'strong'
    },
    {
      name: 'form',
      events: [{
        name: 'submit'
      }]
    },
    {
      name: 'input-checkbox',
      type: 'input',
      events: [{
        name: 'click',
        syncContent: true
      }],
      content: {
        get: [
          {
            type: 'getter',
            name: 'checked',
            property: 'value'
          }
        ],
        set: [
          {
            type: 'setter',
            name: 'checked',
            property: 'checked'
          }
        ]
      }
    },
    {
      name: 'input',
      type: 'input',
      events: [{
        name: 'input',
        syncContent: true
      }],
      content: {
        get: [
          {
            type: 'getter',
            name: 'value',
            property: 'value',
            token: true
          },
          {
            type: 'getter',
            name: 'checked',
            property: 'checked'
          },
          {
            type: 'attribute',
            name: 'placeholder',
            property: 'placeholder'
          }
        ],
        set: [
          {
            type: 'setter',
            name: 'value',
            property: 'value',
            token: true
          },
          {
            type: 'setter',
            name: 'checked',
            property: 'checked'
          },
          {
            type: 'attribute',
            name: 'placeholder',
            property: 'placeholder'
          }
        ]
      }
    },
    {
      name: 'select',
      type: 'select',
      events: ['input'],
      content: {
        get: [{
          type: 'getter',
          name: 'value',
          property: 'value'
        }]
      }
    },
    {
      name: 'option'
    },
    {
      name: '#text',
      type: 'text',
      content: {
        get: [{
          type: 'getter',
          name: 'textContent',
          property: 'value',
          token: true
        }],
        set: [{
          type: 'setter',
          name: 'textContent',
          property: 'value',
          token: true
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
          name: 'icon',
          property: 'value'
        }],
        get: [{
          type: 'attribute',
          name: 'icon',
          property: 'value'
        }]
      }
    }
  ])

  defineActions({
    fetch (id) {
      const component = $getDataValue('dsComponent/items', { id })

      if (component.id === 'text') {
        return {
          textNode: true
        }
      }

      // The component is lazy loaded
      const webComponent = $component(component.id)

      if (webComponent.isLazy || document.createElement(component.id).constructor.name !== 'HTMLUnknownElement') {
        return {
          tag: component.id,
          attributes: component.attributes
        }
      }
    }
  })
})
