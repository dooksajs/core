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
            widgetSection: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'number'
                }
              }
            },
            section: {
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
      dsSectionId
    }) {
      const template = this.$getDataValue('dsTemplate/items', { id })

      if (template.isEmpty) {
        return
      }

      // set default values here to avoid exec unnecessary functions if there is no template found
      language = language || this.$getDataValue('dsMetadata/language').item
      dsSectionId = dsSectionId || this.$method('dsData/generateId')

      const dsWidgetItems = []
      const dsWidgetGroupId = this.$method('dsData/generateId')

      this.$setDataValue('dsWidget/templates', {
        source: id,
        options: {
          id: dsSectionId,
          suffixId: mode
        }
      })

      this.$setDataValue('dsSection/mode', {
        source: mode,
        options: {
          id: dsSectionId
        }
      })

      for (let i = 0; i < template.item.layoutId.length; i++) {
        const contentItems = template.item.content[i]
        const events = template.item.widgetEvent[i]
        const widget = {
          id: this.$method('dsData/generateId'),
          content: [],
          layout: template.item.layoutId[i]
        }

        dsWidgetItems.push(widget)

        // add events to instance
        if (Object.keys(events).length) {
          this.$setDataValue('dsWidget/events', {
            source: events,
            options: {
              id: widget.id,
              suffixId: mode
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

          // remove language suffix to allow other language overrides
          const contentId = dsContent.noAffixId

          widget.content.push(contentId)
        }

        // set widget content
        this.$setDataValue('dsWidget/content', {
          source: widget.content,
          options: {
            id: widget.id,
            suffixId: mode
          }
        })

        // add widget instance to group
        this.$setDataValue('dsWidget/groups', {
          source: widget.id,
          options: {
            id: dsWidgetGroupId,
            source: {
              push: true
            }
          }
        })

        // set widget instance
        this.$setDataValue('dsWidget/items', {
          source: dsWidgetGroupId,
          options: {
            id: widget.id
          }
        })

        this.$setDataValue('dsWidget/mode', {
          source: mode,
          options: {
            id: widget.id
          }
        })

        this.$setDataValue('dsWidget/layouts', {
          source: widget.layout,
          options: {
            id: widget.id,
            suffixId: mode
          }
        })
      }

      const rootSection = []
      const usedWidgets = []

      // sort sections
      for (let i = 0; i < template.item.widgetSection.length; i++) {
        const sectionIndexes = template.item.widgetSection[i]
        const dsWidgetId = dsWidgetItems[i].id

        // get section within widget
        if (sectionIndexes.length) {
          const dsWidgetSection = []

          for (let i = 0; i < sectionIndexes.length; i++) {
            const index = sectionIndexes[i]
            const templateSection = template.item.section[index]
            const dsSection = []

            for (let i = 0; i < templateSection.length; i++) {
              const index = templateSection[i]
              const dsWidgetId = dsWidgetItems[index].id
              // include instance in current section
              dsSection.push(dsWidgetId)
              // mark instance as used
              usedWidgets.push(dsWidgetId)
            }

            const section = this.$setDataValue('dsSection/items', {
              source: dsSection,
              options: {
                suffixId: mode
              }
            })

            dsWidgetSection.push(section.noAffixId)

            this.$setDataValue('dsSection/mode', {
              source: mode,
              options: {
                id: section.noAffixId
              }
            })
          }

          this.$setDataValue('dsWidget/sections', {
            source: dsWidgetSection,
            options: {
              id: dsWidgetId,
              suffixId: mode
            }
          })
        }

        if (!usedWidgets.includes(dsWidgetId)) {
          rootSection.push(dsWidgetId)
        }
      }

      this.$setDataValue('dsSection/items', {
        source: rootSection,
        options: {
          id: dsSectionId,
          mode
        }
      })

      return dsSectionId
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

          if (node.nodeName === '#text') {
            value = getNodeValue(getters[0].type, node, getters[0].value)
          } else {
            // get node value
            for (let i = 0; i < getters.length; i++) {
              const getter = getters[i]
              const result = getNodeValue(getter.type, node, getter.value)

              value[result.key] = result.value
            }
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
            if (Object.hasOwn(events, key)) {
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
          widgetSection: template.widgetSection,
          section: template.section
        },
        options: {
          id: template.id
        }
      })

      return { id: result.id, mode: template.mode }
    }
  }
}
