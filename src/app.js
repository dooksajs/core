import { name, version } from '../ds.plugin.config'

/**
 * Ds App plugin.
 * @module plugin
 */

export default {
  name,
  version,
  dependencies: [
    {
      name: 'dsRouter',
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
    cssElement: null,
    assetsURL: '',
    appElement: null,
    pages: {},
    pageTypes: {},
    template: {}
  },
  setup ({ appElement, appCache = {}, assetsURL }) {
    this.appElement = appElement
    this.assetsURL = assetsURL
    this.cssElement = this._loadCSS(appCache.app.theme || 'bootstrap', () => {
      appElement.classList.remove('loading')
    })

    this.set({}, appCache)

    // get current page id
    const pageId = this.$method('dsRouter/getCurrentId')
    // render init page
    this.render({}, pageId)
  },
  methods: {
    fetch (context, id) {
      return new Promise(resolve => {
        this.$resource.script({
          id: 'ds-app-cache__' + id,
          src: this.assetsURL + '/app_cache/' + window.location.hostname + '/' + id + '.js',
          globalVars: ['dsAppCache'],
          onSuccess: ({ dsAppCache }) => resolve(dsAppCache),
          onError: () => resolve()
        })
      })
    },
    set (context, item) {
      // add cache actions
      if (item.actions) {
        this.$method('dsAction/set', item.actions.items)
        this.$method('dsAction/setConditions', item.actions.conditions)
      }
      // add cache params
      if (item.params) {
        this.$method('dsParameters/set', item.params.items)
        this.$method('dsParameters/setUsedBy', item.params.usedBy)
      }
      // add cache widgets
      if (item.widgets) {
        this.$method('dsWidget/setContent', item.widgets.content)
        this.$method('dsWidget/setChildren', item.widgets.children)
        this.$method('dsWidget/setLayout', item.widgets.layout)
        this.$method('dsWidget/setBaseItem', item.widgets.baseItems)
        this.$method('dsWidget/setItem', item.widgets.items)
      }

      this.$method('dsContent/set', item.content)
      this.$method('dsRouter/set', item.routes)

      this._setPage(item.pages)
      this._setPageType(item.pageTypes)
      this._setTemplate(item.templates)
    },
    update (context, { prevId, nextId }) {
      const prevPage = this.pages[prevId]
      const prevPageType = this.pageTypes[prevPage.pageTypeId]
      const prevTemplate = this.templates[prevPageType.templateId]
      // next page
      const nextPage = this.pages[nextId]
      const nextPageType = this.pageTypes[nextPage.pageTypeId]
      const nextTemplate = this.templates[nextPageType.templateId]

      // update class on body
      if (nextTemplate.classList) {
        document.body.setAttribute('class', nextTemplate.classList.join(' '))
      }

      const nextLength = nextTemplate.widgets.length
      const prevLength = prevTemplate.widgets.length
      const renderLength = nextLength > prevLength ? nextLength : prevLength
      // parentElement could be specified by a parameter
      for (let i = 0; i < renderLength; i++) {
        const nextWidgetId = nextTemplate.widgets[i]
        const prevWidgetId = prevTemplate.widgets[i]

        if (nextWidgetId) {
          let prevWidgets = this.$method('dsWidget/getItem', prevId + '__' + prevWidgetId)
          let nextWidgets = this.$method('dsWidget/getItem', nextId + '__' + nextWidgetId)

          if (!prevWidgets) {
            prevWidgets = this.$method('dsWidget/getBaseItem', prevWidgetId)
          }

          if (!nextWidgets) {
            nextWidgets = this.$method('dsWidget/getBaseItem', nextWidgetId)
          }

          const renderLength = nextWidgets.length > prevWidgets.length ? nextWidgets.length : prevWidgets.length

          for (let i = 0; i < renderLength; i++) {
            const nextWidget = nextWidgets[i]
            const prevWidget = prevWidgets[i]

            if (nextWidget) {
              // this should be handled in dsWidgets
              const newElement = this.$method('dsWidget/create', {
                layoutId: nextWidget.layoutId,
                instanceId: nextWidget.instanceId
              })

              if (prevWidget) {
                const prevElement = this.$method('dsWidget/getElement', prevWidget.instanceId)
                let parentElement = null
                parentElement = prevElement[0].parentElement

                if (!parentElement) {
                  parentElement = this.appElement
                }

                parentElement.replaceChildren(...newElement)
              } else {
                this.appElement.appendChild(...newElement)
              }
            } else if (prevWidget) {
              const prevElement = this.$method('dsWidget/getElement', prevWidget.instanceId)
              // remove element from the dom
              for (let i = 0; i < prevElement.length; i++) {
                prevElement[i].remove()
              }
            }
          }
        } else if (prevWidgetId) {
          let prevWidgets = this.$method('dsWidget/getItem', prevId + '__' + prevWidgetId)

          if (!prevWidgets) {
            prevWidgets = this.$method('dsWidget/getBaseItem', prevWidgetId)
          }

          for (let i = 0; i < prevWidgets.length; i++) {
            const prevWidget = prevWidgets[i]
            const prevElement = this.$method('dsWidget/getElement', prevWidget.instanceId)
            // remove element from the dom
            for (let i = 0; i < prevElement.length; i++) {
              prevElement[i].remove()
            }
          }
        }
      }
    },
    render (context, pageId) {
      const page = this.pages[pageId]
      // todo: build metadata
      const pageType = this.pageTypes[page.pageTypeId]
      const template = this.templates[pageType.templateId]
      // add class to body
      if (template.classList) {
        document.body.setAttribute('class', template.classList.join(' '))
      }

      for (let i = 0; i < template.widgets.length; i++) {
        const widgetId = template.widgets[i]
        let widgets = this.$method('dsWidget/getItem', pageId + '__' + widgetId)

        if (!widgets) {
          widgets = this.$method('dsWidget/getBaseItem', widgetId)
        }

        for (let i = 0; i < widgets.length; i++) {
          const widget = widgets[i]
          const component = this.$method('dsWidget/create', {
            layoutId: widget.layoutId,
            instanceId: widget.instanceId
          })

          for (let i = 0; i < component.length; i++) {
            this.appElement.appendChild(component[i])
          }
        }
      }
    },
    _setPage (item) {
      this.pages = { ...this.pages, ...item }
    },
    _setPageType (item) {
      this.pageTypes = { ...this.pageTypes, ...item }
    },
    _setTemplate (item) {
      this.templates = { ...this.templates, ...item }
    },
    _loadCSS (theme = 'bootstrap', callback) {
      const cssElement = this.cssElement || document.createElement('link')

      cssElement.id = 'ds-theme'
      cssElement.rel = 'stylesheet'
      cssElement.href = this.assetsURL + '/assets/css/' + theme + '.min.css'
      document.head.insertBefore(cssElement, document.head.childNodes[document.head.childNodes.length - 1].nextSibling)

      if (callback) {
        cssElement.addEventListener('load', (e) => {
          callback()
        })
      }

      return cssElement
    }
  }
}
