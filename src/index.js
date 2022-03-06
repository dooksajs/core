/**
 * Dooksa widget plugin.
 * @module plugin
 */
export default {
  name: 'dsWidget',
  version: 1,
  dependencies: [
    {
      name: 'dsElement',
      version: 1
    },
    {
      name: 'dsContent',
      version: 1
    }
  ],
  data: {
    content: {},
    children: {},
    layout: {},
    baseItems: {},
    items: {},
    elements: {}
  },
  methods: {
    add (context, { id, instanceId, layout, content, children }) {
      this.children[id] = children
      this.layout[id] = layout
      this.content[instanceId] = content
    },
    addBaseItem (context, { id, item }) {
      this.baseItems[id] = item
    },
    create (context, { layoutId, instanceId }) {
      if (!this.elements[instanceId]) {
        const layout = this.layout[layoutId]
        const children = this.children[layoutId]

        this.elements[instanceId] = this._render(layoutId, instanceId, layout, children, layout)

        return this.elements[instanceId]
      }

      return this.elements[instanceId]
    },
    getElement (context, id) {
      return this.elements[id]
    },
    getBaseItem (context, id) {
      return this.baseItems[id]
    },
    getItem (context, id) {
      return this.items[id]
    },
    setBaseItem (context, item = {}) {
      this.baseItems = { ...this.baseItems, ...item }
    },
    setItem (context, item = {}) {
      this.items = { ...this.items, ...item }
    },
    setChildren (context, item = {}) {
      this.children = { ...this.children, ...item }
    },
    setContent (context, item = {}) {
      this.content = { ...this.content, ...item }
    },
    setLayout (context, item = {}) {
      this.layout = { ...this.layout, ...item }
    },
    _content (id, index) {
      return this.content[id][index]
    },
    _render (layoutId, instanceId, layout, children, childItems) {
      const fragments = []

      for (let i = 0; i < children.length; i++) {
        const item = childItems[children[i]]
        let component

        item.component.elementId = item.component.elementId ? item.component.elementId : instanceId + '__' + i

        if (item.component.type === 'element') {
          component = this.$method('dsElement/create', item.component)
        } else {
          component = this.$method('dsElement/createNode', item.component.id)
        }

        if (item.children) {
          const sibling = this._sibling(layoutId, layout, item.children)
          const childComponent = this._render(
            layoutId,
            instanceId,
            layout,
            sibling.children,
            sibling.items
          )

          if (item.contentIndex) {
            const content = this._content(instanceId, item.contentIndex)

            this.$method('dsContent/subscribe', { id: content.id, item: component })
          }

          for (let i = 0; i < childComponent.length; i++) {
            component.appendChild(childComponent[i])
          }
        } else if (Object.hasOwnProperty.call(item, 'contentIndex')) {
          const content = this._content(instanceId, item.contentIndex)

          this.$method('dsContent/subscribe', { id: content.id, item: component })
        }

        fragments.push(component)
      }

      return fragments
    },
    _sibling (id, items, indexes) {
      const newItems = {
        items: [],
        children: []
      }

      for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i]
        const item = items[index]

        item.component.elementId = id + '__' + index
        newItems.items.push(item)
        newItems.children.push(i)
      }

      return newItems
    }
  }
}
