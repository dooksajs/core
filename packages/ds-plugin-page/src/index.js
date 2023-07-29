/**
 * DsPage plugin.
 * @namespace dsPage
 */
export default {
  name: 'dsPage',
  version: 1,
  data: {
    id: {
      default: {},
      schema: {
        type: 'collection',
        defaultId () {
          return this.$method('dsRouter/currentPath')
        },
        suffixId () {
          return this.$getDataValue('dsMetadata/language').item
        },
        items: {
          type: 'string'
        }
      }
    },
    events: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    sections: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          items: {
            type: 'string'
          }
        }
      }
    },
    sectionEntry: {
      default: {},
      schema: {
        type: 'collection',
        items: {
          type: 'array',
          schema: {
            items: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  setup () {
    // return new Promise((resolve, reject) => {
    //   this.getOneByPath({
    //     path: this.$method('dsRouter/currentPath')
    //   })
    //     .then(dsPage => {
    //       if (dsPage.isEmpty) {
    //         return resolve()
    //       }

    //       // this.$setDataValue('dsMetadata/appId', { source: dsPage.app.id })
    //       // this.$setDataValue('dsMetadata/theme', { source: dsPage.app.theme })

    //       this.set(dsPage)
    //       // update route if path is a redirect
    //       if (dsPage.foundPath && dsPage.foundPath !== dsPage.path) {
    //         return this.$method('dsRouter/navigate', dsPage.path)
    //       }
    //       // render init page
    //       this._render(dsPage.id)

    //       resolve()
    //     })
    //     .catch(error => reject(error))
    // })
  },
  /** @lends dsPage */
  methods: {
    getOneById ({ dsPageId, expand }) {
      const request = {
        collection: 'pages',
        id: dsPageId
      }

      if (expand) {
        request.options = { expand }
      }

      return new Promise(resolve => {
        this.$action('dsDataFetch/getOne', request,
          {
            onSuccess: (record) => resolve(record),
            onError: (error) => {
              console.error(error)
              resolve(error)
            }
          })
      })
    },
    getOneByPath ({ path, expand }) {
      return new Promise((resolve, reject) => {
        const filterPath = `(path='${path}')`
        const options = {
          filter: filterPath
        }

        if (expand) {
          options.expand = expand
        }

        this.$action('dsDatabase/getList', {
          collection: 'pages',
          options
        },
        {
          onSuccess: (record) => {
            if (!record.totalItems) {
              return resolve({ isEmpty: true })
            }

            const page = record.item[0]
            // set found path
            page.foundPath = record.path

            resolve(page)
          },
          onError: (error) => {
            if (error.code === 404) {
              const expandList = expand.split(',')
              let expandPagePath = 'page'

              for (let i = 0; i < expandList.length; i++) {
                expandPagePath += ',page.' + expandList[i]
              }

              this.$action('dsDatabase/getList', {
                collection: 'pagePaths',
                options: {
                  filter: filterPath,
                  expand: expandPagePath
                }
              },
              {
                onSuccess: (record) => {
                  const page = record.items[0]['@expand'].page
                  // set what the found path was
                  page.foundPath = record.path

                  resolve(page)
                },
                onError: (error) => {
                  console.error(error)
                  reject(error)
                }
              })
            } else {
              console.error(error)
              reject(error)
            }
          }
        })
      })
    },
    save (path = this.$method('dsRouter/currentPath')) {
      return new Promise((resolve, reject) => {
        const language = this.$getDataValue('dsMetadata/language').item
        const id = this.$getDataValue('dsPage/id', { id: path, suffixId: language }).item || this.$method('dsData/generateId')
        const dsPageSections = this.$getDataValue('dsPage/sections', { id: path }).item || []
        const dsPageSectionEntry = this.$getDataValue('dsPage/sectionEntry', { id: path }).item || []
        const dsPageEvents = this.$getDataValue('dsPage/events', { id: path }).item || []
        const content = []
        const data = {
          path,
          language,
          id,
          page: {
            events: {
              [path]: dsPageEvents
            },
            sections: {
              [path]: dsPageSections
            },
            sectionEntry: {
              [path]: dsPageSectionEntry
            }
          },
          content: {
            items: {},
            type: {}
          },
          widgets: {
            items: {},
            content: {},
            mode: {},
            events: {},
            layouts: {},
            sections: {},
            view: {},
            templates: {}
          },
          sections: {
            items: {},
            mode: {},
            view: {}
          },
          layouts: {
            items: {}
          },
          events: {
            items: {}
          },
          actions: {
            items: {},
            sequence: {},
            sequenceEntry: {}
          },
          components: {
            items: {}
          }
        }

        // widget templates
        for (let i = 0; i < dsPageSectionEntry.length; i++) {
          const id = dsPageSectionEntry[i]

          data.widgets.templates[id] = this.$getDataValue('dsWidget/templates', { id }).item
        }

        // events
        for (let i = 0; i < dsPageEvents.length; i++) {
          const id = dsPageEvents[i]
          const event = this.$getDataValue('dsEvent/listeners', { id }).item

          data.events.items[id] = event

          for (let i = 0; i < event.length; i++) {
            const dsActionSequenceEntryId = event[i]
            const dsActionSequenceEntry = this.$getDataValue('dsAction/sequenceEntry', { id: dsActionSequenceEntryId }).item

            data.actions.sequenceEntry[dsActionSequenceEntryId] = dsActionSequenceEntry

            for (let i = 0; i < dsActionSequenceEntry.length; i++) {
              const dsActionSequenceId = dsActionSequenceEntry[i]
              const dsActionSequence = this.$getDataValue('dsAction/sequence', { id: dsActionSequenceId }).item

              data.actions.sequence[dsActionSequenceId] = dsActionSequence

              for (let i = 0; i < dsActionSequence.length; i++) {
                const dsActionId = dsActionSequence[i].id

                data.actions.items[dsActionId] = this.$getDataValue('dsAction/items', { id: dsActionId }).item
              }
            }
          }
        }

        for (let i = 0; i < dsPageSections.length; i++) {
          const dsSectionId = dsPageSections[i]
          const dsSectionUniqueId = this.$getDataValue('dsSection/uniqueId').item

          const mode = this.$getDataValue('dsSection/mode', {
            id: dsSectionId,
            prefixId: dsSectionUniqueId
          }).item

          const dsSections = this.$getDataValue('dsSection/items', {
            id: dsSectionId,
            prefixId: dsSectionUniqueId,
            suffixId: mode
          })
          data.sections.view[dsSectionId] = this.$getDataValue('dsSection/view', {
            id: dsSectionId,
            prefixId: dsSectionUniqueId,
            suffixId: mode
          }).item
          data.sections.mode[dsSectionId] = mode
          data.sections.items[dsSections.id] = dsSections.item

          for (let i = 0; i < dsSections.item.length; i++) {
            const dsWidgetId = dsSections.item[i]
            let dsWidgetMode = mode

            // check if widget has an override
            if (mode === 'default') {
              dsWidgetMode = this.$getDataValue('dsWidget/mode', { id: dsWidgetId }).item
            }

            const dsWidgetContent = this.$getDataValue('dsWidget/content', { id: dsWidgetId, suffixId: dsWidgetMode })
            const dsLayoutId = this.$getDataValue('dsWidget/layouts', { id: dsWidgetId, suffixId: dsWidgetMode })
            const dsLayout = this.$getDataValue('dsLayout/items', { id: dsLayoutId.item, suffixId: dsWidgetMode })
            const widgetSections = this.$getDataValue('dsWidget/sections', { id: dsWidgetId, suffixId: dsWidgetMode })
            const widgetEvents = this.$getDataValue('dsWidget/events', { id: dsWidgetId, suffixId: dsWidgetMode })
            const widgetView = this.$getDataValue('dsWidget/view', { id: dsWidgetId, suffixId: dsWidgetMode })

            if (!widgetSections.isEmpty) {
              data.widgets.sections[widgetSections.id] = widgetSections.item
            }

            if (!widgetEvents.isEmpty) {
              data.widgets.events[widgetEvents.id] = widgetEvents.item
            }

            data.widgets.content[dsWidgetContent.id] = dsWidgetContent.item
            data.widgets.layouts[dsLayoutId.id] = dsLayoutId.item
            data.widgets.items[dsWidgetId] = this.$getDataValue('dsWidget/items', { id: dsWidgetId }).item
            data.widgets.view[widgetView.id] = widgetView.item
            data.widgets.mode[dsWidgetId] = dsWidgetMode

            // set layout and components
            data.layouts.items[dsLayoutId.item] = dsLayout.item

            for (let i = 0; i < dsLayout.item.length; i++) {
              const item = dsLayout.item[i]

              if (item.componentId && !data.components.items[item.componentId]) {
                data.components.items[item.componentId] = this.$getDataValue('dsComponent/items', { id: item.componentId }).item
              }
            }

            // set content
            for (let i = 0; i < dsWidgetContent.item.length; i++) {
              const id = dsWidgetContent.item[i]
              const contentValue = this.$getDataValue('dsContent/items', { id, suffixId: language })

              if (!contentValue.isEmpty) {
                const type = this.$getDataValue('dsContent/type', { id: contentValue.id }).item
                content.push({
                  dsId: id,
                  language,
                  content: contentValue.item,
                  type
                })

                data.content.items[contentValue.id] = contentValue.item
                data.content.type[contentValue.id] = type
              }
            }
          }
        }

        console.log(data)
        resolve(data)
      })
    },
    set (dsPage) {

    },
    _render (dsPageId) {
      // this function could be moved to widgets
      // todo: build metadata
      // add attributes to appElement
      // this.$method('dsElement/attachContent', { contentId: pageType.templateId, elementId: 'appElement' })
      const dsViewId = this.$getDataValue('dsView/rootViewId')
      const dsWidgetSections = this.$getDataValue('dsWidget/sectionEntry', {
        id: dsPageId
      })

      for (let i = 0; i < dsWidgetSections.length; i++) {
        const dsSectionId = dsWidgetSections[i]
        // ISSUE: Create a way to determine what language the current user is
        this.$method('dsWidgetView/attachSection', {
          dsViewId: dsViewId.item,
          dsWidgetPrefixId: dsPageId,
          dsSectionId
        })
      }
    }
  }
}
