/**
 * Ds App plugin.
 * @module plugin
 */

export default {
  name: 'dsApp',
  version: 1,
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
    assetsURL: '',
    appElement: null,
    pages: {},
    pageTypes: {},
    template: {}
  },
  setup ({ appElement, appCache = {}, assetsURL }) {
    this.appElement = appElement
    this.assetsURL = assetsURL
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

      for (let i = 0; i < renderLength; i++) {
        const nextWidgetId = nextTemplate.widgets[i]
        const prevWidgetId = prevTemplate.widgets[i]

        if (nextWidgetId) {
          this.$method('dsWidget/updateSection', {
            parentElement: this.appElement,
            prevId,
            prevInstanceId: prevWidgetId,
            nextId,
            nextInstanceId: nextWidgetId
          })
        } else if (prevWidgetId) {
          this.$method('dsWidget/removeSection', {
            id: prevWidgetId,
            instanceId: prevId
          })
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
        const instanceId = template.widgets[i]

        this.$method('dsWidget/createSection', { parentElement: this.appElement, id: pageId, instanceId: instanceId })
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
    }
  }
}
