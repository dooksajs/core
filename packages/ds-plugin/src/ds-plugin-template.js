import { definePlugin } from '@dooksa/ds-scripts'
import { deepClone } from '@dooksa/utils'
import objectHash from '@dooksa/object-hash'

/**
 * @typedef {Object} TemplateResult
 * @property {string} dsSectionId - The parent section id related to a dsSection/item
 * @property {string} dsWidgetId - The parent widget id related to dsWidget/item
 */

/**
 * @typedef {Object} BlockValue - Collection of block overwrites
 * @property {string[]} keys - The list of keys used related to the location of the value
 * @property {string} value - The overwrite block value
 */

/**
 * @typedef {Object} BlockRefs
 * @property {Object} item
 * @property {BlockValue[]} blockValues - Collection of block overwrites
 */

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
                  },
                  dependencies: {
                    type: 'array',
                    items: {
                      type: 'string'
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
            eventListeners: {
              type: 'object',
              patternProperties: {
                '^[0-9]+$': {
                  type: 'object',
                  patternProperties: {
                    '^[0-9]+$': {
                      type: 'array',
                      items: {
                        type: 'string'
                      }
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
    },
    metadata: {
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            icon: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  methods: {
    /**
     * Create new widget/section/content instances from template
     * @param {Object} param
     * @param {string} param.id - Id of template
     * @param {string} [param.mode="default"] - Suffix used to categories the instances
     * @param {string} [param.language] - Language used to label the content
     * @param {string} param.dsSectionId - Id related to a dsSection/item
     * @param {Object} [param.contentOptions={}] - Collection of content overwrites by matching a ref id
     * @param {Object} [param.widgetOptions={}] - Collection of widget overwrites by matching a ref id
     * @param {string} [param.actionGroupId] - Action group id
     * @param {Function} [_callback] - Private callback that is called to resolve a fetched template
     * @returns {(TemplateResult|Promise)}
     */
    create ({
      id,
      mode = 'default',
      language,
      contentOptions = {},
      widgetOptions = {},
      actionGroupId,
      dsSectionId
    }, _callback) {
      let template = this.$getDataValue('dsTemplate/items', { id })

      // fetch template
      if (template.isEmpty) {
        return new Promise((resolve, reject) => {
          this.$action('dsDatabase/getById', {
            collection: 'template',
            id: [id],
            expand: true
          }, {
            onSuccess: data => {
              if (!data) {
                resolve(false)
              }

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
                contentOptions,
                widgetOptions,
                actionGroupId,
                dsSectionId
              }, resolve)
            },
            onError: error => reject(error)
          })
        })
      }

      template = template.item
      // set default values here to avoid exec unnecessary functions if there is no template found
      language = language || this.$getDataValue('dsMetadata/language').item
      dsSectionId = dsSectionId || this.$method('dsData/generateId')

      const dsWidgetGroupId = widgetOptions.groupId || this.$method('dsData/generateId')
      const dsWidgetItems = []
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

      for (let i = 0; i < template.layoutId.length; i++) {
        const queryIndexes = template.queryIndexes[i]
        const contentRefs = template.contentRefs[i]
        const contentItems = template.content[i]
        const eventListener = template.eventListeners[i]
        const widgetEvent = template.widgetEvent[i]
        const layoutId = template.layoutId[i]
        const widget = {
          id: this.$method('dsData/generateId'),
          content: [],
          layout: layoutId
        }

        if (!rootWidgetId) {
          rootWidgetId = widget.id
          actionRefs['widget:id'] = widget.id
        }

        dsWidgetItems.push(widget)

        // set event listener edit modes
        if (eventListener) {
          this.$setDataValue('dsLayout/eventListeners', eventListener, {
            id: layoutId
          })
        }

        // add events to instance
        if (
          widgetEvent != null &&
          Object.keys(widgetEvent).length
        ) {
          events.push([widget.id, widgetEvent])

          this.$setDataValue('dsWidget/events', widgetEvent, {
            id: widget.id,
            mode
          })
        }

        for (let j = 0; j < contentItems.length; j++) {
          const queryIndex = queryIndexes[j]
          const contentRef = contentRefs[j]
          let content = contentItems[j]

          // change content value
          if (contentOptions[contentRef]) {
            content = deepClone({}, contentItems[j])
            content.item = contentOptions[contentRef]
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
              this.$log('error', { message: 'Action reference id must be unique: "' + contentRef + '"' })
            }

            actionRefs[contentRef] = contentId
            actionRefs[contentRef + ':index'] = j
          }

          if (queryIndex) {
            const dataValue = {
              contentId,
              widgetId: rootWidgetId
            }

            if (queryIndex.content) {
              dataValue.content = queryIndex.content
            }

            this.$setDataValue('dsQuery/items', dataValue, {
              id: queryIndex.id,
              update: {
                method: 'push'
              }
            })

            // remove content from query when content item is deleted
            this.$addDataListener('dsContent/items', {
              on: 'delete',
              id: dsContent.id,
              handler: {
                id: queryIndex.id,
                value: () => {
                  const queryData = this.$getDataValue('dsQuery/items', {
                    id: queryIndex.id,
                    writable: true
                  })

                  if (queryData.isEmpty) {
                    return
                  }

                  const query = queryData.item.filter(item => {
                    if (item.contentId !== contentId) {
                      return true
                    }

                    return false
                  })

                  this.$setDataValue('dsQuery/items', query, {
                    id: queryData.id
                  })
                }
              }
            })
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

        this.$setDataValue('dsWidget/actionGroups', actionGroupId || widget.id, {
          id: widget.id
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
      for (let i = 0; i < template.widgetSection.length; i++) {
        const sectionIndexes = template.widgetSection[i]
        const dsWidgetId = dsWidgetItems[i].id
        const dsWidgetSection = []

        // get section within widget
        for (let i = 0; i < sectionIndexes.length; i++) {
          const index = sectionIndexes[i]
          const templateSection = template.section[index]
          const dsSection = []
          const sectionRef = template.sectionRefs[i]

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

      if (events.length) {
        const newActions = this._updateActions(template.actions, actionRefs)

        for (let i = 0; i < events.length; i++) {
          const [widgetId, event] = events[i]
          const actions = {}

          for (const key in event) {
            if (Object.hasOwnProperty.call(event, key)) {
              const item = event[key]

              for (let i = 0; i < item.value.length; i++) {
                const value = item.value[i]

                // update event action item id
                if (newActions.items[value]) {
                  actions[value] = newActions.items[value]

                  const dependencies = newActions.dependencies[value]

                  if (dependencies) {
                    for (let i = 0; i < dependencies.length; i++) {
                      const id = dependencies[i]

                      actions[id] = newActions.items[id]
                    }
                  }
                }
              }
            }
          }

          this.$setDataValue('dsWidget/actions', actions, {
            id: widgetId,
            suffixId: mode
          })
        }
      }

      // this might be bad for empty sections, it would be better to compare to layout "hasSection"
      if (rootSection.length) {
        this.$setDataValue('dsSection/items', rootSection, {
          id: dsSectionId,
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
    /**
     * Create action block overwrites
     * @private
     * @param {Object} actions - Collection of actions used by template
     * @param {Object} refs - Reference action overwrites
     * @returns {Object}
     */
    _updateActions (actions, refs) {
      const newActions = {
        items: {},
        dependencies: {}
      }

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i]
        const newBlocks = {}
        const blockValues = {}

        for (let i = 0; i < action.blocks.length; i++) {
          const id = action.blocks[i]
          const block = this.$getDataValue('dsAction/blocks', { id })
          const result = this._replaceActionRef(block.item, refs)

          if (result.blockValues.length) {
            const blockValues = []

            for (let i = 0; i < result.blockValues.length; i++) {
              blockValues.push(result.blockValues[i])
            }

            newBlocks[id] = {
              item: result.item,
              values: blockValues
            }
          }
        }

        for (let i = 0; i < action.sequences.length; i++) {
          const id = action.sequences[i]
          const sequences = this.$getDataValue('dsAction/sequences', { id })

          for (let i = 0; i < sequences.item.length; i++) {
            const sequence = sequences.item[i]
            const block = newBlocks[sequence.id]

            if (block) {
              const blockId = objectHash(block.item)

              if (!blockValues[id]) {
                blockValues[id] = {}
              }

              blockValues[id][i] = { id: blockId }

              if (block.values.length) {
                blockValues[id][i].values = block.values
              }
            }
          }
        }

        const id = action.items
        const items = this.$getDataValue('dsAction/items', { id })

        // copy action items
        const newItems = {}

        for (let i = 0; i < items.item.length; i++) {
          const sequenceId = items.item[i]
          const blockOverwrites = blockValues[sequenceId]

          if (blockOverwrites) {
            newItems[sequenceId] = blockOverwrites
          }
        }

        // join actions
        if (action.dependencies) {
          newActions.dependencies[id] = action.dependencies
        }

        newActions.items[id] = newItems
      }

      return newActions
    },
    /**
     * Create a list of block value overwrites
     * @private
     * @param {Object} items
     * @param {Object} refs
     * @param {string[]} blockKeys - The keys used to lead to the block value
     * @param {BlockValue[]} blockValues - Collection of block overwrites
     * @param {number} index - Current depth
     * @param {boolean} [isEntry=true] - The head of the recursive function
     * @returns {BlockRefs}
     */
    _replaceActionRef (items, refs, blockKeys = [], blockValues = [], index = 0, isEntry = true) {
      for (const key in items) {
        if (Object.hasOwnProperty.call(items, key)) {
          const item = items[key]

          if (refs[item] != null) {
            // store key/values
            blockKeys.push(key)
            blockValues.push({ keys: blockKeys, value: refs[item] })

            // Moving up the tree
            blockKeys = blockKeys.slice(0, -1)
          } else if (typeof item === 'object') {
            blockKeys.push(key)

            this._replaceActionRef(item, refs, blockKeys, blockValues, index + 1, false)

            // Moving up the tree
            blockKeys = blockKeys.slice(0, index)
          }
        }
      }

      // Moving back to the root
      blockKeys = []

      if (isEntry) {
        return {
          item: items,
          blockValues
        }
      }
    }
  }
})
