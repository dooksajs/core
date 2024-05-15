import { createPlugin } from '@dooksa/create'
import { objectHash } from '@dooksa/utils'
import { $fetchById, dataGenerateId, $getDataValue, $setDataValue, $addDataListener } from './index.js'


/**
 * Create action block overwrites
 * @private
 * @param {Object} actions - Collection of actions used by template
 * @param {Object} refs - Reference action overwrites
 * @returns {Object}
 */
function updateActions (actions, refs) {
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
      const block = $getDataValue('action/blocks', { id })
      const result = replaceActionRef(block.item, refs)

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
      const sequences = $getDataValue('action/sequences', { id })

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
    const items = $getDataValue('action/items', { id })

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
}

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
function replaceActionRef (items, refs, blockKeys = [], blockValues = [], index = 0, isEntry = true) {
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

        replaceActionRef(item, refs, blockKeys, blockValues, index + 1, false)

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

const template = createPlugin({
  name: 'template',
  data: {
    items: {
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
                    relation: 'action/blocks'
                  }
                },
                items: {
                  type: 'string',
                  relation: 'action/items'
                },
                sequences: {
                  type: 'array',
                  items: {
                    type: 'string',
                    relation: 'action/sequences'
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
                    relation: 'component/items'
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
              relation: 'layout/items'
            }
          },
          widgetEvent: {
            type: 'array',
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
                          type: 'string'
                        }
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
    },
    metadata: {
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
  },
  actions: {
    /**
     * Create new widget/section/content instances from template
     * @param {Object} param
     * @param {string} param.id - Id of template
     * @param {string} [param.mode="default"] - Suffix used to categories the instances
     * @param {string} [param.language] - Language used to label the content
     * @param {Object} [param.contentOptions={}] - Collection of content overwrites by matching a ref id
     * @param {Object} [param.widgetOptions={}] - Collection of widget overwrites by matching a ref id
     * @param {Function} [_callback] - Private callback that is called to resolve a fetched template
     * @returns {(string|Promise)}
     */
    create ({
      id,
      mode = 'default',
      language,
      contentOptions = {},
      widgetOptions = {}
    }, _callback) {
      let template = $getDataValue('template/items', { id })

      // fetch template
      if (template.isEmpty) {
        return new Promise((resolve, reject) => {
          $fetchById({
            collection: 'template',
            id: [id],
            expand: true
          })
            .then(data => {
              if (!data) {
                resolve(false)
              }

              const dataItem = data[0]
              const templateData = $setDataValue(dataItem.collection, dataItem.item, { id: dataItem.id })

              if (!templateData.isValid) {
                reject(templateData.error.details)
              }

              if (dataItem.expand) {
                for (let i = 0; i < dataItem.expand.length; i++) {
                  const expand = dataItem.expand[i]
                  const expandData = $setDataValue(expand.collection, expand.item, { id: expand.id })

                  if (!expandData.isValid) {
                    reject(templateData.error.details)
                  }
                }
              }

              this.create({
                id,
                mode,
                language,
                contentOptions,
                widgetOptions
              }, resolve)
            })
            .catch(error => {
              reject(error)
            })
        })
      }

      template = template.item
      // set default values here to avoid exec unnecessary functions if there is no template found
      language = language || $getDataValue('metadata/currentLanguage').item

      const widgetGroupId = widgetOptions.groupId || dataGenerateId()
      const widgetItems = []
      const activeEvents = []
      const actionRefs = {}
      let widgetId = ''

      for (let i = 0; i < template.layoutId.length; i++) {
        const queryIndexes = template.queryIndexes[i]
        const contentRefs = template.contentRefs[i]
        const contentItems = template.content[i]
        const eventListener = template.eventListeners[i]
        const widgetEvent = template.widgetEvent[i]
        const layoutId = template.layoutId[i]
        const widget = {
          id: dataGenerateId(),
          content: [],
          layout: layoutId
        }

        widgetItems.push(widget)

        if (!widgetId) {
          widgetId = widget.id
          actionRefs['widget:id'] = widgetId
        }

        // set event listener edit modes
        if (eventListener) {
          $setDataValue('layout/eventListeners', eventListener, {
            id: layoutId
          })
        }

        // add events to instance
        if (widgetEvent != null) {
          activeEvents.push([widget.id, widgetEvent])

          $setDataValue('widget/events', widgetEvent, {
            id: widget.id,
            suffixId: mode
          })
        }

        for (let j = 0; j < contentItems.length; j++) {
          const queryIndex = queryIndexes[j]
          const contentRef = contentRefs[j]
          let contentItem = contentItems[j]

          // change content value
          if (contentOptions[contentRef]) {
            contentItem = deepClone({}, contentItem)
            contentItem.item = contentOptions[contentRef]
          }

          const content = $setDataValue('content/items', contentItem.item, {
            suffixId: language,
            metadata: {
              type: contentItem.type
            }
          })

          // remove language suffix to allow other language overrides
          const contentId = content.noAffixId

          if (contentRef) {
            if (actionRefs[contentRef]) {
              throw new Error( 'Action reference id must be unique: "' + contentRef + '"')
            }

            actionRefs[contentRef] = contentId
            actionRefs[contentRef + ':index'] = j
          }

          if (queryIndex) {
            const dataValue = {
              contentId,
              widgetId: widgetId
            }

            if (queryIndex.content) {
              dataValue.content = queryIndex.content
            }

            $setDataValue('query/items', dataValue, {
              id: queryIndex.id,
              update: {
                method: 'push'
              }
            })

            // remove content from query when content item is deleted
            $addDataListener('content/items', {
              on: 'delete',
              id: content.id,
              handler: {
                id: queryIndex.id,
                value: () => {
                  const queryData = $getDataValue('query/items', {
                    id: queryIndex.id,
                    clone: true
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

                  $setDataValue('query/items', query, {
                    id: queryData.id
                  })
                }
              }
            })
          }

          widget.content.push(contentId)
        }

        // set widget content
        $setDataValue('widget/content', widget.content, {
          id: widget.id,
          suffixId: mode
        })

        // add widget instance to group
        $setDataValue('widget/groups', widget.id, {
          id: widgetGroupId,
          update: {
            method: 'push'
          }
        })

        // set widget instance
        $setDataValue('widget/items', widgetGroupId, {
          id: widget.id
        })

        $setDataValue('widget/mode', mode, {
          id: widget.id
        })

        $setDataValue('widget/layouts', widget.layout, {
          id: widget.id,
          suffixId: mode
        })

        $setDataValue('widget/templates', id, {
          id: widget.id,
          suffixId: mode
        })
      }

      // sort sections
      for (let i = 0; i < template.widgetSection.length; i++) {
        const sectionIndexes = template.widgetSection[i]
        const id = widgetItems[i].id
        const widgetSection = []

        // get section within widget
        for (let i = 0; i < sectionIndexes.length; i++) {
          const index = sectionIndexes[i]
          const templateSection = template.section[index]
          const widgets = []
          const sectionRef = template.sectionRefs[i]

          if (sectionRef) {
            if (actionRefs[sectionRef]) {
              throw new Error('Action reference id must be unique: "' + sectionRef + '"')
            }

            actionRefs[sectionRef] = id
            actionRefs[sectionRef + ':index'] = i
          }

          for (let i = 0; i < templateSection.length; i++) {
            const index = templateSection[i]
            const id = widgetItems[index].id
            // include instance in current section
            widgets.push(id)
          }

          const section = $setDataValue('section/items', widgets, {
            suffixId: mode
          })

          widgetSection.push(section.noAffixId)

          $setDataValue('section/mode', mode, {
            id: section.noAffixId
          })
        }

        $setDataValue('widget/sections', widgetSection, {
          id,
          suffixId: mode
        })
      }

      // Update unique token action value
      if (activeEvents.length) {
        const newActions = updateActions(template.actions, actionRefs)

        for (let i = 0; i < activeEvents.length; i++) {
          const [widgetId, activeEvent] = activeEvents[i]
          const actions = {}

          for (const key in activeEvent) {
            if (Object.hasOwnProperty.call(activeEvent, key)) {
              const events = activeEvent[key]

              for (let i = 0; i < events.length; i++) {
                const event = events[i]

                for (let i = 0; i < event.value.length; i++) {
                  const value = event.value[i]

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
          }

          $setDataValue('widget/actions', actions, {
            id: widgetId,
            suffixId: mode
          })
        }
      }

      if (_callback) {
        return _callback(widgetId)
      }

      return widgetId
    }
  }
})

const templateCreate = template.actions.create

export {
  templateCreate
}

export default template
