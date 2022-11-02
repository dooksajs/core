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
      name: 'dsElement',
      version: 1
    },
    {
      name: 'dsWidget',
      version: 1
    }
  ],
  data: {
    items: {},
    templates: {}
  },
  setup ({ prefetchedPage }) {
    if (prefetchedPage) {
      Promise.resolve(prefetchedPage)
        .then(page => {
          this.$method('dsMetadata/setTheme', page.app.theme)
          this.$method('dsMetadata/setAppId', page.app.id)
          this.set({}, page)
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
    getOneById (context, { id, expand }) {
      const request = {
        collection: 'pages',
        id
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
    getOneByPath (context, { path, expand }) {
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
    updateDOM (context, { prevId, nextId }) {
      const prevPage = this.items[prevId]
      const prevPageType = this.types[prevPage.typesId]
      const prevTemplateId = prevPage.templateId || prevPageType.templateId
      const prevTemplate = this.templates[prevTemplateId]
      // next page
      const nextPage = this.items[nextId]
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
        const nextSectionId = nextTemplate.widgets[i]
        const prevSectionId = prevTemplate.widgets[i]

        if (nextSectionId) {
          this.$method('dsWidget/update', {
            parentElementId: 'appElement',
            prevPrefixId: prevId,
            prevId: prevSectionId,
            nextPrefixId: nextId,
            nextId: nextSectionId
          })
        } else if (prevSectionId) {
          this.$method('dsWidget/remove', {
            sectionId: prevSectionId,
            prefixId: prevId
          })
        }
      }
    },
    set (context, item) {
      // break without metadata
      // if (!item.metadata) return
      this.$method('dsRouter/setPath', { pageId: item.id, path: this._cleanPath(item.path) })
      // set actions
      if (item.actions) {
        this.$action('dsAction/set', item.actions.items)
        this.$action('dsAction/setConditions', item.actions.conditions)
      }
      // set params
      if (item.parameters) {
        this.$action('dsParameters/set', item.parameters.items)
        this.$action('dsParameters/setUsedBy', item.parameters.usedBy)
      }
      // set components
      if (item.components) {
        this.$method('dsComponent/set', item.components)
      }
      // set layouts
      if (item.layouts) {
        if (item.layouts.items) {
          this.$method('dsLayout/setItems', item.layouts.items)
        }

        if (item.layouts.head) {
          this.$method('dsLayout/setHead', item.layouts.head)
        }

        if (item.layouts.modifiers) {
          this.$method('dsLayout/setModifiers', item.layouts.modifiers)
        }
      }
      // set element content
      if (item.elements) {
        if (item.elements.value) {
          this.$method('dsElement/setValues', item.elements.value)
        }

        if (item.elements.attributes) {
          this.$method('dsElement/setAttributes', item.elements.attributes)
        }

        if (item.elements.type) {
          this.$method('dsElement/setTypes', item.elements.type)
        }
      }
      // set widgets
      if (item.widgets) {
        this.$method('dsWidget/set', { pageId: item.id, payload: item.widgets })
      }
      // set page
      this._setItem(item.id, item.metadata)
      this._setTemplate(item.templates)
    },
    _cleanPath (path) {
      const cleanPath = path.split('/')

      cleanPath.shift()

      return '/' + cleanPath.join('/')
    },
    _render (id) {
      // this function could be moved to widgets
      // todo: build metadata
      // add attributes to appElement
      // this.$method('dsElement/attachContent', { contentId: pageType.templateId, elementId: 'appElement' })
      const widgetEntries = this.$method('dsWidget/getHead', id)

      for (let i = 0; i < widgetEntries.length; i++) {
        // ISSUE: Create a way to determine what language the current user is
        this.$method('dsWidget/create', {
          parentElementId: 'appElement',
          prefixId: id,
          id: widgetEntries[i]
          // lang: this.lang
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
