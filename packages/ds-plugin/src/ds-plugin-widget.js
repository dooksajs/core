import { definePlugin } from '@dooksa/ds-scripts'

/**
 * @typedef {string} dsWidgetId - Instance id for a widget
 */

/**
 * Dooksa widget plugin.
 * @namespace dsWidget
 */
export default definePlugin({
  name: 'dsWidget',
  version: 1,
  data: {
    actionGroups: {
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsAction/items'
        }
      }
    },
    uniqueId: {
      description: 'Unique identifier used to allow instances to be shared but contain different related content',
      schema: {
        type: 'string'
      }
    },
    attached: {
      description: 'Which section the widget is attached to',
      schema: {
        type: 'collection',
        suffixId: 'default',
        items: {
          type: 'string',
          relation: 'dsSection/items'
        }
      }
    },
    items: {
      description: 'Widget instance',
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
      schema: {
        type: 'collection',
        items: {
          type: 'string'
        }
      }
    },
    layouts: {
      description: 'layouts related to the instance',
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
    views: {
      description: 'Widget element',
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
    parentViews: {
      description: 'parent widget element',
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
    }
  },
  methods: {
    remove ({ id }) {
      const view = this.$getDataValue('dsWidget/views', { id })

      // remove all nodes from DOM
      if (!view.isEmpty) {
        for (let i = 0; i < view.item.length; i++) {
          const id = view.item[i]

          this.$method('dsView/remove', { id })
        }
      }

      const widget = this.$getDataValue('dsWidget/groups', {
        id,
        options: {
          expand: true
        }
      })

      const widgets = widget.expand || []

      widgets.push({ id })

      for (let i = 0; i < widgets.length; i++) {
        const { id } = widgets[i]

        this.$deleteDataValue('dsWidget/mode', { id })
        this._removeLayout(id)
        this._removeContent(id)
        this._removeEvent(id)
        this._removeSection(id)
      }
    },
    _removeContent (id) {
      const content = this.$getDataValue('dsWidget/content', { id })

      // remove related content
      if (!content.isEmpty) {
        for (let i = 0; i < content.item.length; i++) {
          const id = content.item[i]

          this.$deleteDataValue('dsContent/items', id, { listeners: true })
        }
      }
    },
    _removeEvent (id) {
      const event = this.$getDataValue('dsWidget/events', {
        id,
        options: {
          expand: true
        }
      })

      // remove related content
      if (!event.isEmpty && !event.isExpandEmpty) {
        for (let i = 0; i < event.item.length; i++) {
          const item = event.expand[i]

          this.$deleteDataValue(item.collection, item.id, {
            cascade: true,
            listeners: true
          })
        }
      }
    },
    _removeLayout (id) {
      const layout = this.$getDataValue('dsWidget/layouts', { id })

      // remove unused layout
      if (!layout.isEmpty) {
        this.$deleteDataValue('dsLayout/items', layout.item, {
          cascade: true
        })
      }
    },
    _removeSection (id) {
      const section = this.$getDataValue('dsWidget/sections', { id })

      // remove unused section
      if (section.isEmpty) {
        this.$deleteDataValue('dsSection/items', section.id, {
          cascade: true,
          listeners: true
        })
      }
    }
  }
})
