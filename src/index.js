/**
 * Ds Page plugin.
 * @module plugin
 */

export default {
  name: 'dsPage',
  version: 1,
  dependencies: [
    {
      name: 'dsRouter',
      version: 1
    },
    {
      name: 'dsComponent',
      version: 1
    },
    {
      name: 'dsLayout',
      version: 1
    },
    {
      name: 'dsView',
      version: 1
    },
    {
      name: 'dsContent',
      version: 1
    },
    {
      name: 'dsWidget',
      version: 1
    }
  ],
  data: {
    items: {
      private: true,
      default: {}
    },
    templates: {
      private: true,
      default: {}
    },
    entry: {
      private: true,
      default: {}
    }
  },
  setup ({ dsPage }) {
    if (dsPage) {
      Promise.resolve(dsPage)
        .then(page => {
          this.$setDataValue({ name: 'dsMetadata/appId', source: page.app.id })
          this.$setDataValue({ name: 'dsMetadata/theme', source: page.app.theme })

          this.set(page)
          // update route if path is a redirect
          if (page.foundPath && page.foundPath !== page.path) {
            return this.$method('dsRouter/navigate', this._cleanPath(page.path))
          }
          // render init page
          this._render(page.id)
        })
        .catch(error => console.log(error))
    }
  },
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
        this.$action('dsDatabase/getOne', request,
          {
            onSuccess: (record) => resolve(record),
            onError: (error) => {
              console.error(error)
              resolve(error)
            }
          })
      })
    },
    getOneByPath ({ dsPagePath, expand }) {
      return new Promise((resolve, reject) => {
        const filterPath = `(path='${dsPagePath}')`
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
            const page = record
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
    updateDOM ({ dsPagePrevId, dsPageNextId }) {
      const prevPage = this.items[dsPagePrevId]
      const prevPageType = this.types[prevPage.typesId]
      const prevTemplateId = prevPage.templateId || prevPageType.templateId
      const prevTemplate = this.templates[prevTemplateId]
      // next page
      const nextPage = this.items[dsPageNextId]
      const nextPageType = this.types[nextPage.typesId]
      const nextTemplateId = nextPage.templateId || nextPageType.templateId
      const nextTemplate = this.templates[nextTemplateId]
      // ISSUE: What is this for?
      // this.$method('dsElement/detachContent', { contentId: prevTemplateId, elementId: 'appElement' })
      // this.$method('dsElement/attachContent', { contentId: nextTemplateId, elementId: 'appElement' })

      const nextLength = nextTemplate.widgets.length
      const prevLength = prevTemplate.widgets.length
      const renderLength = nextLength > prevLength ? nextLength : prevLength

      for (let i = 0; i < renderLength; i++) {
        const dsWidgetNextSectionId = nextTemplate.widgets[i]
        const dsWidgetSectionId = prevTemplate.widgets[i]

        if (dsWidgetNextSectionId) {
          this.$method('dsWidget/update', {
            dsViewId: this.$getDataValue({ name: 'dsView/rootViewId' }),
            dsWidgetPrefixId: dsPagePrevId,
            dsWidgetSectionId,
            dsWidgetNextPrefixId: dsPageNextId,
            dsWidgetNextSectionId
          })
        } else if (dsWidgetSectionId) {
          this.$method('dsWidget/remove', {
            dsWidgetSectionId,
            dsWidgetPrefixId: dsPagePrevId
          })
        }
      }
    },
    set (dsPage) {
      // break without metadata
      // if (!item.metadata) return
      this.$setDataValue({
        name: 'dsRouter/path',
        source: dsPage.id,
        options: {
          id: this._cleanPath(dsPage.path)
        }
      })

      // set actions
      if (dsPage.actions) {
        this.$setDataValue({
          name: 'dsAction/actions',
          source: dsPage.dsActions.actions,
          options: {
            source: {
              merge: true
            }
          }
        })

        this.$setDataValue({
          name: 'dsAction/conditions',
          source: dsPage.dsActions.conditions,
          options: {
            source: {
              merge: true
            }
          }
        })

        this.$setDataValue({
          name: 'dsAction/sequenceActions',
          source: dsPage.dsActions.sequenceActions,
          options: {
            source: {
              merge: true
            }
          }
        })

        this.$setDataValue({
          name: 'dsAction/sequenceConditions',
          source: dsPage.dsActions.sequenceConditions,
          options: {
            source: {
              merge: true
            }
          }
        })
      }
      // set params
      if (dsPage.parameters) {
        this.$setDataValue({
          name: 'dsParameter/items',
          source: dsPage.parameters.items,
          options: {
            source: {
              merge: true
            }
          }
        })
        this.$setDataValue({
          name: 'dsParameter/usedBy',
          source: dsPage.parameters.usedBy,
          options: {
            source: {
              merge: true
            }
          }
        })
      }
      // set components
      if (dsPage.components) {
        this.$setDataValue({
          name: 'dsComponent/item',
          source: dsPage.components,
          options: {
            source: {
              merge: true
            }
          }
        })
      }
      // set layouts
      if (dsPage.layouts) {
        if (dsPage.layouts.items) {
          this.$setDataValue({
            name: 'dsLayout/items',
            source: dsPage.layouts.items,
            options: {
              source: {
                merge: true
              }
            }
          })
        }

        if (dsPage.layouts.head) {
          this.$setDataValue({
            name: 'dsLayout/entry',
            source: dsPage.layouts.head,
            options: {
              source: {
                merge: true
              }
            }
          })
        }

        if (dsPage.layouts.modifiers) {
          this.$method('dsLayout/setModifiers', dsPage.layouts.modifiers)
        }
      }

      // set content
      if (dsPage.content) {
        if (dsPage.content.value) {
          this.$setDataValue({
            name: 'dsContent/items',
            source: dsPage.content.value,
            options: {
              source: {
                merge: true
              }
            }
          })
        }

        // if (item.elements.attributes) {
        //   this.$method('dsElement/setAttributes', item.elements.attributes)
        // }

        if (dsPage.content.type) {
          this.$setDataValue({
            name: 'dsContent/type',
            source: dsPage.content.type,
            options: {
              source: {
                merge: true
              }
            }
          })
        }
      }
      // set widgets
      if (dsPage.widgets) {
        if (dsPage.widgets.content) {
          this.$setDataValue({
            name: 'dsWidget/instanceContent',
            source: dsPage.widgets.content,
            options: {
              source: {
                merge: true
              }
            }
          })
        }

        if (dsPage.widgets.entry) {
          this.$setDataValue({
            name: 'dsWidget/sectionEntry',
            source: dsPage.widgets.entry,
            options: {
              source: {
                merge: true
              }
            }
          })
        }

        if (dsPage.widgets.sections) {
          this.$setDataValue({
            name: 'dsWidget/sections',
            source: dsPage.widgets.sections,
            options: {
              source: {
                merge: true
              }
            }
          })
        }
      }
      // set page
      // ISSUE: this data needs to be refactored
      this._setItem(dsPage.id, dsPage.metadata)
      this._setTemplate(dsPage.templates)
    },
    _cleanPath (path) {
      const cleanPath = path.split('/')

      cleanPath.shift()

      return '/' + cleanPath.join('/')
    },
    _render (dsPageId) {
      // this function could be moved to widgets
      // todo: build metadata
      // add attributes to appElement
      // this.$method('dsElement/attachContent', { contentId: pageType.templateId, elementId: 'appElement' })
      const dsViewId = this.$getDataValue({ name: 'dsView/rootViewId' })
      const dsWidgetSections = this.$getDataValue({
        name: 'dsWidget/sectionEntry',
        id: dsPageId
      })

      for (let i = 0; i < dsWidgetSections.length; i++) {
        const dsWidgetSectionId = dsWidgetSections[i]
        // ISSUE: Create a way to determine what language the current user is
        this.$method('dsWidgetView/attachSection', {
          dsViewId: dsViewId.item,
          dsWidgetPrefixId: dsPageId,
          dsWidgetSectionId
        })
      }
    },
    _setItem (id, item) {
      this.items[id] = item
    },
    _setTemplate (item) {
      this.templates = { ...this.templates, ...item }
    }
  }
}
