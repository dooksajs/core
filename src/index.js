/**
 * Dooksa component tools.
 * @module plugin
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
  methods: {
    /**
     * Get the component tag needed to create an element
     * @param {String} item.id - The id of the component
     * @param {String} item.modifierId - This might be redundant due to modified components being precompiled
     * @returns
     */
    get ({ id, modifierId }) {
      const component = this.items[id]

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
    set (item) {
      this.items = { ...this.items, ...item }
    }
  }
}
