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
          return this.$getDataValue('dsWidget/uniqueIdentifier').item
        },
        items: {
          type: 'string',
          relation: 'dsWidget/instanceGroups',
          default () {
            return this.$method('dsData/generateId')
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
    instanceEvents: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          patternProperties: {
            '[0-9]': {
              type: 'object',
              properties: {
                name: {
                  type: 'string'
                },
                value: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
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
    instanceLayouts: {
      description: 'layouts related to the instance',
      default: {},
      schema: {
        type: 'collection',
        suffixId: 'default',
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
    sections: {
      description: 'Collection of widget instances',
      default: {},
      schema: {
        type: 'collection',
        prefixId () {
          return this.$getDataValue('dsWidget/uniqueIdentifier').item
        },
        suffixId: 'default',
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
    create ({
      dsWidgetSectionId,
      dsViewId = this.$getDataValue('dsView/rootViewId').item
    }) {
      const dsWidgetPrefixId = this.$getDataValue('dsWidget/uniqueIdentifier').item
      const sectionMode = this.$getDataValue('dsWidget/sectionMode', {
        id: dsWidgetSectionId,
        prefixId: dsWidgetPrefixId
      }).item

      const dsWidgetSection = this.$getDataValue('dsWidget/sections', {
        id: dsWidgetSectionId,
        prefixId: dsWidgetPrefixId,
        suffixId: sectionMode
      })

      for (let i = 0; i < dsWidgetSection.item.length; i++) {
        const dsWidgetInstanceId = dsWidgetSection.item[i]
        const instanceMode = this.$getDataValue('dsWidget/instanceMode', {
          id: dsWidgetInstanceId,
          prefixId: dsWidgetPrefixId
        }).item
        const dsWidgetMode = instanceMode !== 'default' ? instanceMode : sectionMode

        const dsLayoutId = this.$getDataValue('dsWidget/instanceLayouts', {
          id: dsWidgetInstanceId,
          suffixId: instanceMode,
          prefixId: dsWidgetPrefixId
        }).item

        this.$method('dsLayout/create', {
          dsLayoutId,
          dsWidgetSectionId,
          dsWidgetInstanceId,
          dsWidgetPrefixId,
          dsWidgetMode,
          dsViewId
        })
      }
    }
  }
}
