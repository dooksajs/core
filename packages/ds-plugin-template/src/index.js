import { parseHTML, getNodeValue } from '@dooksa/parse-template'

/**
 * @namespace dsTemplate
 */
export default {
  name: 'dsTemplate',
  version: 1,
  dependencies: [
    {
      name: 'dsLayout',
      version: 1
    },
    {
      name: 'dsWidget',
      version: 1
    }
  ],
  data: {
    items: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            content: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string'
                    }
                  }
                }
              }
            },
            layout: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    componentId: {
                      type: 'string'
                    },
                    contentIndex: {
                      type: 'number'
                    },
                    parentIndex: {
                      type: 'number'
                    }
                  }
                }
              }
            },
            layoutId: {
              type: 'array',
              items: {
                type: 'string'
              }
            },
            widgetEvent: {
              type: 'array',
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
            },
            widgetInstanceSection: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'number'
                }
              }
            },
            widgetSection: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'number'
                }
              }
            }
          }
        }
      }
    }
  },
  /** @lends dsTemplate */
  methods: {
    create ({
      id,
      events = {},
      mode = 'default',
      language,
      dsWidgetSectionId
    }) {
      const template = this.$getDataValue('dsTemplate/items', { id })

      if (template.isEmpty) {
        return
      }

      // set default values here to avoid exec unnecessary functions if there is no template found
      language = language || this.$getDataValue('dsMetadata/language').item
      dsWidgetSectionId = dsWidgetSectionId || this.$method('dsData/generateId')

      const dsWidgetItems = []
      const dsWidgetGroupId = this.$method('dsData/generateId')

      this.$setDataValue('dsWidget/templates', {
        source: id,
        options: {
          id: dsWidgetSectionId,
          suffixId: mode
        }
      })

      this.$setDataValue('dsWidget/sectionMode', {
        source: mode,
        options: {
          id: dsWidgetSectionId
        }
      })

      for (let i = 0; i < template.item.layoutId.length; i++) {
        const contentItems = template.item.content[i]
        const events = template.item.widgetEvent[i]
        const widget = {
          instanceId: this.$method('dsData/generateId'),
          content: [],
          layout: template.item.layoutId[i]
        }

        dsWidgetItems.push(widget)

        // add events to instance
        if (Object.keys(events).length) {
          this.$setDataValue('dsWidget/instanceEvents', {
            source: events,
            options: {
              id: widget.instanceId
            }
          })
        }

        for (let j = 0; j < contentItems.length; j++) {
          const content = contentItems[j]
          const dsContent = this.$setDataValue('dsContent/items', {
            source: content.item,
            options: {
              suffixId: language
            }
          })

          this.$setDataValue('dsContent/type', {
            source: {
              name: content.type
            },
            options: {
              id: dsContent.id
            }
          })

          widget.content.push(dsContent.id)
        }

        // set widget content
        this.$setDataValue('dsWidget/instanceContent', {
          source: widget.content,
          options: {
            id: widget.instanceId,
            suffixId: mode
          }
        })

        // add widget instance to group
        this.$setDataValue('dsWidget/instanceGroups', {
          source: widget.instanceId,
          options: {
            id: dsWidgetGroupId,
            source: {
              push: true
            }
          }
        })

        // set widget instance
        this.$setDataValue('dsWidget/instances', {
          source: dsWidgetGroupId,
          options: {
            id: widget.instanceId
          }
        })

        this.$setDataValue('dsWidget/instanceMode', {
          source: mode,
          options: {
            id: widget.instanceId
          }
        })

        this.$setDataValue('dsWidget/instanceLayouts', {
          source: widget.layout,
          options: {
            id: widget.instanceId,
            suffixId: mode
          }
        })
      }

      const rootSectionInstances = []
      const usedInstances = []

      // sort sections
      for (let i = 0; i < template.item.widgetInstanceSection.length; i++) {
        const sectionIndexes = template.item.widgetInstanceSection[i]
        const instanceId = dsWidgetItems[i].instanceId

        if (sectionIndexes.length) {
          const instanceSection = []

          for (let i = 0; i < sectionIndexes.length; i++) {
            const index = sectionIndexes[i]
            const widgetSection = template.item.widgetSection[index]
            const dsWidgetSections = []

            for (let i = 0; i < widgetSection.length; i++) {
              const index = widgetSection[i]
              const instanceId = dsWidgetItems[index].instanceId
              // include instance in current section
              dsWidgetSections.push(instanceId)
              // mark instance as used
              usedInstances.push(instanceId)
            }

            const section = this.$setDataValue('dsWidget/sections', {
              source: dsWidgetSections
            })

            instanceSection.push(section.id)
          }

          this.$setDataValue('dsWidget/instanceSections', {
            source: instanceSection,
            options: {
              id: instanceId,
              suffixId: mode
            }
          })

          this.$setDataValue('dsWidget/sectionMode', {
            source: mode,
            options: {
              id: instanceId
            }
          })
        }

        if (!usedInstances.includes(instanceId)) {
          rootSectionInstances.push(instanceId)
        }
      }

      this.$setDataValue('dsWidget/sections', {
        source: rootSectionInstances,
        options: {
          id: dsWidgetSectionId,
          mode
        }
      })

      return dsWidgetSectionId
    },
    parseHTML ({ html, actions }) {
      const template = parseHTML(html, this.$componentGetters, this.$componentIgnoreAttr)

      for (let i = 0; i < template.content.length; i++) {
        const items = template.content[i]

        for (let j = 0; j < items.length; j++) {
          const node = items[j]
          const nodeName = node.nodeName.toLowerCase()
          const getters = this.$componentGetters[nodeName]
          let value = {}

          // get node value
          for (let i = 0; i < getters.length; i++) {
            const getter = getters[i]

            value = Object.assign(value, getNodeValue(getter.type, node, getter.value))
          }

          items[j] = {
            item: value,
            type: this.$component(nodeName).type
          }
        }
      }

      // add layouts
      for (let i = 0; i < template.layout.length; i++) {
        const layout = template.layout[i]
        const layoutId = template.layoutId[i]

        this.$setDataValue('dsLayout/items', {
          source: layout,
          options: {
            id: layoutId
          }
        })
      }

      // match action reference to events
      if (actions) {
        for (let i = 0; i < template.widgetEvent.length; i++) {
          const events = template.widgetEvent[i]

          for (const key in events) {
            if (Object.hasOwnProperty.call(events, key)) {
              const event = events[key]

              for (let i = 0; i < event.value.length; i++) {
                const eventId = event.value[i]

                if (actions[eventId]) {
                  event.value[i] = actions[eventId]
                }
              }
            }
          }
        }
      }

      this.$setDataValue('dsComponent/items', {
        source: template.component,
        options: {
          source: {
            merge: true
          }
        }
      })

      const result = this.$setDataValue('dsTemplate/items', {
        source: {
          content: template.content,
          layout: template.layout,
          layoutId: template.layoutId,
          widgetEvent: template.widgetEvent,
          widgetInstanceSection: template.widgetInstanceSection,
          widgetSection: template.widgetSection
        },
        options: {
          id: template.id
        }
      })

      return { id: result.id, mode: template.mode }
    }
  }
}
