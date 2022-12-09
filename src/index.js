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
    items: {},
    templates: {},
    entry: {}
  },
  setup ({ dsPage }) {
    if (dsPage) {
      Promise.resolve(dsPage)
        .then(page => {
          this.$method('dsMetadata/setTheme', page.app.theme)
          this.$method('dsMetadata/setAppId', page.app.id)
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
            dsViewId: this.$method('dsView/getRootViewId'),
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
      this.$method('dsRouter/setPath', { pageId: dsPage.id, path: this._cleanPath(dsPage.path) })
      // set actions
      if (dsPage.actions) {
        this.$method('dsAction/set', dsPage.actions)
      }
      // set params
      if (dsPage.parameters) {
        this.$method('dsParameter/set', dsPage.parameters.items)
        this.$method('dsParameter/setUsedBy', dsPage.parameters.usedBy)
      }
      // set components
      if (dsPage.components) {
        this.$method('dsComponent/set', dsPage.components)
      }
      // set layouts
      if (dsPage.layouts) {
        if (dsPage.layouts.items) {
          this.$method('dsLayout/setItems', dsPage.layouts.items)
        }

        if (dsPage.layouts.head) {
          this.$method('dsLayout/setHead', dsPage.layouts.head)
        }

        if (dsPage.layouts.modifiers) {
          this.$method('dsLayout/setModifiers', dsPage.layouts.modifiers)
        }
      }

      // set content
      if (dsPage.content) {
        if (dsPage.content.value) {
          this.$method('dsContent/setValues', dsPage.content.value)
        }

        // if (item.elements.attributes) {
        //   this.$method('dsElement/setAttributes', item.elements.attributes)
        // }

        if (dsPage.content.type) {
          this.$method('dsContent/setTypes', dsPage.content.type)
        }
      }
      // set widgets
      if (dsPage.widgets) {
        this.$method('dsWidget/set', { dsPageId: dsPage.id, payload: dsPage.widgets })
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
      const dsViewId = this.$method('dsView/getRootViewId')
      const dsWidgetSections = this.$method('dsWidget/getEntry', dsPageId)

      for (let i = 0; i < dsWidgetSections.length; i++) {
        const dsWidgetSectionId = dsWidgetSections[i]
        // ISSUE: Create a way to determine what language the current user is
        this.$method('dsWidget/create', {
          dsViewId,
          prefixId: dsPageId,
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
