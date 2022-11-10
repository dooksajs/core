/**
 * Dooksa layout tools.
 * @module plugin
 */
export default {
  name: 'dsLayout',
  version: 1,
  data: {
    metadata: {},
    event: {},
    items: {},
    head: {},
    components: {},
    modifiers: {}
  },
  methods: {
    getComponents (context, { instanceId, view = 'default' }) {
      return this.components[view + instanceId]
    },
    render (context, { id, sectionId, instanceId, view = 'default', parentElementId = 'appElement', prefixId, lang = 'default' }) {
      let components = this.getComponents({}, { instanceId, view })

      if (!components) {
        const items = this._getItem(id)
        const head = this._getHead(id)
        const events = this._getEvent(id)

        components = this._create(id, items, head, items, events, sectionId, instanceId, parentElementId, prefixId, lang, view)

        // ISSUE: [DS-810] This is unnecessary loop if _create function can attach components
        for (let i = 0; i < components.length; i++) {
          const component = components[i]

          this._attachComponent(components, component, sectionId, instanceId, view, parentElementId, prefixId, lang)
        }

        this._setComponents(instanceId, components, view)
      } else {
        for (let i = 0; i < components.length; i++) {
          const component = components[i]

          this._attachComponent(components, component, sectionId, instanceId, view, parentElementId, prefixId, lang)
        }

        this.$method('dsWidget/attachItem', { type: 'instance', id: instanceId })
      }
    },
    setHead (context, head) {
      this.head = { ...this.head, ...head }
    },
    setModifiers (context, items) {
      this.modifiers = { ...this.modifiers, ...items }
    },
    setItems (context, items) {
      this.items = { ...this.items, ...items }
    },
    _attachComponent (components, component, sectionId, instanceId, view, parentElementId, prefixId, lang) {
      let elementId = parentElementId

      if (component.elementId) {
        const parentId = !isNaN(component.parentIndex) ? components[component.parentIndex].elementId : parentElementId

        elementId = component.elementId

        this.$method('dsElement/append', {
          parentId,
          childId: component.elementId
        })
      }

      if (Object.hasOwnProperty.call(component, 'contentIndex')) {
        const contentId = this.$method('dsWidget/getContentItem', {
          sectionId,
          instanceId,
          prefixId,
          parentElementId,
          view,
          index: component.contentIndex
        })
        const contentType = this.$method('dsElement/getType', contentId)

        if (contentType[0] === 'section') {
          const sectionId = this.$method('dsElement/getValue', { id: contentId })

          // create a new widget and append it to this element item
          this.$method('dsWidget/create', {
            id: sectionId,
            parentElementId,
            prefixId,
            lang,
            view
          })
        } else {
          // missing parentElement
          this.$method('dsElement/attachContent', { contentId, elementId, lang })
        }

        this.$method('dsWidget/attachItem', { type: 'content', id: contentId })
      }
    },
    _create (id, items, head, children, events, sectionId, instanceId, parentElementId, prefixId, lang, view, components = [], componentChildren, currentIndex = 0) {
      // components might make this variable redundant
      // position of components within the layout
      let fragments = []

      if (!components.length) {
        for (let i = 0; i < items.length; i++) {
          components.push(instanceId + '_' + i.toString().padStart(4, '0'))
        }

        componentChildren = components
      }

      for (let i = 0; i < head.length; i++) {
        const item = children[head[i]]
        const fragment = {}
        let elementId = componentChildren[head[i]]

        if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
          fragment.parentIndex = item.parentIndex
        }

        if (item.componentId) {
          const modifierId = this.$method('dsWidget/getLayout', sectionId + instanceId + '_' + view)
          const payload = {
            id: item.componentId
          }

          if (this.modifiers[modifierId] && this.modifiers[modifierId][currentIndex]) {
            payload.modifierId = this.modifiers[modifierId][currentIndex]
          }

          const component = this.$method('dsComponent/get', payload)

          if (component.textNode) {
            this.$method('dsElement/createNode', elementId)
          } else {
            this.$method('dsElement/createElement', { id: elementId, sectionId, instanceId, item: component })
          }
          // create parent component

          // add event listener to element
          if (events[currentIndex]) {
            const event = events[currentIndex]

            for (let i = 0; i < event.action.length; i++) {
              this.$method('dsEvent/addListener', { id: elementId, name: event.on, item: event.action[i] })
            }
          }

          fragment.elementId = elementId
        } else {
          elementId = parentElementId
        }

        fragments.push(fragment)

        if (item.children) {
          const sibling = this._getSibling(items, item.children, components)
          const result = this._create(
            id,
            items,
            sibling.head,
            sibling.children,
            events,
            sectionId,
            instanceId,
            parentElementId,
            prefixId,
            lang,
            view,
            components,
            sibling.components,
            ++currentIndex
          )

          if (Object.hasOwnProperty.call(item, 'contentIndex')) {
            const contentId = this.$method('dsWidget/getContentItem', {
              sectionId,
              instanceId,
              prefixId,
              parentElementId,
              index: item.contentIndex
            })
            // this fragment contains content
            fragment.contentIndex = item.contentIndex

            this.$method('dsElement/attachContent', { contentId, elementId, lang })
            this.$method('dsWidget/attachItem', { type: 'content', id: contentId })
          }

          fragments = fragments.concat(result)
        } else if (Object.hasOwnProperty.call(item, 'contentIndex')) {
          const contentId = this.$method('dsWidget/getContentItem', {
            sectionId,
            instanceId,
            prefixId,
            parentElementId,
            index: item.contentIndex
          })
          // mark fragment has content
          fragment.contentIndex = item.contentIndex

          const contentType = this.$method('dsElement/getType', contentId)

          if (contentType[0] === 'section') {
            const newSectionId = this.$method('dsElement/getValue', { id: contentId })
            // create a new widget and append it to this component item
            this.$method('dsWidget/create', {
              id: newSectionId,
              parentElementId: elementId,
              prefixId,
              lang,
              view
            })

            this.$method('dsWidget/setSectionParentId', { childId: newSectionId, parentId: sectionId })
          } else {
            // missing parentElement
            this.$method('dsElement/attachContent', { contentId, elementId, lang })
          }

          this.$method('dsWidget/attachItem', { type: 'content', id: contentId })
        }

        currentIndex++
      }

      return fragments
    },
    _setComponents (id, item, view) {
      this.components[view + id] = item
    },
    _getHead (id) {
      return this.head[id] || [0]
    },
    _getEvent (id) {
      return this.event[id] || []
    },
    _getItem (id) {
      return this.items[id]
    },
    _getSibling (items, indexes, components) {
      const newItems = {
        head: [],
        children: [],
        components: []
      }

      for (let i = 0; i < indexes.length; i++) {
        const index = indexes[i]

        newItems.components.push(components[index])
        newItems.children.push(items[index])
        newItems.head.push(i)
      }

      return newItems
    }
  }
}
