import { createPlugin } from '@dooksa/create-plugin'
import { dataGenerateId, viewRemove } from './index.js'

const widget = createPlugin('widget', ({ defineData, defineActions }, { $getDataValue, $deleteDataValue }) => {
  defineData({
    actions: {
      schema: {
        type: 'collection',
        suffixId: 'default',
        items: {
          type: 'object'
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
          relation: 'section/items'
        }
      }
    },
    items: {
      description: 'Widget instance',
      schema: {
        type: 'collection',
        prefixId () {
          return $getDataValue('widget/uniqueId').item
        },
        items: {
          type: 'string',
          relation: 'widget/groups',
          default () {
            return dataGenerateId()
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
            relation: 'content/items'
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
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string'
                  },
                  value: {
                    type: 'array',
                    items: {
                      type: 'string',
                      relation: 'action/items'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    eventListeners: {
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              types: {
                type: 'array',
                items: {
                  type: 'string'
                }
              },
              viewId: {
                type: 'string',
                relation: 'view/items'
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
            relation: 'widget/items'
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
          relation: 'layout/items'
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
            relation: 'section/items'
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
            relation: 'view/items'
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
            relation: 'view/items'
          }
        },
        suffixId: 'default'
      }
    },
    templates: {
      schema: {
        type: 'collection',
        suffixId: 'default',
        items: {
          type: 'string',
          relation: 'template/items'
        }
      }
    }
  })

  defineActions({
    attachedToIndex ({ id }) {
      const sectionId = $getDataValue('widget/attached', { id, expand: true })

      if (sectionId.isEmpty) {
        return -1
      }

      const section = $getDataValue('section/items', { id: sectionId.item })

      return section.item.indexOf(id)
    },
    remove ({ id }) {
      const view = $getDataValue('widget/views', { id })

      // remove all nodes from DOM
      if (!view.isEmpty) {
        // remove view relations
        $deleteDataValue('widget/views', { id })
        $deleteDataValue('widget/parentViews', { id })

        for (let i = 0; i < view.item.length; i++) {
          const viewId = view.item[i]

          viewRemove({ id: viewId })
        }
      }

      const groupId = $getDataValue('widget/items', { id }).item
      const widgets = $getDataValue('widget/groups', { id: groupId })

      if (widgets.isEmpty) {
        return
      }

      for (let i = 0; i < widgets.item.length; i++) {
        const id = widgets.item[i]

        $deleteDataValue('widget/mode', id)
        removeLayout(id)
        removeContent(id)
        removeEvent(id)
        removeSection(id)
      }
    }
  })

  function removeContent (id) {
    const content = $getDataValue('widget/content', { id })

    // remove related content
    if (!content.isEmpty) {
      for (let i = 0; i < content.item.length; i++) {
        const id = content.item[i]

        $deleteDataValue('content/items', id, { listeners: true })
      }
    }
  }

  function removeEvent (id) {
    const event = $getDataValue('widget/events', {
      id,
      options: {
        expand: true
      }
    })

    // remove related content
    if (!event.isEmpty && !event.isExpandEmpty) {
      for (let i = 0; i < event.item.length; i++) {
        const item = event.expand[i]

        $deleteDataValue(item.collection, item.id, {
          cascade: true,
          listeners: true
        })
      }
    }
  }

  function removeLayout (id) {
    const layout = $getDataValue('widget/layouts', { id })

    // remove unused layout
    if (!layout.isEmpty) {
      $deleteDataValue('layout/items', layout.item, {
        cascade: true
      })
    }
  }

  function removeSection (id) {
    const section = $getDataValue('widget/sections', { id })

    // remove unused section
    if (section.isEmpty) {
      $deleteDataValue('section/items', section.id, {
        cascade: true,
        listeners: true
      })
    }
  }
})

const widgetRemove = widget.actions.remove
const widgetAttachedToIndex = widget.actions.attachedToIndex

export {
  widgetAttachedToIndex,
  widgetRemove
}

export default widget
