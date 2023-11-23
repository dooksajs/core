import { definePlugin } from '@dooksa/ds-app'

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
      const { items, events, viewItems, parentViewItems } = this._getItems(dsLayoutId, dsWidgetId, dsWidgetMode)
      const layoutItems = []

      if (parentViewItems.length) {
        for (let i = 0; i < parentViewItems.length; i++) {
          const sourceId = parentViewItems[i]

          this.$method('dsView/insert', {
            sourceId,
            targetId: dsViewId
          })
        }

        return
      }

      for (let i = 0; i < items.length; i++) {
        const element = items[i]
        const event = events[i]
        const item = {}
        let parentViewId = dsViewId
        let sectionId = dsSectionId
        let isChild = true

        layoutItems.push(item)

        if (Number.isInteger(element.parentIndex)) {
          const layoutItem = layoutItems[element.parentIndex]

          parentViewId = layoutItem.dsViewId

          if (layoutItem.sectionId) {
            sectionId = layoutItem.sectionId
          }
        } else {
          isChild = false
        }

        const childViewId = this.$method('dsView/createNode', {
          dsViewId: viewItems[i],
          dsSectionId: sectionId,
          dsWidgetId,
          dsComponentId: element.componentId
        })

        if (!isChild) {
          parentViewItems.push(childViewId)
        }

        // Collect elements
        viewItems.push(childViewId)

        item.dsViewId = childViewId

        if (Number.isInteger(element.contentIndex)) {
          this._contentItem(dsWidgetId, dsWidgetMode, dsSectionUniqueId, dsViewId, childViewId, element.contentIndex)
        }

        if (Number.isInteger(element.sectionIndex)) {
          this._sectionItem(dsWidgetId, dsWidgetMode, dsSectionUniqueId, childViewId, element.sectionIndex)
        }

        if (event) {
          this._eventItem(event, childViewId)
        }

        this.$method('dsView/insert', {
          sourceId: childViewId,
          targetId: parentViewId
        })
      }

      this.$setDataValue('dsWidget/views', viewItems, {
        id: dsWidgetId,
        suffixId: dsWidgetMode
      })

      this.$setDataValue('dsWidget/parentViews', parentViewItems, {
        id: dsWidgetId,
        suffixId: dsWidgetMode
      })
    },
    _getItems (dsLayoutId, dsWidgetId, dsWidgetMode) {
      const layout = this.$getDataValue('dsLayout/items', {
        id: dsLayoutId
      })

      const events = this.$getDataValue('dsWidget/events', {
        id: dsWidgetId,
        suffixId: dsWidgetMode
      }).item || {}

      const parentViewItems = this.$getDataValue('dsWidget/parentViews', {
        id: dsWidgetId,
        suffixId: dsWidgetMode
      })

      const viewItems = this.$getDataValue('dsWidget/views', {
        id: dsWidgetId,
        suffixId: dsWidgetMode
      })

      return {
        items: layout.item,
        events,
        viewItems: viewItems.item || [],
        parentViewItems: parentViewItems.item || []
      }
    },
    _contentItem (dsWidgetId, dsWidgetMode, dsSectionUniqueId, dsViewId, childViewId, contentIndex) {
      const language = this.$getDataValue('dsMetadata/language').item
      const contentId = this.$getDataValue('dsWidget/content', {
        id: dsWidgetId,
        prefixId: dsSectionUniqueId,
        suffixId: dsWidgetMode,
        options: {
          position: contentIndex
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
          value: () => {
            this.$method('dsView/updateValue', { dsViewId: childViewId })
          }
        }
      })
    },
    _eventItem (event, dsView) {
      // match core event names with namespaced core plugins
      const eventName = this.eventNames[event.name] || event.name

      const dsEvent = this.$setDataValue('dsEvent/listeners', event.value, {
        id: dsView,
        suffixId: eventName,
        merge: true
      })

      // Store used events on page used by "save page"
      // ISSUE: not sure if this is needed since schema relation
      this.$setDataValue('dsPage/events', dsEvent.id, {
        id: this.$method('dsRouter/currentPath'),
        update: {
          method: 'push'
        }
      })
    },
    _sectionItem (dsWidgetId, dsWidgetMode, dsSectionUniqueId, dsViewId, sectionIndex) {
      // get next widget section id
      const widgetSectionItem = this.$getDataValue('dsWidget/sections', {
        id: dsWidgetId,
        prefixId: dsSectionUniqueId,
        suffixId: dsWidgetMode,
        options: {
          position: sectionIndex
        }
      })

      // ISSUE: this can't be empty
      if (!widgetSectionItem.isEmpty) {
        this.$method('dsSection/append', {
          id: widgetSectionItem.item,
          dsViewId
        })

        const section = this.$getDataValue('dsSection/items', { id: widgetSectionItem.item })

        // update section elements
        this.$addDataListener('dsSection/items', {
          on: 'update',
          id: section.id,
          handler: {
            id: dsViewId,
            value: () => {
              this.$method('dsSection/update', { id: section.id, dsViewId })
            }
          }
        })
      }
    }
  }
})