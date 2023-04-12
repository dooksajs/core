/**
 * Dooksa layout tools.
 * @module plugin
 */
export default {
  name: 'dsLayout',
  version: 1,
  data: {
    events: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    },
    items: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'object',
            required: ['componentId'],
            properties: {
              contentIndex: { type: 'number' },
              parentIndex: { type: 'number' },
              children: {
                type: 'array',
                items: { type: 'number' }
              },
              componentId: {
                type: 'string',
                relation: 'dsComponent/items'
              }
            }
          }
        }
      }
    },
    entry: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: { type: 'number' }
        }
      }
    },
    components: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object'
        }
      }
    }
  },
  /** @lends dsLayout */
  methods: {
    attach ({
      dsLayoutId,
      dsWidgetSectionId,
      dsWidgetInstanceId,
      dsWidgetMode,
      dsViewId,
      dsWidgetPrefixId
    }) {
      const language = this.$getDataValue({ name: 'dsMetadata/language' })
      let components = this.$getDataValue({
        name: 'dsLayout/components',
        id: dsWidgetInstanceId,
        prefixId: dsWidgetMode
      })

      if (!dsViewId) {
        dsViewId = this.$getDataValue({
          name: 'dsWidget/sectionView',
          id: dsWidgetSectionId
        })
      }

      if (components.isEmpty) {
        const items = this.$getDataValue({
          name: 'dsLayout/items',
          id: dsLayoutId
        })
        const entry = this.$getDataValue({
          name: 'dsLayout/entry',
          id: dsLayoutId
        })
        const events = this.$getDataValue({
          name: 'dsLayout/events',
          id: dsLayoutId
        })

        components = this._create(
          dsLayoutId,
          items.value,
          entry.value,
          items.value,
          events.value,
          dsWidgetSectionId,
          dsWidgetInstanceId,
          dsViewId,
          dsWidgetPrefixId,
          language.value,
          dsWidgetMode
        )

        // ISSUE: [DS-810] This is unnecessary loop if _create function can attach components
        for (let i = 0; i < components.length; i++) {
          const component = components[i]

          this._attachComponent(
            components,
            component,
            dsWidgetSectionId,
            dsWidgetInstanceId,
            dsWidgetMode,
            dsViewId,
            dsWidgetPrefixId,
            language.value
          )
        }

        // this._setComponents(dsWidgetInstanceId, dsWidgetPrefixId, dsWidgetMode, components)
      } else {
        for (let i = 0; i < components.length; i++) {
          const component = components[i]

          this._attachComponent(
            components,
            component,
            dsWidgetSectionId,
            dsWidgetInstanceId,
            dsWidgetMode,
            dsViewId,
            dsWidgetPrefixId,
            language
          )
        }
      }
    },
    _attachComponent (
      components,
      component,
      dsWidgetSectionId,
      dsWidgetInstanceId,
      dsWidgetMode,
      dsViewParentId,
      dsWidgetPrefixId,
      language
    ) {
      let dsViewId = dsViewParentId

      if (component.dsViewId) {
        dsViewParentId = Number.isInteger(component.parentIndex) ? components[component.parentIndex].dsViewId : dsViewParentId

        dsViewId = component.dsViewId

        this.$method('dsView/append', {
          dsViewId: component.dsViewId,
          dsViewParentId
        })
      }

      if (!Number.isInteger(component.contentIndex)) {
        return
      }

      const dsContentId = this.$getDataValue({
        name: 'dsWidget/instanceContent',
        id: dsWidgetInstanceId,
        prefixId: dsWidgetPrefixId,
        suffixId: dsWidgetMode,
        options: {
          position: component.contentIndex
        }
      })

      const dsContentType = this.$getDataValue({
        name: 'dsContent/type',
        id: dsContentId.value
      })

      if (dsContentType.name === 'section') {
        const dsWidgetSectionId = this.$getDataValue({
          name: 'dsContent/value',
          id: dsContentId.value
        })

        // create a new widget and append it to this element item
        this.$method('dsWidget/attachSection', {
          dsWidgetSectionId,
          dsViewId: dsViewParentId,
          dsWidgetPrefixId,
          dsWidgetMode
        })
      } else {
        // missing parentElement
        this.$method('dsView/updateValue', { dsViewId, dsContentId: dsContentId.value })

        this.$addDataListener({
          name: 'dsContent/value',
          on: 'update',
          id: dsContentId.value,
          listener: () => {
            this.$method('dsView/updateValue', { dsViewId, dsContentId: dsContentId.value })
          }
        })

        this.$emit({
          id: dsViewId,
          on: 'dsContent/attachView',
          payload: {
            dsContentId: dsContentId.value,
            dsViewId
          }
        })
      }
    },
    _create (
      id,
      items,
      entry = [0],
      children,
      events = [],
      dsWidgetSectionId,
      dsWidgetInstanceId,
      dsViewParentId,
      dsWidgetPrefixId,
      dsWidgetMode,
      lang,
      components = [],
      componentChildren,
      currentIndex = 0
    ) {
      // components might make this variable redundant
      // position of components within the layout
      let fragments = []

      if (!components.length) {
        for (let i = 0; i < items.length; i++) {
          components.push(dsWidgetInstanceId + i.toString().padStart(4, '0'))
        }

        componentChildren = components
      }

      for (let i = 0; i < entry.length; i++) {
        const item = children[entry[i]]
        const fragment = {}
        let dsViewId = componentChildren[entry[i]]

        if (Object.prototype.hasOwnProperty.call(item, 'parentIndex')) {
          fragment.parentIndex = item.parentIndex
        }

        if (item.componentId) {
          // const modifierId = this.$method('dsWidget/getLayout', sectionId + instanceId + '_' + view)
          // const payload = {
          //   dsComponentId: item.componentId
          // }

          // if (this.modifiers[modifierId] && this.modifiers[modifierId][currentIndex]) {
          //   payload.dsComponentModifierId = this.modifiers[modifierId][currentIndex]
          // }

          const dsComponent = this.$getDataValue({
            name: 'dsComponent/items',
            id: item.componentId
          })

          if (dsComponent.value.id === 'text') {
            this.$method('dsView/createNode', dsViewId)
          } else {
            this.$method('dsView/createElement', {
              dsViewId,
              dsWidgetSectionId,
              dsWidgetInstanceId,
              dsComponent: dsComponent.value
            })
          }

          // add event listener to node
          if (events[currentIndex]) {
            const event = events[currentIndex]

            for (let i = 0; i < event.action.length; i++) {
              this.$setDataValue({
                name: 'dsEvent/listeners',
                source: event.action[i],
                options: {
                  id: dsViewId,
                  suffixId: event.on
                }
              })
            }
          }

          fragment.dsViewId = dsViewId
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
            dsWidgetSectionId,
            dsWidgetInstanceId,
            dsViewParentId,
            dsWidgetPrefixId,
            dsWidgetMode,
            lang,
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
    _getComponents (dsWidgetInstanceId, dsWidgetView = 'default') {
      return this.components[dsWidgetView + dsWidgetInstanceId]
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
    },
    _setComponents (dsWidgetInstanceId, dsWidgetPrefixId, dsWidgetMode, components) {
      let id = dsWidgetMode + dsWidgetInstanceId

      if (dsWidgetPrefixId) {
        id = dsWidgetMode + dsWidgetPrefixId + dsWidgetInstanceId
      }

      this.components[id] = components
    }
  }
}
