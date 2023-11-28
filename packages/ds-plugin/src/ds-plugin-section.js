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

      const previousWidgets = {}
      const nextItems = section.item
      const prevItems = section.previous ? section.previous._item : []

      for (let i = 0; i < prevItems.length; i++) {
        const prevWidgetId = prevItems[i]
        const nextIndex = nextItems.indexOf(prevWidgetId)

        // detach previous nodes
        if (nextIndex === -1) {
          this.$method('dsWidget/remove', { id: prevWidgetId })
        } else {
          const previousView = this.$getDataValue('dsWidget/parentViews', {
            id: prevWidgetId,
            options: {
              expand: true
            }
          })

          if (!previousView.expandIsEmpty) {
            previousWidgets[nextIndex] = []

            for (let i = 0; i < previousView.expand.length; i++) {
              const node = previousView.expand[i].item

              node.remove()

              previousWidgets[nextIndex].push(node)
            }
          }
        }
      }

      const sectionNode = this.$getDataValue('dsView/items', {
        id: dsViewId
      })

      for (let i = 0; i < nextItems.length; i++) {
        const previousWidget = previousWidgets[i]

        // reattach existing node
        if (previousWidget) {
          for (let i = 0; i < previousWidget.length; i++) {
            const node = previousWidget[i]

            sectionNode.item.appendChild(node)
          }
        } else {
          const dsWidgetId = nextItems[i]
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
      }
    }
  }
})
