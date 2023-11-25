import { definePlugin } from '@dooksa/utils'

/**
 * @typedef {string} dsSectionId - Id for a collection of widgets
 */

/**
 * Dooksa sections.
 * @namespace dsSection
 */
export default definePlugin({
  name: 'dsSection',
  version: 1,
  data: {
    uniqueId: {
      description: 'Unique identifier used to allow sections to be shared but contain different related content',
      default: '',
      schema: {
        type: 'string'
      }
    },
    items: {
      description: 'Collection of widget instances',
      schema: {
        type: 'collection',
        prefixId () {
          return this.$getDataValue('dsWidget/uniqueId').item
        },
        suffixId: 'default',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsWidget/items'
          }
        }
      }
    },
    mode: {
      description: 'Current template mode for the section',
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    },
    templates: {
      description: 'Templates used by section sorted by modes',
      schema: {
        type: 'collection',
        suffixId: 'default',
        items: {
          type: 'string',
          relation: 'dsTemplate/items'
        }
      }
    },
    viewParent: {
      description: 'The parent section to a section',
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsWidget/sections'
        }
      }
    },
    view: {
      description: 'The node which the section is attached',
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsView/items'
        }
      }
    }
  },
  /** @lends dsSection */
  methods: {
    append ({
      id,
      dsViewId = this.$getDataValue('dsView/rootViewId').item
    }) {
      const dsSectionUniqueId = this.$getDataValue('dsSection/uniqueId').item

      const mode = this.$getDataValue('dsSection/mode', {
        id,
        prefixId: dsSectionUniqueId
      }).item

      const dsSection = this.$getDataValue('dsSection/items', {
        id,
        prefixId: dsSectionUniqueId,
        suffixId: mode
      })

      if (dsSection.isEmpty) {
        return
      }

      this.$setDataValue('dsSection/view', dsViewId, {
        id,
        prefixId: dsSectionUniqueId,
        suffixId: mode
      })

      for (let i = 0; i < dsSection.item.length; i++) {
        const dsWidgetId = dsSection.item[i]
        const widgetMode = this.$getDataValue('dsWidget/mode', {
          id: dsWidgetId,
          prefixId: dsSectionUniqueId
        }).item
        const dsWidgetMode = widgetMode !== 'default' ? widgetMode : mode
        const dsLayoutId = this.$getDataValue('dsWidget/layouts', {
          id: dsWidgetId,
          suffixId: widgetMode,
          prefixId: dsSectionUniqueId
        }).item

        this.$method('dsLayout/create', {
          dsLayoutId,
          dsSectionId: id,
          dsSectionUniqueId,
          dsWidgetId,
          dsWidgetMode,
          dsViewId
        })
      }

      return dsSection
    },
    update ({ id, dsViewId }) {
      if (!dsViewId) {
        this.$log('error', { message: 'dsViewId is undefined', code: 54 })
      }

      const section = this.$getDataValue('dsSection/items', { id })
      const dsSectionUniqueId = this.$getDataValue('dsSection/uniqueId').item
      const mode = this.$getDataValue('dsSection/mode', {
        id,
        prefixId: dsSectionUniqueId
      }).item

      const previousWidgets = []
      const nextItems = section.item
      const prevItems = section.previous ? section.previous._item : []
      let updateLength = nextItems.length

      if (prevItems.length > nextItems.length) {
        updateLength = prevItems.length
      }

      for (let i = 0; i < updateLength; i++) {
        const dsWidgetId = nextItems[i]
        const prevWidgetId = prevItems[i]

        // Remove previous items
        if (!dsWidgetId) {
          this.$method('dsWidget/remove', { id: prevWidgetId })

          continue
        }

        // do not render an existing widget in the same position
        if (prevWidgetId && prevWidgetId === dsWidgetId) {
          continue
        }

        if (prevWidgetId) {
          const previousView = this.$getDataValue('dsWidget/parentViews', {
            id: prevWidgetId,
            options: {
              expand: true
            }
          })

          // detach previous nodes
          if (!previousView.expandIsEmpty) {
            previousWidgets.push(prevWidgetId)

            for (let i = 0; i < previousView.expand.length; i++) {
              previousView.expand[i].item.remove()
            }
          }
        }

        const widgetMode = this.$getDataValue('dsWidget/mode', {
          id: dsWidgetId,
          prefixId: dsSectionUniqueId
        }).item
        const dsWidgetMode = widgetMode !== 'default' ? widgetMode : mode
        const dsLayoutId = this.$getDataValue('dsWidget/layouts', {
          id: dsWidgetId,
          suffixId: widgetMode,
          prefixId: dsSectionUniqueId
        }).item

        this.$method('dsLayout/create', {
          dsLayoutId,
          dsSectionId: id,
          dsSectionUniqueId,
          dsWidgetId,
          dsWidgetMode,
          dsViewId
        })
      }

      // remove unused widgets from state
      for (let i = 0; i < previousWidgets.length; i++) {
        const id = previousWidgets[i]
        const view = this.$getDataValue('dsWidget/parentViews', {
          id,
          options: {
            expand: true
          }
        })

        if (!view.expandIsEmpty && !view.expand[0].item.parentElement) {
          this.$method('dsWidget/remove', { id })
        }
      }
    }
  }
})
