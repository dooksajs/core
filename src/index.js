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
    createSection (context, { parentElement, id, instanceId }) {
      const items = this._getItem(id, instanceId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const component = this._createElement(
          id,
          item.instanceId,
          item.layoutId
        )

        this._appendChildren(component, parentElement)
      }
    },

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
    setItem (context, item = {}) {
      this.items = { ...this.items, ...item }
    },
    setLayout (context, item = {}) {
      this.layout = { ...this.layout, ...item }
    },
    _appendChildren (items, parentElement) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]

        if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
          const parentElement = items[item.parentIndex].element

          parentElement.appendChild(item.element)
        } else {
          parentElement.appendChild(item.element)
        }
      }
    },
    _content (id, index) {
      return this.content[id][index]
    },
    _createElement (id, instanceId, layoutId) {
      if (!this.elements[instanceId]) {
        const layout = this.layout[layoutId]
        const children = this._getChildren(layoutId)

        this.elements[instanceId] = this._renderElement(id, instanceId, layoutId, layout, children, layout)

        return this.elements[instanceId]
      }

      return this.elements[instanceId]
    },
    _getChildren (id) {
      return this.children[id] || [0]
    },
    _getContent (instanceId) {
      return this.content[instanceId]
    },
    _getElement (id) {
      return this.elements[id]
    },
    _getItem (id, instanceId) {
      const instance = id + '__' + instanceId

      if (this.items[instance]) {
        return this.items[instance]
      }

      return this.baseItems[instanceId]
    },
    _setElement (id, item) {
      this.elements[id] = item
    },
    _renderElement (id, instanceId, layoutId, layout, children, childItems) {
      let fragments = []

      for (let i = 0; i < children.length; i++) {
        const item = childItems[children[i]]
        // add element Id
        item.component.elementId = item.component.elementId ? item.component.elementId : instanceId + '__' + i
        // create parent component
        const component = this.$method('dsElement/create' + item.component.type, item.component)
        const fragment = { element: component }

        if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
          fragment.parentIndex = item.parentIndex
        }

        fragments.push(fragment)

        if (item.children) {
          const sibling = this._sibling(layoutId, layout, item.children)
          const childComponent = this._renderElement(
            id,
            instanceId,
            layoutId,
            layout,
            sibling.children,
            sibling.items
          )

          if (Object.hasOwnProperty.call(item, 'contentIndex')) {
            const content = this._content(instanceId, item.contentIndex)

            this.$method('dsContent/subscribe', { id: content.id, item: component })
          }

          fragments = fragments.concat(childComponent)
        } else if (Object.hasOwnProperty.call(item, 'contentIndex')) {
          const content = this._content(instanceId, item.contentIndex)

          if (content.type === 'section') {
            const sectionContent = this.$method('dsContent/get', content.id)
            // get element id?
            this.sections[instanceId] = sectionContent.value
            this.createSection({}, {
              parentElement: component,
              id,
              instanceId: sectionContent.value
            })
          } else {
            this.$method('dsContent/subscribe', { id: content.id, item: component })
          }
        }
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
