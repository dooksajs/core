import { definePlugin } from '@dooksa/ds-app'

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
      dsViewId = this.$getDataValue('dsView/rootViewId').item,
      path = this.$method('dsRouter/currentPath'),
      appendToPage = false
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

      if (appendToPage) {
        this.$setDataValue('dsPage/items', dsSection.noAffixId, {
          id: path,
          update: {
            method: 'push'
          }
        })
      }

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

      let j = 0

      for (let i = 0; i < section.item.length; i++) {
        const dsWidgetId = section.item[i]
        const prevWidgetId = section.previous._item[j]

        // do not render an existing widget in the same position
        if (prevWidgetId && prevWidgetId === dsWidgetId) {
          j++
          continue
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
    }
  }
})
