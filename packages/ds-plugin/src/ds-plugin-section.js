import { definePlugin } from '@dooksa/ds-scripts'

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
    query: {
      description: 'Active queries applied to section',
      schema: {
        type: 'collection',
        prefixId () {
          return this.$getDataValue('dsWidget/uniqueId').item
        },
        suffixId: 'default',
        items: {
          type: 'string',
          relation: 'dsQuery/items'
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

      // event context
      const dsWidgets = []

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

        dsWidgets.push(dsWidgetId)

        this.$method('dsLayout/create', {
          dsLayoutId,
          dsSectionId: id,
          dsSectionUniqueId,
          dsWidgetId,
          dsWidgetMode,
          dsViewId
        })
      }

      this.$emit('dsSection/attach', {
        id: dsViewId,
        context: {
          dsSectionId: id,
          dsViewId,
          dsWidgets
        }
      })

      return dsSection
    },
    update ({ id, dsViewId }) {
      if (!dsViewId) {
        const view = this.$getDataValue('dsSection/view', {
          id
        })

        if (view.isEmpty) {
          return this.$log('error', { message: 'dsViewId is undefined', code: 54 })
        }

        dsViewId = view.item
      }

      const query = this.$getDataValue('dsSection/query', { id })
      const uniqueId = this.$getDataValue('dsSection/uniqueId').item
      const mode = this.$getDataValue('dsSection/mode', {
        id,
        prefixId: uniqueId
      }).item

      if (!query.isEmpty) {
        return this._updateByQuery(query.item, dsViewId, id, uniqueId, mode)
      }

      const section = this.$getDataValue('dsSection/items', { id })
      const dsWidgets = []
      const previousWidgets = {}
      const nextItems = section.item
      const prevItems = section.previous ? section.previous._item : []

      for (let i = 0; i < prevItems.length; i++) {
        const prevWidgetId = prevItems[i]
        const nextIndex = nextItems.indexOf(prevWidgetId)

        /**
         * @todo (Render benchmarking needed) Avoid reattaching unchanged
         * nodes by preparing a before/after list
         */
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

          // event context data
          dsWidgets.push(prevWidgetId)

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
            prefixId: uniqueId
          }).item
          const dsWidgetMode = widgetMode !== 'default' ? widgetMode : mode
          const dsLayoutId = this.$getDataValue('dsWidget/layouts', {
            id: dsWidgetId,
            suffixId: widgetMode,
            prefixId: uniqueId
          }).item

          this.$method('dsLayout/create', {
            dsLayoutId,
            dsSectionId: id,
            dsSectionUniqueId: uniqueId,
            dsWidgetId,
            dsWidgetMode,
            dsViewId
          })

          // event context data
          dsWidgets.push(dsWidgetId)
        }
      }

      this.$emit('dsSection/update', {
        id: dsViewId,
        context: {
          dsSectionId: id,
          dsViewId,
          dsWidgets
        }
      })
    },
    _updateByQuery (queryId, dsViewId, id, uniqueId, mode) {
      const result = this.$method('dsQuery/fetch', { id: queryId })

      // Exit, nothing to do.
      if (!result) {
        return
      }

      const viewData = this.$getDataValue('dsView/items', { id: dsViewId })
      const view = viewData.item
      // remove old nodes

      for (let i = 0; i < view.children.length; i++) {
        view.children[i].remove()
        --i
      }

      for (let i = 0; i < result.length; i++) {
        const item = result[i]
        const dsWidgetId = item.widgetId
        const widgetView = this.$getDataValue('dsWidget/parentViews', {
          id: dsWidgetId,
          options: {
            expand: true
          }
        })

        if (!widgetView.isEmpty) {
          // reattach existing nodes
          for (let i = 0; i < widgetView.expand.length; i++) {
            const node = widgetView.expand[i].item

            view.appendChild(node)
          }
        } else {
          const widgetMode = this.$getDataValue('dsWidget/mode', {
            id: dsWidgetId,
            prefixId: uniqueId
          }).item
          const dsWidgetMode = widgetMode !== 'default' ? widgetMode : mode
          const dsLayoutId = this.$getDataValue('dsWidget/layouts', {
            id: dsWidgetId,
            suffixId: widgetMode,
            prefixId: uniqueId
          }).item

          // create new widget layout and attach to section
          this.$method('dsLayout/create', {
            dsLayoutId,
            dsSectionId: id,
            dsSectionUniqueId: uniqueId,
            dsWidgetId,
            dsWidgetMode,
            dsViewId
          })
        }
      }
    }
  }
})
