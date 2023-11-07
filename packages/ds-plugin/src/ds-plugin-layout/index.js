import definePlugin from '../definePlugin.js'

/**
 * Dooksa layout tools.
 * @namespace dsLayout
 */
export default definePlugin({
  name: 'dsLayout',
  version: 1,
  data: {
    items: {
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
    eventNames: {
      private: true,
      default: () => ({
        mount: 'dsView/mount',
        unmount: 'dsView/unmount'
      })
    }
  },
  /** @lends dsLayout */
  methods: {
    create ({
      dsLayoutId,
      dsSectionId,
      dsSectionUniqueId,
      dsWidgetId,
      dsWidgetMode,
      dsViewId
    }) {
      const layout = this.$getDataValue('dsLayout/items', {
        id: dsLayoutId
      })

      const events = this.$getDataValue('dsWidget/events', {
        id: dsWidgetId,
        suffixId: dsWidgetMode
      }).item || {}

      const layoutItems = []
      let viewItems = this.$getDataValue('dsWidget/view', {
        id: dsWidgetId,
        suffixId: dsWidgetMode
      })

      if (viewItems.isEmpty) {
        viewItems = []
      } else {
        viewItems = viewItems.item
      }

      for (let i = 0; i < layout.item.length; i++) {
        const element = layout.item[i]
        const event = events[i]
        const item = {}
        let parentViewId = dsViewId
        let sectionId = dsSectionId

        layoutItems.push(item)

        if (Number.isInteger(element.parentIndex)) {
          const layoutItem = layoutItems[element.parentIndex]

          parentViewId = layoutItem.dsViewId

          if (layoutItem.sectionId) {
            sectionId = layoutItem.sectionId
          }
        }

        const childViewId = this.$method('dsView/createNode', {
          dsViewId: viewItems[i],
          dsSectionId: sectionId,
          dsWidgetId,
          dsComponentId: element.componentId
        })

        this.$method('dsView/append', {
          dsViewId: childViewId,
          dsViewParentId: parentViewId
        })

        // collect new view ids for instance
        if (viewItems.isEmpty) {
          viewItems.push(childViewId)
        }

        item.dsViewId = childViewId

        if (Number.isInteger(element.contentIndex)) {
          const language = this.$getDataValue('dsMetadata/language').item
          const contentId = this.$getDataValue('dsWidget/content', {
            id: dsWidgetId,
            prefixId: dsSectionUniqueId,
            suffixId: dsWidgetMode,
            options: {
              position: element.contentIndex
            }
          }).item
          const dsContentId = this.$getDataValue('dsContent/items', {
            id: contentId,
            suffixId: language
          }).id

          // Associate dsContent with dsView item
          this.$setDataValue('dsView/content', dsContentId, {
            id: childViewId
          })

          this.$method('dsView/updateValue', { dsViewId: childViewId })

          // Update view item if content value changes
          this.$addDataListener('dsContent/items', {
            on: 'update',
            id: dsContentId,
            handler: {
              id: dsViewId,
              value: (value) => {
                this.$method('dsView/updateValue', { dsViewId: childViewId })
              }
            }
          })
        }

        if (Number.isInteger(element.sectionIndex)) {
          // get next widget section id
          sectionId = this.$getDataValue('dsWidget/sections', {
            id: dsWidgetId,
            prefixId: dsSectionUniqueId,
            suffixId: dsWidgetMode,
            options: {
              position: element.sectionIndex
            }
          }).item

          this.$method('dsSection/create', {
            id: sectionId,
            dsViewId: childViewId
          })
        }

        if (event) {
          // match core event names with namespaced core plugins
          const eventName = this.eventNames[event.name] || event.name

          const dsEvent = this.$setDataValue('dsEvent/listeners', event.value, {
            id: childViewId,
            suffixId: eventName
          })

          this.$setDataValue('dsPage/events', dsEvent.id, {
            id: this.$method('dsRouter/currentPath'),
            update: {
              method: 'push'
            }
          })
        }
      }

      // set view items used with widget instance
      if (viewItems.isEmpty) {
        this.$setDataValue('dsWidget/view', viewItems, {
          id: dsWidgetId
        })
      }
    }
  }
})
