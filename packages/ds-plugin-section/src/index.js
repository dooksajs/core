/**
 * @typedef {string} dsSectionId - Id for a collection of widgets
 */

/**
 * Dooksa sections.
 * @namespace dsSection
 */
export default {
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
      default: {},
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
    entry: {
      description: 'The entry section, e.g. a page top entry sections',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsWidget/sections'
          }
        }
      }
    },
    mode: {
      description: 'Current template mode for the section',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    },
    templates: {
      description: 'Templates used by section sorted by modes',
      default: {},
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
      default: {},
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
      default: {},
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
    create ({
      dsSectionId,
      dsViewId = this.$getDataValue('dsView/rootViewId').item,
      path = this.$method('dsRouter/currentPath')
    }) {
      const dsSectionUniqueId = this.$getDataValue('dsSection/uniqueId').item

      const mode = this.$getDataValue('dsSection/mode', {
        id: dsSectionId,
        prefixId: dsSectionUniqueId
      }).item

      const dsSection = this.$getDataValue('dsSection/items', {
        id: dsSectionId,
        prefixId: dsSectionUniqueId,
        suffixId: mode
      })

      this.$setDataValue('dsSection/view', dsViewId, {
        id: dsSectionId,
        prefixId: dsSectionUniqueId,
        suffixId: mode
      })

      this.$setDataValue('dsPage/items', dsSection.noAffixId, {
        id: path,
        update: {
          method: 'push'
        }
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
          dsSectionId,
          dsSectionUniqueId,
          dsWidgetId,
          dsWidgetMode,
          dsViewId
        })
      }

      return dsSection.id
    }
  }
}
