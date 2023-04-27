/**
 * @namespace dsTemplate
 */
export default {
  name: 'dsTemplate',
  version: 1,
  data: {
    entry: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'string',
          relation: 'dsTemplate/items'
        }
      }
    },
    items: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'object',
          properties: {
            events: {
              type: 'object',
              patternProperties: {
                '^[0-9]+$': {
                  type: 'object',
                  patternProperties: {
                    '^[0-9]+$': {
                      type: 'object',
                      properties: {
                        click: {
                          type: 'array',
                          items: {
                            type: 'string',
                            relation: 'dsAction/sequenceActions'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            layouts: {
              type: 'array',
              items: {
                type: 'string',
                relation: 'dsLayout/items'
              }
            },
            content: {
              type: 'object',
              patternProperties: {
                '^[0-9]+$': {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      value: {
                        type: 'object'
                      },
                      type: {
                        type: 'array',
                        item: {
                          type: 'string'
                        }
                      }
                    }
                  }
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
      dsTemplateId,
      dsTemplateEntryId,
      dsWidgetPrefixId,
      dsWidgetSectionId = this.$method('dsData/generateId'),
      dsWidgetInstanceId = this.$method('dsData/generateId'),
      dsWidgetGroupId = this.$method('dsData/generateId'),
      dsWidgetMode = 'default',
      dsWidgetContent,
      modifiers = {},
      head = true
    }) {
      const entryId = this.$getDataValue({
        name: 'dsTemplate/entry',
        id: dsTemplateId
      })

      const template = this.$getDataValue({
        name: 'dsTemplate/items',
        id: entryId.item
      })
      // get template
      // const item = this.items[dsTemplateEntryId] || this.items[this.entry[dsTemplateId]]

      if (!template.isEmpty) {
        return this._constructor(
          dsTemplateId,
          dsTemplateEntryId,
          template.item,
          dsWidgetSectionId,
          dsWidgetPrefixId,
          dsWidgetInstanceId,
          dsWidgetGroupId,
          dsWidgetContent,
          modifiers,
          dsWidgetMode,
          head
        )
      }

      return new Promise(resolve => {
        this._fetch(dsTemplateId)
          .then(() => {
            this.$setDataValue({
              name: 'dsTemplates/entry',
              source: dsTemplateId,
              options: {
                id: dsTemplateId
              }
            })

            const result = this._constructor(
              dsTemplateId,
              dsTemplateEntryId,
              template.item,
              dsWidgetSectionId,
              dsWidgetPrefixId,
              dsWidgetInstanceId,
              dsWidgetGroupId,
              dsWidgetContent,
              modifiers,
              dsWidgetMode,
              head
            )

            resolve(result)
          })
      })
    },
    _constructor (
      id,
      entry,
      item,
      dsWidgetSectionId,
      dsWidgetPrefixId,
      instanceId,
      groupId,
      defaultContent,
      modifiers,
      view,
      head
    ) {
      let dsLayoutEntryId = ''
      const result = {
        layoutEntry: '',
        widgets: {
          items: {},
          content: {}
        },
        content: {
          value: {},
          type: {}
        }
      }

      if (head) {
        const layoutId = item.layouts[0]
        const layout = {}
        const i = 0

        if (item.content[i]) {
          const [contentRefs, content] = this._createContent(item.content[i], view, groupId, defaultContent, modifiers)
          const instanceContent = this.$setDataValue({
            name: 'dsWidget/instanceContent',
            source: contentRefs,
            options: {
              id: instanceId,
              suffixId: dsWidgetPrefixId
            }
          })

          result.widgets.content[instanceContent.id] = contentRefs
          result.content = content
        }

        // add events
        if (item.events[i]) {
          const events = item.events[i]

          result.events = result.events || {}

          for (const key in events) {
            if (Object.hasOwnProperty.call(events, key)) {
              const event = events[key]
              const eventId = instanceId + key.padStart(4, '0') + '_'

              for (const key in event) {
                if (Object.hasOwnProperty.call(event, key)) {
                  const actions = event[key]

                  result.events[eventId + key] = actions
                }
              }
            }
          }
        }

        dsLayoutEntryId = layoutId
        layout[view] = { id: layoutId }
      } else {
        for (let i = 0; i < item.layouts.length; i++) {
          const layoutId = item.layouts[i]
          const layout = {}
          const instanceId = this.$method('dsData/generateId')
          const itemId = instanceId + 'default'

          // create content
          if (item.content && item.content[i]) {
            const [contentRefs, content] = this._createContent(item.content[i], view, groupId, defaultContent, modifiers)

            result.widgets.content[itemId] = contentRefs

            this.$setDataValue({
              name: 'dsWidget/instanceContent',
              payload: result.widgets.content,
              options: {
                id: instanceId,
                suffixId: 'default'
              }
            })

            result.content.value = { ...result.content.value, ...content.value }
            result.content.type = { ...result.content.type, ...content.type }
          }

          // add events
          if (item.events[i]) {
            const events = item.events[i]

            result.events = result.events || {}

            for (const key in events) {
              if (Object.hasOwnProperty.call(events, key)) {
                const event = events[key]
                const eventId = instanceId + key.padStart(4, '0') + '_' + event.on

                result.events[eventId] = event.action
              }
            }
          }

          // Is this set to default because of the depth?
          layout.default = { id: layoutId }

          if (!result.widgets.sections[dsWidgetSectionId]) {
            result.widgets.sections[dsWidgetSectionId] = [instanceId]
          } else {
            result.widgets.sections[dsWidgetSectionId].push(instanceId)
          }
        }
      }

      if (result.events) {
        this.$setDataValue({
          name: 'dsEvent/listeners',
          source: result.events,
          options: {
            source: {
              merge: true
            }
          }
        })
      }

      // Set content
      if (result.content) {
        if (result.content.value) {
          this.$setDataValue({
            name: 'dsContent/items',
            source: result.content.value,
            options: {
              source: {
                merge: true
              }
            }
          })
        }

        if (result.content.type) {
          this.$setDataValue({
            name: 'dsContent/type',
            source: result.content.type,
            options: {
              source: {
                merge: true
              }
            }
          })
        }
      }

      // Set widgets
      if (result.widgets.sections) {
        this.$setDataValue({
          name: 'dsWidget/sections',
          source: result.widgets.sections,
          options: {
            source: {
              merge: true
            }
          }
        })
      }

      return {
        dsWidgetSectionId,
        dsLayoutEntryId,
        result
      }
    },
    _createContent (
      items,
      dsWidgetMode = 'default',
      dsWidgetGroupId,
      defaultContent = [],
      modifiers
    ) {
      const contentRefs = []
      const content = {
        value: {},
        type: {}
      }

      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const [type, isTemporary] = item.type
        let id, exists

        if (defaultContent.length && !isTemporary) {
          for (let i = 0; i < defaultContent.length; i++) {
            const contentId = defaultContent[i]
            const dsContentType = this.$getDataValue({
              name: 'dsContent/type',
              id: contentId
            })

            if (type === dsContentType.item) {
              id = contentId
              defaultContent.splice(i, 1)
              exists = true
              break
            }
          }
        } else {
          id = this.$method('dsData/generateId')
        }

        contentRefs.push(id)

        if (!exists) {
          content.type[id] = { name: type, isTemporary }

          if (type === 'section') {
            for (let i = 0; i < item.value.length; i++) {
              const [lang, dsTemplateEntryId] = item.value[i]
              const [sectionId] = this.create({ dsTemplateEntryId, defaultContent, dsWidgetGroupId, dsWidgetMode, modifiers, head: false })

              content.value[id + lang] = sectionId
            }
          } else {
            content.value[id + dsWidgetMode] = item.value
          }
        }
      }

      return [contentRefs, content, defaultContent]
    },
    _fetch (id) {
      return new Promise((resolve, reject) => {
        this.$action('dsDatabase/getOne', { collection: 'widgetTemplates', id },
          {
            onSuccess: (record) => {
              // add templates
              this.$setDataValue({
                name: 'dsTemplate/entry',
                source: record.templateEntry,
                options: {
                  id: record.templateEntry
                }
              })

              this.$setDataValue({
                name: 'dsTemplate/items',
                source: record.template,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              this.$setDataValue({
                name: 'dsLayout/items',
                source: record.layouts.items,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              this.$setDataValue({
                name: 'dsLayout/entry',
                source: record.layouts.head,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              this.$setDataValue({
                name: 'dsComponent/items',
                source: record.components,
                options: {
                  source: {
                    merge: true
                  }
                }
              })

              resolve(record)
            },
            onError: (error) => {
              console.error(error)
              reject(error)
            }
          }
        )
      })
    }
  }
}
