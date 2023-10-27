/**
 * @typedef {string} dsWidgetId - Instance id for a widget
 */

/**
 * Dooksa widget plugin.
 * @namespace dsWidget
 */
export default {
  name: 'dsWidget',
  version: 1,
  data: {
    uniqueId: {
      description: 'Unique identifier used to allow instances to be shared but contain different related content',
      default: '',
      schema: {
        type: 'string'
      }
    },
    items: {
      description: 'Widget instance',
      default: {},
      schema: {
        type: 'collection',
        prefixId () {
          return this.$getDataValue('dsWidget/uniqueId').item
        },
        items: {
          type: 'string',
          relation: 'dsWidget/groups',
          default () {
            return this.$method('dsData/generateId')
          }
        }
      }
    },
    content: {
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
    events: {
      default: {},
      schema: {
        type: 'collection',
        suffixId: 'default',
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
                    type: 'string',
                    relation: 'dsAction/items'
                  }
                }
              }
            }
          }
        }
      }
    },
    groups: {
      description: 'Group instances',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsWidget/items'
          },
          uniqueItems: true
        }
      }
    },
    mode: {
      description: 'Current instance template mode',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    },
    layouts: {
      description: 'layouts related to the instance',
      default: {},
      schema: {
        type: 'collection',
        suffixId: 'default',
        items: {
          type: 'string',
          relation: 'dsLayout/items'
        }
      }
    },
    sections: {
      description: 'References to sections',
      default: {},
      schema: {
        type: 'collection',
        suffixId: 'default',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsSection/items'
          }
        }
      }
    },
    view: {
      description: 'View references used by an instance',
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string',
            relation: 'dsView/items'
          }
        },
        suffixId: 'default'
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
    }
  }
}
