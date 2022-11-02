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
  methods: {
    /**
     * Get the component tag needed to create an element
     * @param {String} item.id - The id of the component
     * @param {String} item.modifierId - This might be redundant due to modified components being precompiled
     * @returns
     */
    get (context, { id, modifierId }) {
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
    set (context, item) {
      this.items = { ...this.items, ...item }
    }
  }
}
