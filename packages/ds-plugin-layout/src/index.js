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
    }
  },
  /** @lends dsLayout */
  methods: {
    create ({
      dsLayoutId,
      dsWidgetSectionId,
      dsWidgetInstanceId,
      dsWidgetPrefixId,
      dsWidgetMode,
      dsViewId
    }) {
      const layout = this.$getDataValue('dsLayout/items', {
        id: dsLayoutId
      })

      const layoutItems = []

      for (let i = 0; i < layout.item.length; i++) {
        const { componentId, contentIndex, sectionIndex, parentIndex } = layout.item[i]
        const item = {}
        let parentViewId = dsViewId
        let sectionId = dsWidgetSectionId

        layoutItems.push(item)

        if (Number.isInteger(parentIndex)) {
          const layoutItem = layoutItems[parentIndex]

          parentViewId = layoutItem.dsViewId

          if (layoutItem.sectionId) {
            sectionId = layoutItem.sectionId
          }
        }

        const childViewId = this.$method('dsView/createNode', {
          dsWidgetSectionId: sectionId,
          dsWidgetInstanceId,
          dsComponentId: componentId
        })

        this.$method('dsView/append', {
          dsViewId: childViewId,
          dsViewParentId: parentViewId
        })

        item.dsViewId = childViewId

        if (Number.isInteger(contentIndex)) {
          const dsContentId = this.$getDataValue('dsWidget/instanceContent', {
            id: dsWidgetInstanceId,
            prefixId: dsWidgetPrefixId,
            suffixId: dsWidgetMode,
            options: {
              position: contentIndex
            }
          }).item

          // Associate dsContent with dsView item
          this.$setDataValue('dsView/content', {
            source: dsContentId,
            options: {
              id: childViewId
            }
          })

          this.$method('dsView/updateValue', { dsViewId: childViewId })

          // Update view item if content value changes
          this.$addDataListener('dsContent/items', {
            on: 'update',
            id: dsContentId,
            refId: dsViewId,
            listener: (value) => {
              this.$method('dsView/updateValue', { dsViewId: childViewId })
            }
          })
        }

        if (Number.isInteger(sectionIndex)) {
          // get next widget section id
          sectionId = this.$getDataValue('dsWidget/sections', {
            id: dsWidgetSectionId,
            prefixId: dsWidgetPrefixId,
            suffixId: dsWidgetMode,
            options: {
              position: sectionIndex
            }
          }).item

          this.$method('dsWidget/create', {
            dsWidgetSectionId: sectionId,
            dsViewId: childViewId
          })
        }
      }
    }
  }
}
