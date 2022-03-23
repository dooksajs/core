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
    }
  ],
  data: {
    items: {},
    defaultItems: {},
    componentData: {},
    components: {},
    layoutStart: {},
    layout: {}
  },
  methods: {
    create (context, { parentElementId, id, instanceId }) {
      const items = this._getItems(id, instanceId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const components = this._createComponent(
          id,
          item.instanceId,
          item.layoutId
        )

        for (let i = 0; i < components.length; i++) {
          const component = components[i]

          if (Object.prototype.hasOwnProperty.call(component, 'parentIndex')) {
            const parentElementId = components[component.parentIndex].elementId

            this.$method('dsElement/append', {
              parentElementId,
              childElementId: component.elementId
            })
          } else {
            this.$method('dsElement/append', {
              parentElementId,
              childElementId: component.elementId
            })
          }
        }
      }
    },
    update (context, { parentElementId, prevId, prevInstanceId, nextId, nextInstanceId }) {
      const prevItems = this._getItems(prevId, prevInstanceId)
      const nextItems = this._getItems(nextId, nextInstanceId)
      const renderLength = nextItems.length > prevItems.length ? nextItems.length : prevItems.length

      for (let i = 0; i < renderLength; i++) {
        const prevItem = prevItems[i]
        const nextItem = nextItems[i]

        if (nextItem) {
          if (prevItem) {
            if (prevItem.instanceId !== nextItem.instanceId) {
              if (prevItem.layoutId === nextItem.layoutId) {
                const layout = this.layout[nextItem.layoutId]
                let prevComponent = this._getComponent(prevItem.instanceId)
                // Add element reference
                if (!prevComponent) {
                  prevComponent = this._getComponent(nextItem.instanceId)

                  this._setComponent(nextItem.instanceId, prevComponent)
                }

                // Update content
                for (let i = 0; i < layout.length; i++) {
                  if (Object.prototype.hasOwnProperty.call(layout[i], 'contentIndex')) {
                    const prevContent = this._getComponentData(prevItem.instanceId, layout[i].contentIndex)
                    const nextContent = this._getComponentData(nextItem.instanceId, layout[i].contentIndex)

                    if (prevContent.type !== 'section') {
                      this.$method('dsElement/detachContent', { contentId: prevContent.id, elementId: prevComponent[i].elementId })
                      this.$method('dsElement/attachContent', { contentId: nextContent.id, elementId: prevComponent[i].elementId })
                    } else {
                      if (prevContent.id !== nextContent.id) {
                        const prevItemsId = this.$method('dsElement/getValue', prevContent.id)
                        const nextItemsId = this.$method('dsElement/getValue', nextContent.id)

                        this.update({}, {
                          parentElementId: prevComponent[i].elementId,
                          prevId,
                          prevInstanceId: prevItemsId,
                          nextId,
                          nextInstanceId: nextItemsId
                        })
                      }
                    }
                  }
                }
              } else {
                const prevLayoutStart = this._getLayoutStart(prevItem.layoutId)
                const prevComponent = this._getComponent(prevItem.instanceId)
                const nextComponent = this._createComponent(
                  nextId,
                  nextItem.instanceId,
                  nextItem.layoutId
                )
                // Remove previous widget
                for (let i = 0; i < prevLayoutStart.length; i++) {
                  const index = prevLayoutStart[i]

                  this.$method('dsElement/detachElement', prevComponent[index].elementId)
                }
                // Add new widget
                for (let i = 0; i < nextComponent.length; i++) {
                  const item = nextComponent[i]

                  if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
                    this.$method('dsElement/append', {
                      parentElementId: nextComponent[item.parentIndex].elementId,
                      childElementId: item.elementId
                    })
                  } else {
                    this.$method('dsElement/append', {
                      parentElementId,
                      childElementId: item.elementId
                    })
                  }
                }
              }
            }
          } else {
            const nextComponent = this._createComponent(
              nextId,
              nextItem.instanceId,
              nextItem.layoutId
            )

            for (let i = 0; i < nextComponent.length; i++) {
              const item = nextComponent[i]

              if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
                const parentElementId = nextComponent[item.parentIndex].elementId
                const childElementId = item.elementId

                this.$method('dsElement/append', { parentElementId, childElementId })
              } else {
                this.$method('dsElement/append', { parentElementId, childElementId: item.elementId })
              }
            }
          }
        } else {
          const components = this._getComponent(prevItem.instanceId)

          // remove element from the dom
          for (let i = 0; i < components.length; i++) {
            this.$method('dsElement/detachElement', components[i].elementId)
          }
        }
      }
    },
    remove (context, { id, instanceId }) {
      const items = this._getItems(id, instanceId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const layoutStart = this._getLayoutStart(item.layoutId)
        const components = this._getComponent(item.instanceId)
        // remove parent elements from the DOM
        for (let i = 0; i < layoutStart.length; i++) {
          this.$method('dsElement/detachElement', components[i].id)
        }
      }
    },
    setItems (context, item = {}) {
      this.items = Object.assign(item, this.items)
    },
    setDefaultItems (context, item = {}) {
      this.defaultItems = Object.assign(item, this.defaultItems)
    },
    setComponentData (context, item = {}) {
      this.componentData = Object.assign(item, this.componentData)
    },
    setLayout (context, item = {}) {
      this.layout = Object.assign(item, this.layout)
    },
    setLayoutStart (context, item = {}) {
      this.layoutStart = Object.assign(item, this.layoutStart)
    },
    _getComponentData (id, index) {
      return this.componentData[id] && this.componentData[id][index]
    },
    _createComponent (id, instanceId, layoutId) {
      if (this.components[instanceId]) {
        return this.components[instanceId]
      }

      const layout = this.layout[layoutId]
      const layoutStart = this._getLayoutStart(layoutId)
      const component = this._renderComponent(id, instanceId, layoutId, layout, layoutStart, layout)

      this._setComponent(instanceId, component)

      return component
    },
    _getLayoutStart (id) {
      return this.layoutStart[id] || [0]
    },
    _getComponent (id) {
      return this.components[id]
    },
    _getItems (id, instanceId) {
      const itemId = id + '$' + instanceId

      if (this.items[itemId]) {
        return this.items[itemId]
      }

      return this.defaultItems[instanceId]
    },
    _setComponent (id, item) {
      this.components[id] = item
    },
    _renderComponent (id, instanceId, layoutId, layout, layoutStart, layoutSiblings) {
      let fragments = []

      for (let i = 0; i < layoutStart.length; i++) {
        const item = layoutSiblings[layoutStart[i]]
        // add element Id
        item.component.elementId = item.component.elementId ? item.component.elementId : instanceId + '$' + i
        // create parent component
        this.$method('dsElement/create' + item.component.type, item.component)
        const fragment = {
          elementId: item.component.elementId
        }

        if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
          fragment.parentIndex = item.parentIndex
        }

        fragments.push(fragment)

        if (item.children) {
          const sibling = this._getSibling(layoutId, layout, item.children)
          const childComponent = this._renderComponent(
            id,
            instanceId,
            layoutId,
            layout,
            sibling.children,
            sibling.items
          )

          if (Object.hasOwnProperty.call(item, 'contentIndex')) {
            const content = this._getComponentData(instanceId, item.contentIndex)

            this.$method('dsElement/attachContent', { contentId: content.id, elementId: fragment.elementId })
          }

          fragments = fragments.concat(childComponent)
        } else if (Object.hasOwnProperty.call(item, 'contentIndex')) {
          const content = this._getComponentData(instanceId, item.contentIndex)

          if (content.type === 'section') {
            const componentInstanceId = this.$method('dsElement/getValue', content.id)

            // get element id?
            this.create({}, {
              parentElementId: fragment.elementId,
              id,
              instanceId: componentInstanceId
            })
          } else {
            this.$method('dsElement/attachContent', { contentId: content.id, elementId: fragment.elementId })
          }
        }
      }

      return fragments
    },
    _getSibling (id, items, indexes) {
      const newItems = {
        items: [],
        children: []
      }

      for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i]
        const item = items[index]

        item.component.elementId = id + '$' + index
        newItems.items.push(item)
        newItems.children.push(i)
      }

      return newItems
    }
  }
}
