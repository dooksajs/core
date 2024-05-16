import createPlugin from '@dooksa/create-plugin'
import { $getDataValue, $setDataValue } from './data.js'

/** @type {Function} */
let _$component = () => {}
/** @type {Function} */
let _$componentGetter = () => {}
/** @type {Function} */
let _$componentSetter = () => {}

const component = createPlugin({
  name: 'component',
  models: {
    items: {
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
  ],
  actions: {
    $component (name) {
      const component = _$component(name)

      if (!component) {
        throw Error('No component found by the name of: ' + name)
      }

      // lazy load component
      if (component.isLazy && !component.isLoaded) {
        component.isLoaded = true

        component.lazy()
          .catch(e => console.error(e))
      }

      return component
    },
    $componentGetter (name) {
      return _$componentGetter(name)
    },
    $componentSetter (name) {
      return _$componentSetter(name)
    },
    fetch (id) {
      const component = $getDataValue('component/items', { id }).item

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

      return component
    }
  },
  setup ({ component, componentGetter, componentSetter }) {
    _$component = component
    _$componentGetter = componentGetter
    _$componentSetter = componentSetter

    $setDataValue('component/items', {
      '0f64a9b82c6f98f7': {
        _item: { id: 'text' }
      },
      '43f4f4c34d66e648': {
        _item: { id: 'div' }
      }
    }, {
      merge: true
    })
  }
})

const $component = component.actions.$component
const $componentGetter = component.actions.$componentGetter
const $componentSetter = component.actions.$componentSetter

export {
  $component,
  $componentGetter,
  $componentSetter
}

export default component

