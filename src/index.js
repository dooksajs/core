/**
 * @typedef {string} dsWidgetSectionId - Id for a collection of widgets
 */

/**
 * @typedef {string} dsWidgetInstanceId - Instance id for a widget
 */

/**
 * Dooksa widget plugin.
 * @namespace dsWidget
 */
export default {
  name: 'dsWidget',
  version: 1,
  dependencies: [
    {
      name: 'dsView',
      version: 1
    },
    {
      name: 'dsContent',
      version: 1
    }
  ],
  data: {
    uniqueIdentifier: {
      description: 'Unique identifier used to allow instances to be shared but contain different related content',
      default: '',
      schema: {
        type: 'string'
      }
    },
    instances: {
      description: 'Widget instance',
      default: {},
      schema: {
        type: 'collection',
        prefixId () {
          return this.$getDataValue({
            name: 'dsWidget/uniqueIdentifier'
          }).item
        },
        items: {
          type: 'object',
          properties: {
            groupId: {
              type: 'string',
              relation: 'dsWidget/instanceGroups',
              default () {
                return this.$method('dsData/generateId')
              }
            }
          }
        }
      }
    },
    instanceContent: {
      description: 'Content references used by an instance',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsContent/items'
          }
        },
        suffixId: 'default'
      }
    },
    instanceGroups: {
      description: 'Group instances',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsWidget/instances'
          },
          uniqueItems: true
        }
      }
    },
    instanceMode: {
      description: 'Current instance template mode',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    },
    instanceTemplates: {
      description: 'Templates used by instances sorted by modes',
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
    sections: {
      description: 'Collection of widget instances',
      default: {},
      schema: {
        type: 'collection',
        prefixId () {
          return this.$getDataValue({
            name: 'dsWidget/uniqueIdentifier'
          }).item
        },
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsWidget/instances'
          }
        }
      }
    },
    sectionEntry: {
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
    sectionMode: {
      description: 'Current template mode for the section',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    },
    sectionParent: {
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
    sectionView: {
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
  /** @lends dsWidget */
  methods: {
    attachInstance ({
      dsWidgetSectionId,
      dsWidgetInstanceId,
      dsWidgetMode
    }) {
      const dsTemplateId = this.$getDataValue({
        name: 'dsWidget/instanceTemplates',
        id: dsWidgetInstanceId,
        suffixId: dsWidgetMode
      })

      if (dsTemplateId.isEmpty) {
        return
      }

      this.$action('dsTemplate/create', {
        dsTemplateId: dsTemplateId.item,
        dsWidgetSectionId,
        dsWidgetInstanceId,
        dsWidgetMode
      }, {
        onSuccess: (result) => {
          const dsViewId = this.$getDataValue({
            name: 'dsWidget/sectionView',
            id: dsWidgetSectionId
          })

          this.$method('dsLayout/attach', {
            dsLayoutId: result.dsLayoutEntryId,
            dsWidgetSectionId,
            dsWidgetInstanceId,
            dsWidgetMode,
            dsViewId: dsViewId.item
          })
        },
        onError: (e) => console.log(e)
      })
    },
    attachSection ({
      dsWidgetSectionId,
      dsWidgetMode,
      dsWidgetPrefixId,
      dsViewId
    }) {
      const section = this.$getDataValue({
        name: 'dsWidget/sections',
        id: dsWidgetSectionId,
        prefixId: dsWidgetPrefixId
      })

      if (section.isEmpty || !dsViewId) {
        return
      }

      this.$setDataValue({
        name: 'dsWidget/sectionView',
        source: dsViewId,
        options: {
          id: dsWidgetSectionId,
          prefixId: dsWidgetPrefixId
        }
      })

      for (let i = 0; i < section.item.length; i++) {
        const dsWidgetInstanceId = section.item[i]

        this.attachInstance({
          dsWidgetSectionId,
          dsWidgetInstanceId,
          dsWidgetPrefixId,
          dsWidgetMode
        })
      }
    },
    /**
     * Insert widget within a section
     * @param {Object} param
     * @param {dsWidgetSectionId} param.dsWidgetSectionId - widget section id
     * @param {dsWidgetItem} param.dsWidgetItem - widget item
     * @param {number} position - The position to insert within the section
     */
    insertInstance ({
      dsWidgetSectionId,
      dsWidgetInstanceId,
      dsWidgetTemplateId,
      dsWidgetGroupId,
      position
    }) {
      const instance = this.$setDataValue({
        name: 'dsWidget/instances',
        source: {
          groupId: dsWidgetGroupId
        },
        options: {
          id: dsWidgetInstanceId
        }
      })

      this.$setDataValue({
        name: 'dsWidget/instanceGroups',
        source: instance.id,
        options: {
          id: instance.item.groupId,
          source: {
            push: true
          }
        }
      })

      const sectionData = {
        name: 'dsWidget/sections',
        source: instance.id,
        options: {
          id: dsWidgetSectionId,
          source: {
            push: true
          }
        }
      }

      if (Number.isInteger(position)) {
        sectionData.options.source = {
          splice: {
            start: position
          }
        }
      }

      this.$setDataValue(sectionData)

      return instance.id
    },
    /**
     * Remove section
     * @param {Object} param
     * @param {dsWidgetSectionId} - Widget section id
     * @param {dsWidgetPrefixId} - Widget prefix
     */
    removeSection ({ dsWidgetSectionId, dsWidgetPrefixId = '' }) {
      const [items, currentId] = this._getSections(dsWidgetSectionId, dsWidgetPrefixId)
      let view = this._getSectionView(currentId)

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        let layout = item.layout[view]

        if (!item.layout[view]) {
          layout = item.layout.default
          view = 'default'
        }

        this._detachInstance(currentId, item.instanceId, layout.id, view, dsWidgetPrefixId)
      }

      this._detachItem('section', dsWidgetSectionId)
    },
    sectionView (dsWidgetNextSectionId) {

    }
  }
}
