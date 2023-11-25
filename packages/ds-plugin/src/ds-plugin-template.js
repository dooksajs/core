import { definePlugin } from '@dooksa/utils'
import objectHash from '@dooksa/object-hash'

export default definePlugin({
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
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string'
                  },
                  blocks: {
                    type: 'array',
                    items: {
                      type: 'string',
                      relation: 'dsAction/blocks'
                    }
                  },
                  items: {
                    type: 'string',
                    relation: 'dsAction/items'
                  },
                  sequences: {
                    type: 'array',
                    items: {
                      type: 'string',
                      relation: 'dsAction/sequences'
                    }
                  }
                }
              }
            },
            content: {
              type: 'array',
              items: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    item: {
                      type: 'object'
                    },
                    type: {
                      type: 'string'
                    }
                  }
                }
              }
            },
            contentRefs: {
              type: 'object',
              patternProperties: {
                '^[0-9]+$': {
                  type: 'object',
                  patternProperties: {
                    '^[0-9]+$': {
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
                      type: 'string',
                      relation: 'dsComponent/items'
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
                type: 'string',
                relation: 'dsLayout/items'
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
            },
            sectionRefs: {
              type: 'object',
              patternProperties: {
                '^[0-9]+$': {
                  type: 'string'
                }
              }
            }
          }
        }
      }
    }
  },
  methods: {
    create ({
      id,
      mode = 'default',
      language,
      dsSectionId,
      options = {}
    }, _callback) {
      const template = this.$getDataValue('dsTemplate/items', { id })

      // fetch template
      if (template.isEmpty) {
        return new Promise((resolve, reject) => {
          fetch('/_/template?expand=true&id=' + id)
            .then(response => {
              if (response.ok) {
                return response.json()
              }

              resolve(false)
            })
            .then(data => {
              const dataItem = data[0]
              const templateData = this.$setDataValue(dataItem.collection, dataItem.item, { id: dataItem.id })

              if (!templateData.isValid) {
                reject(templateData.error.details)
              }

              if (dataItem.expand) {
                for (let i = 0; i < dataItem.expand.length; i++) {
                  const expand = dataItem.expand[i]
                  const expandData = this.$setDataValue(expand.collection, expand.item, { id: expand.id })

                  if (!expandData.isValid) {
                    reject(templateData.error.details)
                  }
                }
              }

              // set default values here to avoid exec unnecessary functions if there is no template found
              language = language || this.$getDataValue('dsMetadata/language').item
              dsSectionId = dsSectionId || this.$method('dsData/generateId')

              this.create({
                id,
                mode,
                language,
                options,
                dsSectionId
              }, resolve)
            })
            .catch(error => reject(error))
        })
      }

      // set default values here to avoid exec unnecessary functions if there is no template found
      language = language || this.$getDataValue('dsMetadata/language').item
      dsSectionId = dsSectionId || this.$method('dsData/generateId')

      const dsWidgetItems = []
      const dsWidgetGroupId = this.$method('dsData/generateId')
      const actionRefs = {}
      const events = []
      let rootWidgetId

      this.$setDataValue('dsSection/templates', id, {
        id: dsSectionId,
        suffixId: mode
      })

      this.$setDataValue('dsSection/mode', mode, {
        id: dsSectionId
      })

      for (let i = 0; i < template.item.layoutId.length; i++) {
        const contentRefs = template.item.contentRefs[i]
        const contentItems = template.item.content[i]
        const event = template.item.widgetEvent[i]
        const widget = {
          id: this.$method('dsData/generateId'),
          content: [],
          layout: template.item.layoutId[i]
        }

        if (!rootWidgetId) {
          rootWidgetId = widget.id
          actionRefs['widget:id'] = widget.id
        }

        dsWidgetItems.push(widget)

        // add events to instance
        if (Object.keys(event).length) {
          events.push([widget.id, event])
        }

        for (let j = 0; j < contentItems.length; j++) {
          const content = contentItems[j]
          const contentRef = contentRefs[j]

          // change content value
          if (options.content && options.content[contentRef]) {
            content.item = options.content[contentRef]
          }

          const dsContent = this.$setDataValue('dsContent/items', content.item, {
            suffixId: language,
            metadata: {
              type: content.type
            }
          })

          // remove language suffix to allow other language overrides
          const contentId = dsContent.noAffixId

          if (contentRef) {
            if (actionRefs[contentRef]) {
              throw new Error('Action reference id must be unique: "' + contentRef + '"')
            }

            actionRefs[contentRef] = contentId
            actionRefs[contentRef + ':index'] = j
          }

          widget.content.push(contentId)
        }

        // set widget content
        this.$setDataValue('dsWidget/content', widget.content, {
          id: widget.id,
          suffixId: mode
        })

        // add widget instance to group
        this.$setDataValue('dsWidget/groups', widget.id, {
          id: dsWidgetGroupId,
          update: {
            method: 'push'
          }
        })

        // set widget instance
        this.$setDataValue('dsWidget/items', dsWidgetGroupId, {
          id: widget.id
        })

        this.$setDataValue('dsWidget/mode', mode, {
          id: widget.id
        })

        this.$setDataValue('dsWidget/layouts', widget.layout, {
          id: widget.id,
          suffixId: mode
        })
      }

      const rootSection = []
      const usedWidgets = []

      // sort sections
      for (let i = 0; i < template.item.widgetSection.length; i++) {
        const sectionIndexes = template.item.widgetSection[i]
        const dsWidgetId = dsWidgetItems[i].id
        const dsWidgetSection = []

        // get section within widget
        for (let i = 0; i < sectionIndexes.length; i++) {
          const index = sectionIndexes[i]
          const templateSection = template.item.section[index]
          const dsSection = []
          const sectionRef = template.item.sectionRefs[i]

          if (sectionRef) {
            if (actionRefs[sectionRef]) {
              throw new Error('Action reference id must be unique: "' + sectionRef + '"')
            }

            actionRefs[sectionRef] = dsWidgetId
            actionRefs[sectionRef + ':index'] = i
          }

          for (let i = 0; i < templateSection.length; i++) {
            const index = templateSection[i]
            const dsWidgetId = dsWidgetItems[index].id
            // include instance in current section
            dsSection.push(dsWidgetId)
            // mark instance as used
            usedWidgets.push(dsWidgetId)
          }

          const section = this.$setDataValue('dsSection/items', dsSection, {
            suffixId: mode
          })

          dsWidgetSection.push(section.noAffixId)

          this.$setDataValue('dsSection/mode', mode, {
            id: section.noAffixId
          })
        }

        this.$setDataValue('dsWidget/sections', dsWidgetSection, {
          id: dsWidgetId,
          suffixId: mode
        })

        if (!usedWidgets.includes(dsWidgetId)) {
          rootSection.push(dsWidgetId)
        }
      }

      // this might be bad for empty sections, it would be better to compare to layout "hasSection"
      if (rootSection.length) {
        this.$setDataValue('dsSection/items', rootSection, {
          id: dsSectionId,
          suffixId: mode
        })
      }

      const newActions = this._updateActions(template.item.actions, actionRefs)

      for (let i = 0; i < events.length; i++) {
        const [widgetId, event] = events[i]

        for (const key in event) {
          if (Object.hasOwnProperty.call(event, key)) {
            const item = event[key]

            for (let i = 0; i < item.value.length; i++) {
              const value = item.value[i]

              // update event action item id
              if (newActions[value]) {
                item.value[i] = newActions[value]
              }
            }
          }
        }

        this.$setDataValue('dsWidget/events', event, {
          id: widgetId,
          suffixId: mode
        })
      }

      const result = {
        dsSectionId,
        dsWidgetId: rootWidgetId
      }

      if (_callback) {
        return _callback(result)
      }

      return result
    },
    _updateActions (actions, refs) {
      const newActions = {}

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        const newBlocks = {}
        const newSequence = {}

        for (let i = 0; i < action.blocks.length; i++) {
          const id = action.blocks[i]
          const block = this.$getDataValue('dsAction/blocks', { id, options: { writeable: true } })

          newBlocks[id] = this._replaceActionRef(block.item, refs)
        }

        for (let i = 0; i < action.sequences.length; i++) {
          const id = action.sequences[i]
          const sequences = this.$getDataValue('dsAction/sequences', { id, options: { writeable: true } })
          const newSequences = sequences.item

          for (let i = 0; i < newSequences.length; i++) {
            const sequence = newSequences[i]
            const block = newBlocks[sequence.id]

            if (block) {
              const blockId = objectHash(block)

              // set new block
              this.$setDataValue('dsAction/blocks', block, { id: blockId })

              // update block id
              sequence.id = blockId
            }
          }

          const sequenceId = objectHash(newSequence)

          // store new sequence id change
          newSequence[id] = sequenceId

          this.$setDataValue('dsAction/sequences', newSequences, { id: sequenceId })
        }

        const id = action.items
        const items = this.$getDataValue('dsAction/items', { id })

        // copy action items
        const newItems = items.item.slice()

        for (let i = 0; i < newItems.length; i++) {
          const sequenceId = newItems[i]

          if (newSequence[sequenceId]) {
            newItems[i] = newSequence[sequenceId]
          }
        }

        const newItem = this.$setDataValue('dsAction/items', newItems)

        newActions[id] = newItem.id
      }

      return newActions
    },
    _replaceActionRef (items, refs) {
      for (const key in items) {
        if (Object.hasOwnProperty.call(items, key)) {
          const item = items[key]

          if (refs[item] != null) {
            items[key] = refs[item]
          } else if (typeof item === 'object') {
            this._replaceActionRef(item, refs)
          }
        }
      }

      return items
    }
  }
})
