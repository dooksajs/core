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
    getComponents ({ dsWidgetInstanceId, dsWidgetView = 'default' }) {
      return this.components[dsWidgetView + dsWidgetInstanceId]
    },
    render ({ dsLayoutId, dsWidgetSectionId, dsWidgetInstanceId, dsWidgetView = 'default', dsViewId = 'appElement', dsWidgetPrefixId, language = 'default' }) {
      let components = this.getComponents({ dsWidgetInstanceId, dsWidgetView })

      if (!components) {
        const items = this._getItem(dsLayoutId)
        const head = this._getHead(dsLayoutId)
        const events = this._getEvent(dsLayoutId)

        components = this._create(dsLayoutId, items, head, items, events, dsWidgetSectionId, dsWidgetInstanceId, dsViewId, dsWidgetPrefixId, language, dsWidgetView)

        // ISSUE: [DS-810] This is unnecessary loop if _create function can attach components
        for (let i = 0; i < components.length; i++) {
          const component = components[i]

          this._attachComponent(components, component, dsWidgetSectionId, dsWidgetInstanceId, dsWidgetView, dsViewId, dsWidgetPrefixId, language)
        }

        this._setComponents(dsWidgetInstanceId, components, dsWidgetView)
      } else {
        for (let i = 0; i < components.length; i++) {
          const component = components[i]

          this._attachComponent(components, component, dsWidgetSectionId, dsWidgetInstanceId, dsWidgetView, dsViewId, dsWidgetPrefixId, language)
        }
      }
    },
    setHead (head) {
      this.head = { ...this.head, ...head }
    },
    setModifiers (items) {
      this.modifiers = { ...this.modifiers, ...items }
    },
    setItems (items) {
      this.items = { ...this.items, ...items }
    },
    _attachComponent (components, component, dsWidgetSectionId, dsWidgetInstanceId, dsWidgetView, dsViewParentId, dsWidgetPrefixId, language) {
      let dsViewId = dsViewParentId

      if (component.viewId) {
        dsViewParentId = !isNaN(component.parentIndex) ? components[component.parentIndex].viewId : dsViewParentId

        dsViewId = component.viewId

        this.$method('dsView/append', {
          dsViewId: component.viewId,
          dsViewParentId
        })
      }

      if (!isNaN(component.contentIndex)) {
        const dsContentId = this.$method('dsWidget/getContentItem', {
          dsWidgetSectionId,
          dsWidgetInstanceId,
          dsWidgetPrefixId,
          dsViewId: dsViewParentId,
          dsWidgetView,
          contentIndex: component.contentIndex
        })
        const dsContentType = this.$method('dsContent/getType', dsContentId)

        if (dsContentType[0] === 'section') {
          const newSectionId = this.$method('dsContent/getValue', dsContentId)

          // create a new widget and append it to this element item
          this.$method('dsWidget/create', {
            dsWidgetSectionId,
            dsViewId: dsViewParentId,
            dsWidgetPrefixId,
            language,
            dsWidgetView
          })

          this.$method('dsWidget/setSectionParentId', { dsWidgetSectionId: newSectionId, dsWidgetSectionParentId: dsWidgetSectionId })
        } else {
          // missing parentElement
          this.$method('dsContent/attachView', { dsContentId, dsViewId })
        }

        this.$method('dsWidget/attach', { type: 'content', id: dsContentId })
      }
    },
    _create (id, items, head, children, events, sectionId, instanceId, dsViewParentId, dsWidgetPrefixId, lang, view, components = [], componentChildren, currentIndex = 0) {
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
        let dsViewId = componentChildren[head[i]]

        if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
          fragment.parentIndex = item.parentIndex
        }

        if (item.componentId) {
          const modifierId = this.$method('dsWidget/getLayout', sectionId + instanceId + '_' + view)
          const payload = {
            dsComponentId: item.componentId
          }

          if (this.modifiers[modifierId] && this.modifiers[modifierId][currentIndex]) {
            payload.dsComponentModifierId = this.modifiers[modifierId][currentIndex]
          }

          const dsComponent = this.$method('dsComponent/get', payload)

          if (dsComponent.textNode) {
            this.$method('dsView/createNode', dsViewId)
          } else {
            this.$method('dsView/createElement', {
              dsViewId,
              dsWidgetSectionId: sectionId,
              dsWidgetInstanceId: instanceId,
              dsComponent
            })
          }
          // create parent component

          // add event listener to node
          if (events[currentIndex]) {
            const event = events[currentIndex]

            for (let i = 0; i < event.action.length; i++) {
              this.$method('dsEvent/addListener', { id: dsViewId, name: event.on, dsActionId: event.action[i] })
            }
          }

          fragment.viewId = dsViewId
        } else {
          dsViewId = dsViewParentId
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
            dsViewParentId,
            dsWidgetPrefixId,
            lang,
            view,
            components,
            sibling.components,
            ++currentIndex
          )

          if (Object.hasOwnProperty.call(item, 'contentIndex')) {
            // this fragment contains content
            fragment.contentIndex = item.contentIndex
          }

          fragments = fragments.concat(result)
        } else if (Object.hasOwnProperty.call(item, 'contentIndex')) {
          // mark fragment has content
          fragment.contentIndex = item.contentIndex
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
